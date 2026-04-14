from flask import Flask, request, jsonify
from datetime import datetime
import pickle, json, pandas as pd

# ── Load model and feature list once at startup ───────────────────
with open("bike_availability_model.pkl", "rb") as f:
    model = pickle.load(f)

with open("model_features.json") as f:
    FEATURES = json.load(f)["features"]

# ── Weather stub (replace with real OpenWeather API call) ─────────
def fetch_openweather_forecast(date):
    """
    TODO: replace this stub with a real OpenWeather API call.
    It should return a dict with at least:
      temperature (°C), humidity (%), pressure (hPa)
    for the given date.
    """
    return {
        "temperature": 10.0,   # average °C
        "humidity":    80.0,   # average %
        "pressure":    1013.0, # average hPa
    }

# ── Flask app ─────────────────────────────────────────────────────
app = Flask(__name__)

@app.route("/predict", methods=["GET"])
def predict():
    try:
        # 1. Read query parameters
        date       = request.args.get("date")        # e.g. 2025-04-06
        time       = request.args.get("time")        # e.g. 09:00:00
        station_id = request.args.get("station_id")  # e.g. 32

        if not date or not time or not station_id:
            return jsonify({"error": "Missing date, time, or station_id parameter"}), 400

        # 2. Parse date/time → features
        dt          = datetime.strptime(f"{date} {time}", "%Y-%m-%d %H:%M:%S")
        hour        = dt.hour
        day_of_week = dt.weekday()   # 0=Monday … 6=Sunday
        month       = dt.month
        is_weekend  = 1 if day_of_week >= 5 else 0

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


if __name__ == "__main__":
    app.run(debug=True)
