from flask import Flask, jsonify, request
import datetime
import requests
import dbinfo

app = Flask(__name__)

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

@app.route("/api/stations/current")
def stations_current():
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

@app.route("/api/weather/current")
def weather_current():
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

@app.route("/api/stations/<int:station_id>/history")
def station_history(station_id: int):
    hours = request.args.get("hours", default=24, type=int)

    return jsonify({
        "station_id": station_id,
        "hours": hours,
        "rows": [],
        "note": "stub: DB query not implemented yet"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

