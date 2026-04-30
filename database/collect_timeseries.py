import os
import time
import json
import traceback
from datetime import datetime, timezone

import requests
import dbinfo


# --------- Settings ---------
BIKES_OUT = "bikes_timeseries.jsonl"
WEATHER_OUT = "weather_timeseries.jsonl"

BIKE_INTERVAL_SECONDS = 5 * 60          # bikes every 5 minutes
WEATHER_EVERY_N_BIKE_LOOPS = 12         # weather every 12 loops => 60 minutes

REQUEST_TIMEOUT = 30


# --------- Helpers ---------
def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def append_jsonl(filepath: str, record: dict) -> None:
    # JSONL: one JSON object per line (DB-friendly, appendable, crash-safe)
    with open(filepath, "a", encoding="utf-8") as f:
        f.write(json.dumps(record, ensure_ascii=False) + "\n")


def fetch_bikes_json() -> list[dict]:
    r = requests.get(
        dbinfo.STATIONS_URL,
        params={
            "apiKey": dbinfo.API_KEY,
            "contract": dbinfo.CONTRACT
        },
        timeout=REQUEST_TIMEOUT
    )
    r.raise_for_status()
    data = r.json()
    if not isinstance(data, list):
        raise TypeError(f"JCDecaux /stations expected list, got {type(data)}")
    return data


def fetch_weather_json() -> dict:
    r = requests.get(
        dbinfo.OPENWEATHER_URL,
        params={
            "lat": dbinfo.LAT,
            "lon": dbinfo.LON,
            "appid": dbinfo.OPENWEATHER_KEY,
            "units": "metric"
        },
        timeout=REQUEST_TIMEOUT
    )
    r.raise_for_status()
    data = r.json()
    if not isinstance(data, dict):
        raise TypeError(f"OpenWeather expected dict, got {type(data)}")
    return data


def reduce_station_snapshot(st: dict, scrape_time_utc: str) -> dict:
    """
    DB-friendly dynamic snapshot.
    Keep only what's needed for availability time series.
    """
    return {
        "scrape_time_utc": scrape_time_utc,          # when YOU scraped it (UTC ISO string)
        "station_id": st.get("number"),
        "available_bikes": st.get("available_bikes"),
        "available_bike_stands": st.get("available_bike_stands"),
        "status": st.get("status"),
        "last_update_ms": st.get("last_update"),     # JCDecaux timestamp in ms
    }


def reduce_weather_snapshot(w: dict, scrape_time_utc: str) -> dict:
    main = w.get("main") or {}
    wind = w.get("wind") or {}
    weather_list = w.get("weather") or []
    weather0 = weather_list[0] if weather_list else {}

    return {
        "scrape_time_utc": scrape_time_utc,
        "dt_utc_s": w.get("dt"),                     # OpenWeather timestamp in seconds
        "city": w.get("name"),
        "temp": main.get("temp"),
        "feels_like": main.get("feels_like"),
        "humidity": main.get("humidity"),
        "pressure": main.get("pressure"),
        "wind_speed": wind.get("speed"),
        "wind_deg": wind.get("deg"),
        "weather_main": weather0.get("main"),
        "weather_desc": weather0.get("description"),
    }


def main():
    print("Collector started.")
    print(f"- bikes: every {BIKE_INTERVAL_SECONDS}s")
    print(f"- weather: every {WEATHER_EVERY_N_BIKE_LOOPS} bike loops (~{WEATHER_EVERY_N_BIKE_LOOPS * BIKE_INTERVAL_SECONDS // 60} mins)")
    print(f"- output: {BIKES_OUT}, {WEATHER_OUT}")
    print("Press Ctrl+C to stop.\n")

    loop_count = 0

    while True:
        start = time.time()
        scrape_time = utc_now_iso()

        try:
            # -------- Bikes (every loop) --------
            stations = fetch_bikes_json()
            for st in stations:
                append_jsonl(BIKES_OUT, reduce_station_snapshot(st, scrape_time))
            print(f"wrote bikes ({len(stations)} stations) at {scrape_time}")

            # -------- Weather (every N loops) --------
            if loop_count % WEATHER_EVERY_N_BIKE_LOOPS == 0:
                w = fetch_weather_json()
                append_jsonl(WEATHER_OUT, reduce_weather_snapshot(w, scrape_time))
                print(f"wrote weather at {scrape_time}")

            loop_count += 1

        except KeyboardInterrupt:
            print("\nStopped by user (KeyboardInterrupt).")
            break
        except Exception:
            print("ERROR:\n" + traceback.format_exc())

        # sleep remaining time to keep a stable 5-min rhythm
        elapsed = time.time() - start
        sleep_for = max(0, BIKE_INTERVAL_SECONDS - elapsed)
        time.sleep(sleep_for)


if __name__ == "__main__":
    main()
