try:
    from dbinfo_local import *
except ImportError:
    pass

STATIONS_URL = "https://api.jcdecaux.com/vls/v1/stations"
API_KEY = "3fc6b50e1866c9ea8676cd4ad22a5a6576bf2c23"
CONTRACT = "dublin"

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"
OPENWEATHER_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
OPENWEATHER_KEY = "0c8c3586bebde3b81f2c988dafba1a52"
LAT = 53.3497
LON = -6.2603
