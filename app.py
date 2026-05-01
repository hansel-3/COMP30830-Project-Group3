from flask import Flask, jsonify, request, render_template, g, redirect, session
import os
import pymysql
from datetime import timedelta, datetime
import requests
from database import dbinfo
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
import pickle
import json
import pandas as pd

load_dotenv()

app = Flask(__name__)

app.secret_key = "secret key"

def get_db():
    if "db" not in g:
        g.db = pymysql.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME"),
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True,
        )
    return g.db

@app.teardown_appcontext
def close_db(_exc):
    db = g.pop("db", None)
    if db is not None:
        db.close()

def fetch_bikes_json():
    r = requests.get(
        dbinfo.STATIONS_URL,
        params={"apiKey": dbinfo.API_KEY, "contract": dbinfo.CONTRACT},
        timeout=30
    )
    r.raise_for_status()
    return r.json()  # list[dict]

def fetch_weather_json():
    r = requests.get(
        dbinfo.OPENWEATHER_URL,
        params={
            "lat": dbinfo.LAT,
            "lon": dbinfo.LON,
            "appid": dbinfo.OPENWEATHER_KEY,
            "units": "metric"
        },
        timeout=30
    )
    r.raise_for_status()
    return r.json()  # dict

@app.route("/health")
def health():
    return jsonify({"status": "ok", "time": datetime.now().isoformat()})

@app.route("/api/external/jcdecaux/current")
def external_stations_current():
    
    raw = fetch_bikes_json()

    cleaned = []

    for s in raw:
        cleaned.append({
            "station_id": s["number"],
            "name": s["name"],
            "lat": s["position"]["lat"],
            "lng": s["position"]["lng"],
            "available_bikes": s["available_bikes"],
            "available_stands": s["available_bike_stands"],
            "status": s["status"]
        })

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"})

    return jsonify({
        "scrape_time": datetime.now().isoformat(),
        "stations": cleaned
    })

@app.route("/api/external/weather/current")
def external_weather_current():
    
    w = fetch_weather_json()

    cleaned = {
        "lat": w.get("coord", {}).get("lat"),
        "lon": w.get("coord", {}).get("lon"),
        "timezone": w.get("timezone"),
        "dt": w.get("dt"),
        "location_name": w.get("name"),
        "country": w.get("sys", {}).get("country"),
        "temp": w.get("main", {}).get("temp"),
        "feels_like": w.get("main", {}).get("feels_like"),
        "humidity": w.get("main", {}).get("humidity"),
        "pressure": w.get("main", {}).get("pressure"),
        "wind_speed": w.get("wind", {}).get("speed"),
        "wind_deg": w.get("wind", {}).get("deg"),
        "weather_main": (w.get("weather") or [{}])[0].get("main"),
        "weather_desc": (w.get("weather") or [{}])[0].get("description"),
    }

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"})

    return jsonify({
        "scrape_time": datetime.now().isoformat(),
        "weather": cleaned
    })

@app.route("/api/weather/history")
def weather_history():
    sql = """
            SELECT avg(temp) as temp,
                   avg(humidity) as humidity,
                   avg(wind_speed) as wind_speed,
                   DATE_FORMAT(scrape_time, '%Y-%m-%d') AS day_block
            FROM weather
            GROUP BY day_block;
        """
    
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"})
    
    db = get_db()
    with db.cursor() as cur:
        cur.execute(sql)
        return jsonify(cur.fetchall())

@app.get("/api/stations")
def api_stations():
    sql = """
        SELECT number, name, address, lat, lng, bike_stands, banking
        FROM real_stations
        ORDER BY number;
    """

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"})
    
    db = get_db()
    with db.cursor() as cur:
        cur.execute(sql)
        return jsonify(cur.fetchall())

@app.get("/api/stations/<int:station_id>/current")
def api_stations_current(station_id: int):
    sql = """
        SELECT a.number,
               a.available_bikes,
               a.available_bike_stands,
               a.last_update,
               a.status
        FROM availability a
        JOIN (
            SELECT number, MAX(last_update) AS last_update
            FROM availability
            GROUP BY number
        ) latest
        ON a.number = latest.number AND a.last_update = latest.last_update
        WHERE a.number = %s
        ORDER BY a.number;
    """
    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"})
    
    db = get_db()
    with db.cursor() as cur:
        cur.execute(sql, (station_id,))
        return jsonify(cur.fetchall())

@app.get("/api/stations/<int:station_id>/history")
def api_station_history(station_id: int):
    hours = request.args.get("hours", default=36, type=int)

    sql = """
        SELECT avg(available_bikes) AS available_bikes,
               avg(available_bike_stands) AS available_bike_stands,
               DATE_FORMAT(last_update, '%%Y-%%m-%%d %%H:00:00') AS hour_block,
               number
        FROM availability
        WHERE number = %s
        AND last_update <= '2026-02-13 23:59:59'
        AND last_update >= (
                        SELECT MAX(last_update)
                        FROM availability
                        WHERE number = %s
                        AND last_update <= '2026-02-13 23:59:59'
                        ) - INTERVAL %s HOUR
        GROUP BY hour_block
        ORDER BY hour_block;
    """

    if "user_id" not in session:
        return jsonify({"error": "Unauthorized"})

    db = get_db()
    with db.cursor() as cur:
        cur.execute(sql, (station_id, station_id, hours,))
        return jsonify(cur.fetchall())
    
# ── Load model and feature list once at startup ───────────────────
with open("data_for_prediction_model/bike_availability_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("data_for_prediction_model/model_features.json") as f:
    FEATURES = json.load(f)["features"]

def fetch_openweather_forecast(date):
    r = requests.get(
        dbinfo.OPENWEATHER_FORECAST_URL,
        params = {
            "lat": dbinfo.LAT,
            "lon": dbinfo.LON,
            "appid": dbinfo.OPENWEATHER_KEY,
            "units":"metric"
        },
        timeout=30
    )
    r.raise_for_status()

    forecast_json = r.json()
    forecast_list = forecast_json["list"]

    temp = 0
    humidity = 0
    pressure = 0

    count = 0
    timestamps = []
    for i in forecast_list:
        if date in i["dt_txt"]:
            temp += i["main"]["temp"]
            humidity += i["main"]["humidity"]
            pressure += i["main"]["pressure"]
            count += 1
        timestamps.append(i["dt_txt"])
    
    date_not_found = False
    for i in timestamps:
        if date not in i:
            date_not_found = True
    
    if date_not_found == True:
        temp += forecast_list[0]["main"]["temp"]
        humidity += forecast_list[0]["main"]["humidity"]
        pressure += forecast_list[0]["main"]["pressure"]
        count += 1

    if count == 0:
        return None

    avg_temp = temp / count
    avg_humidity = humidity / count
    avg_pressure = pressure / count

    return {
        "temperature": avg_temp,
        "humidity": avg_humidity,
        "pressure": avg_pressure
    }

@app.route("/predict", methods=["GET"])
def predict():
    try:
        # 1. Read query parameters
        date       = request.args.get("date")       # e.g. 2025-04-06
        time       = request.args.get("time")        # e.g. 09:00:00
        station_id = request.args.get("station_id")  # e.g. 32

        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"})

        if not date or not time or not station_id:
            return jsonify({"error": "Missing date, time, or station_id parameter"}), 400
        
        invalid_stations = ["34", "46", "81"]
        if station_id in invalid_stations or not(1 <= int(station_id) <= 117):
            return jsonify({"error": "Invalid station number entry. This station does not exist."}), 400
            
        # 2. Parse date/time → features
        dt          = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M:%S")
        hour        = dt.hour
        day_of_week = dt.weekday()   # 0=Monday … 6=Sunday
        month       = dt.month
        is_weekend  = 1 if day_of_week >= 5 else 0

        base = datetime.now()

        if base.minute > 0:
            base = base.replace(minute=0, second=0, microsecond=0) + timedelta(hours=1)
        else:
            base = base.replace(second=0, microsecond=0)
        
        limit = base + timedelta(days = 5) - timedelta(hours = 1)

        if not (base <= dt <= limit):
            return jsonify({"error": "Invalid date entry"}), 400
        
        # 3. Get weather data for that date
        weather = fetch_openweather_forecast(date)

        # 4. Build input DataFrame — column order must match training
        input_df = pd.DataFrame([{
            "station_id":  int(station_id),
            "temperature": weather["temperature"],
            "humidity":    weather["humidity"],
            "pressure":    weather["pressure"],
            "hour":        hour,
            "day_of_week": day_of_week,
            "is_weekend":  is_weekend,
            "month":       month,
        }])[FEATURES]   # reorder to match exact training order

        # 5. Predict and return
        prediction = model.predict(input_df)[0]
        return jsonify({
            "predicted_available_bikes": round(float(prediction), 1),
            "station_id":  int(station_id),
            "date":        date,
            "time":        time,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/", methods=["GET", "POST"])
def signup():

    user_taken = None
    pw_short = None
    
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"].strip()

        sql1 = """
                SELECT * FROM users WHERE username = %s;
            """
        
        sql2 = """
                INSERT INTO users (username, password)
                VALUES (%s, %s);
            """

        db = get_db()
        with db.cursor() as cur:
            cur.execute(sql1, (username,))
            existing = cur.fetchone()

            if existing:
                user_taken = "Username already taken, please try again."
                return render_template("signup.html", user_taken=user_taken)
            
            elif len(password) < 8:
                pw_short = "Password must be at least 8 characters."
                return render_template("signup.html", pw_short=pw_short)

            else:
                hash_pw = generate_password_hash(password)
                cur.execute(sql2, (username, hash_pw,))
                return redirect("/login")
            
    return render_template("signup.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    
    wrong_cred = None
    wrong_pw = None

    if request.method =="POST":
        username = request.form["username"]
        password = request.form["password"]

        sql = """
                SELECT * FROM users WHERE username = %s;
            """
        
        db = get_db()
        with db.cursor() as cur:
            cur.execute(sql, (username,))
            user = cur.fetchone()

        if user and check_password_hash(user["password"], password):
            session["user_id"] = user["username"]
            return redirect("/home")
        
        elif user:
            wrong_pw = "The password you've entered is incorrect."
            return render_template("login.html", wrong_pw=wrong_pw, username=username)
        
        else:
            wrong_cred = "The login information you've entered is incorrect."
            return render_template("login.html", wrong_cred=wrong_cred)
        
    return render_template("login.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@app.route("/home")
def main():
    if "user_id" not in session:
        return redirect("/") 
    
    return render_template("index.html", apikey=os.getenv("GOOGLE_MAPS_API_KEY"), title="Home Page")

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)


