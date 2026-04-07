from flask import Flask, jsonify, request, render_template, g, redirect, session, flash
import os
import pymysql
import datetime
import requests
import dbinfo
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
app.secret_key = "secret key"

def get_db():
    if "db" not in g:
        g.db = pymysql.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user=os.getenv("DB_USER", "root"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME", "local_sep_db"),
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
    return jsonify({"status": "ok", "time": datetime.datetime.now().isoformat()})

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
        "scrape_time": datetime.datetime.now().isoformat(),
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
        "scrape_time": datetime.datetime.now().isoformat(),
        "weather": cleaned
    })



@app.get("/api/stations")
def api_stations():
    sql = """
        SELECT s.number, s.name, s.address, s.lat, s.lng, s.bike_stands, s.banking, a.status, a.available_bikes, a.available_bike_stands
        FROM real_stations s
        JOIN (
            SELECT number, MAX(last_update) AS last_update
            FROM availability
            GROUP BY number
            ) latest
        ON s.number = latest.number
        JOIN availability a
        ON s.number = a.number
        AND a.last_update = latest.last_update
        ORDER BY s.number;
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
    hours = request.args.get("hours", default=48, type=int)

    sql = """
        SELECT avg(available_bikes) AS available_bikes,
               avg(available_bike_stands) AS available_bike_stands,
               DATE_FORMAT(last_update, '%%Y-%%m-%%d %%H:00:00') AS hour_block,
               number
        FROM availability
        WHERE number = %s
        AND last_update >= (
                        SELECT MAX(last_update)
                        FROM availability
                        WHERE number = %s
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
    


@app.route("/", methods=["GET", "POST"])
def signup():

    try_again = None

    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

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
                try_again = "Username already taken, please try again."
                return render_template("signup.html", try_again=try_again)

            else:
                hash_pw = generate_password_hash(password)
                cur.execute(sql2, (username, hash_pw,))
                return redirect("/login")
            
    return render_template("signup.html", try_again=try_again)



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
            return redirect("/main")
        
        elif user:
            wrong_pw = "The password you've entered is incorrect."
            return render_template("login.html", wrong_pw=wrong_pw, username=username)
        
        else:
            wrong_cred = "The login information you've entered is incorrect"
            return render_template("login.html", wrong_cred=wrong_cred)
        
    return render_template("login.html")


@app.route("/main")
def main():

    if "user_id" not in session:
        return redirect("/") 
    
    return render_template("index.html", apikey="AIzaSyA-0piAbx0AlafzuLIPZTfDT00ETq5-N18", title = "Home Page")


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)


