import requests, json, dbinfo

r = requests.get(
    dbinfo.STATIONS_URL,
    params={"contract": dbinfo.CONTRACT, "apiKey": dbinfo.API_KEY}
)
r.raise_for_status()

stations = r.json()
static = [{
    "number": s["number"],
    "name": s["name"],
    "address": s["address"],
    "lat": s["position"]["lat"],
    "lng": s["position"]["lng"],
    "bike_stands": s["bike_stands"],
    "banking": s["banking"],
    "bonus": s["bonus"]
} for s in stations]

json.dump(static, open("stations_static.json", "w", encoding="utf-8"), indent=2)