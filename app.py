from flask import Flask, jsonify, request, render_template
import os
import pymysql
from flask import g
import datetime
import requests
import dbinfo

app = Flask(__name__)

def get_db():
    if "db" not in g:
        g.db = pymysql.connect(
            host=os.getenv("DB_HOST", "127.0.0.1"),
            user=os.getenv("DB_USER", "bikeapp"),
            password=os.getenv("DB_PASSWORD"),
            database=os.getenv("DB_NAME", "local_databasejcdecaux"),
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

    return jsonify({
        "scrape_time": datetime.datetime.now().isoformat(),
        "weather": cleaned
    })



@app.get("/api/stations")
def api_stations():
    sql = """
        SELECT number, name, address, lat, lng, bike_stands, banking
        FROM real_stations
        ORDER BY number;
    """
    db = get_db()
    with db.cursor() as cur:
        cur.execute(sql)
        return jsonify(cur.fetchall())


@app.get("/api/stations/current")
def api_stations_current():
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
        ORDER BY a.number;
    """
    db = get_db()
    with db.cursor() as cur:
        cur.execute(sql)
        return jsonify(cur.fetchall())


@app.get("/api/stations/<int:station_id>/history")
def api_station_history(station_id: int):
    hours = request.args.get("hours", default=48, type=int)

    sql = """
        SELECT number,
               available_bikes,
               available_bike_stands,
               last_update
        FROM availability
        WHERE number = %s
          AND last_update >= (
                SELECT MAX(last_update)
                FROM availability
                WHERE number = %s
              ) - INTERVAL %s HOUR
        ORDER BY last_update ASC;
    """

    db = get_db()
    with db.cursor() as cur:
        cur.execute(sql, (station_id, station_id, hours))
        return jsonify(cur.fetchall())
    
@app.route("/")
def main():
    return render_template("index.html", apikey="AIzaSyA-0piAbx0AlafzuLIPZTfDT00ETq5-N18", title = "Home Page")


@app.route("/available/<int:station_id>")
def get_availability(station_id):
    db = get_db()

    hours = request.args.get("hours", default=48, type=int)

    sql = """
        SELECT 
            a.available_bikes,
            a.number,
            a.available_bike_stands,
            a.last_update
        FROM availability a
        WHERE a.number = %s
        AND  last_update >= (
            SELECT MAX(last_update)
            FROM availability
            WHERE number = %s) - INTERVAL %s HOUR
        ORDER BY last_update ASC; 
        """ # check if datetime/timestamp

    with db.cursor() as cursor:
        cursor.execute(sql, (station_id,station_id, hours))
        rows = cursor.fetchall()

    for row in rows:
        row["last_update"] = row["last_update"].isoformat()

    return jsonify(rows)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
