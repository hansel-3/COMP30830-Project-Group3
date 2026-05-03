# Dublin Bike Sharing Web Application
Flask-based web application for bike sharing in Dublin City, providing real-time city bike data.

## Features
### Bike Stations Data
- Real-time bike availability data from JCDecaux API.
- Displayed on interactive map.
- Historical bike availability data.

### Weather Data
- Live weather information.
- Historical weather information from extrenal database.

### Bike Forecast Prediction
- Uses trained model to predict bike availability for a given time.

## Tech Stack
- Frontend: Javascript, HTML, CSS.
- Backend: Python (Flask).
- Security: Werkzeug (Password Hashing).
- Database: MySQL (PyMySQL).

## Directory Structure
```text
root/
|
|---for_database/                            
|---|-----collect_timeseries.py                     # JCDecaux & OpenWeatherMap web scraper
|---|-----dbinfo.py                                 # JCDecaux & OpenWeatherMap information
|---|-----export_static_stations.py                 # Collects station information
|---|-----static_stations.json                      # Stores station information
|
|---generative_ai/                                  # Gen AI documents for each collaborator    
|---|-----Yuetong_Generative_AI_Chat_Document.md
| 
|---prediction-model/                           
|   |-----bike_availability_model.joblib            # Trained model alternative format
|   |-----bike_availability_model.pkl               # Trained model
|   |-----model_features.json                       # Feature order for prediction
|   |-----train_model.py                            # Model training script
|
|---static/                              
|   |-----css/                                      # Custom UI styling
|   |   |-----forms.css
|   |   |-----index.css
|
|   |-----images/ 
|   |   |-----icon.png
|   |   |-----main_image.jpeg
|   |   |-----weather_background.jpeg
|
|   |-----javascript/
|   |   |-----displayBikes.js                       # Renders bike availability
|   |   |-----displayPrediction.js                  # Renders bike availability prediction
|   |   |-----displayStations.js                    # Displays stations on map
|   |   |-----displayWeather.js                     # Renders weather data
|   |   |-----drawCharts.js                         # Graphs and charts
|   |   |-----eventListeners.js                     # Handles event listeners
|   |   |-----index.js                              # Initializes Google Map
|   |   |-----infoWindow.js                         # Renders live station information
|   |   |-----login.js                              # Login form logic
|   |   |-----searchStationsList.js                 # Defines station search function
|   |   |-----signup.js                             # Signup form logic
|   |   |-----toggleMarkers.js                      # Renders live bike availability
|
|---templates/                                      # HTML templates
|   |-----index.html                                # Main HTML document
|   |-----login.html
|   |-----signup.html
|
|---.gitignore
|---app.py                                         # Main Flask application
|---ec2-Development.md                             # AWS EC2 deployment steps
|---Git-Workflow.md                                # Git branching methodology
|---README.md
|___requirements.txt                               # Python dependencies
```
 Frontend code:
 - Javascript, CSS and image files are located within the static/ folder.
 - HTML files are located within the templates/ folder.

 Backend (Flask application):
 - `app.py` contains the main backend code responsible for initiating the application via Flask, retrieving data for frontend use and defining API routes.

 Machine learning model: 
 - `prediction-model/` folder contains trained model and training script.

 Git Workflow:
 - A Git-Workflow.md file highlights the feature branch git workflow process used throughout the project.

 EC2 Deployment:
 - The EC2 deployment process is described in the `ec2-Development.md` file.


 ## Setup Instructions  
Prerequisites:
 - API key for Google Maps, JCDecaux, OpenWeatherMap.
 - MySQL Database instance containing tables `real_stations`, `availability`, `weather` and `users`.

 To run this application locally:  
 
 1. Clone the repository
 ```bash
 git clone https://github.com/hansel-3/COMP30830-Project-Group3.git
 ```
 2. Open project folder
 ```bash
 cd COMP30830-Project-Group3
 ```
 3. Install dependencies
 ```bash
 pip install -r requirements.txt
 ```
4. Set up environment variables.

Create a `.env` file in the project root:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database
DB_PORT=3306

SECRET_KEY=your_flask_secret_key

GOOGLE_MAPS_API_KEY=your_google_maps_key
JCDECAUX_API_KEY=your_jcdecaux_key
OPENWEATHER_API_KEY=your_openweather_key
```

Real API keys, database passwords and secret credentials should not be committed to GitHub.

5. Configure local API credentials if required.

Some data collection scripts may also read credentials from `for_database/dbinfo.py`. This file should be created locally based on the project configuration format:

```python
API_KEY = "your_JCDecaux_API_key"
OPENWEATHER_KEY = "your_OpenWeatherMap_API_key"
```

Do not commit real API keys or database credentials.

6. Run the application
 ```bash
 python app.py    # windows
 python3 app.py   # macOS / Linux
 ```
 at
 ```
 http://127.0.0.1:5000
 ```

## Data Collection

The data collection scripts are located in the `for_database/` folder.

To collect data, run:
- `cd for_database`
- `python collect_timeseries.py`
- `python export_static_stations.py`

`collect_timeseries.py` collects dynamic bike availability data from the JCDecaux API and weather data from OpenWeatherMap.

`export_static_stations.py` collects and exports static station information used by the frontend map.

The collected data is stored in the MySQL database and is used by the Flask backend to support station display, availability history, weather display and prediction.



## Main Flask Routes / API Endpoints

The Flask backend defines routes for page rendering, user authentication, station data, weather data and bike availability prediction.

Main routes used by the application:

* `/` displays the main map page.
* `/login` displays the login page and handles user login.
* `/signup` displays the signup page and handles user registration.
* `/logout` ends the current user session.
* `/api/stations` returns static Dublin Bikes station information.
* `/api/stations/current` returns the latest bike availability data.
* `/api/stations/<station_id>/history` returns historical availability data for a selected station.
* `/api/weather` returns weather data for display.
* `/predict` returns predicted bike availability for a selected station, date and time.
* `/health` is used as a health-check endpoint for deployment testing.

The frontend JavaScript files use these routes to request data from the Flask backend and update the map, station information, charts, weather display and prediction result.

## Database Tables

The application uses a MariaDB/MySQL database named `local_databasejcdecaux`.

The database contains the following tables:

- `real_stations`: stores static Dublin Bikes station information, including station number, name, address, latitude, longitude, bike stand capacity and banking information.
- `availability`: stores dynamic bike availability records collected over time, including available bikes, available bike stands, station status and update time.
- `weather`: stores weather records used for weather display and prediction support.
- `users`: stores registered user information for authentication.

The deployed database was verified on EC2. At the time of verification, `real_stations` contained 115 station records and `availability` contained 43,683 availability records.

The Flask backend queries these tables to support map display, station lookup, current bike availability, historical availability charts, weather information and user authentication.

## Machine Learning Prediction

The machine learning files are stored in the `prediction-model/` folder.

The deployed prediction model is a `DecisionTreeRegressor`.

The prediction target is `num_bikes_available`, which represents the number of available bikes at a selected station.

The model uses eight input features:

- `station_id`
- `temperature`
- `humidity`
- `pressure`
- `hour`
- `day_of_week`
- `is_weekend`
- `month`

The feature order is defined in `model_features.json` to keep training and inference consistent.

The trained model is stored as `bike_availability_model.pkl` and `bike_availability_model.joblib`. The `train_model.py` script contains the model training process.

Although the Random Forest model achieved slightly better accuracy, it was not used for deployment because its file size was too large for the EC2 environment. The deployed Decision Tree model was selected because it provided a practical balance between prediction accuracy and deployment size.

The Flask `/predict` endpoint prepares the required feature vector, loads the trained model and returns the predicted bike availability to the frontend as JSON.
 ## Authentication
 - Access to API routes is prohibited without authentication.
 - Users must create an account and log in before access is allowed.
 - Sessions are stored using Flask session cookies.
   
 ## Code Reuse
 This project makes use of several libraries, open sourced tools and external APIs.  

### Frameworks & Libraries
 - Flask: Backend engine for application.
 - Werkzeug: For secure password hashing, following modern standards.
 - PyMySQL: Implemented to handle database transactions consistently.
 - Pandas & Scikit-learn: Reused throughout the data pipeline from model training to the real-time feature engineering required for the /predict endpoint.

### API Integration
 - JCDecaux API: Retrieves real-time bike and station data.
 - OpenWeatherMap API: Live weather data and 3-hour 5-day forecast used for bike availability prediction.
 - Google Maps API: Provides the visual interface.

### Design Patterns & Internal Reuse
 - get_db() ensures that the app reuses a single database connection per request. This was optimized by Flask’s @app.teardown_appcontext.
 - Session-based user authentication using Flask.








        







