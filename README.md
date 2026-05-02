# Dublin Bike Sharing Web Application
Flask based web application for bike sharing in Dublin City, providing real-time city bike data.

## Features
### Bike Stations Data
- Real time bike availability data from JCDecaux API.
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
|---data_for_prediction_model/                  # Contains prediction model
|   |-----bike_availability_model.joblib
|   |-----bike_availability_model.pkl           # Trained model
|   |-----model_features.json                   # Feature order for prediction
|   |-----train_model.py                        # Model training script
|
|---static/                              
|   |-----css/                                  # Custom UI styling
|   |   |-----forms.css
|   |   |-----index.css
|
|   |-----images/ 
|   |   |-----icon.png
|   |   |-----main_image.jpeg
|   |   |-----weather_background.jpeg
|
|   |-----javascript/
|   |   |-----displayBikes.js                   # Renders bike availability
|   |   |-----displayPrediction.js              # Renders bike availability prediction
|   |   |-----displayStations.js                # Displays stations on map
|   |   |-----displayWeather.js                 # Renders weather data
|   |   |-----drawCharts.js                     # Graphs and charts
|   |   |-----eventListeners.js                 # Handles event listeners
|   |   |-----forms.js                          # Signup and login forms
|   |   |-----index.js                          # Initializes Google Map
|   |   |-----infoWindow.js                     # Renders live station information
|   |   |-----searchStationsList.js             # Defines station search function
|   |   |-----toggleMarkers.js                  # Renders live bike availability
|
|---templates/                                  # HTML templates
|   |-----index.html                            # Main HTML document
|   |-----login.html
|   |-----signup.html
|
|---.gitignore
|---app.py                                      # Main Flask application
|---ec2-Development.md                          # AWS EC2 deployment steps
|---Git-Workflow.md                             # Git branching methodology
|---README.md
|___requirements.txt                            # Python dependencies

```
 Frontend code:
 - Javascript, CSS and image files are located within the static/ folder.
 - HTML files are located within the templates/ folder.

 Backend (Flask application):
 - `app.py` contains the main backend code responsible for initiating the application via Flask, retrieving data for frontend use and defining API routes.

 Machine learning model: 
 - `data_for_prediction_model/` folder contains trained model and training script.

 Git Workflow:
 - A Git-Workflow.md file highlights the feature branch git workflow process used throughout the project.

 EC2 Deployment:
 - The EC2 deployment process is described in the `ec2-deployment.md` file.


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
 ```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=your_database

GOOGLE_MAPS_API_KEY=your_google_maps_key
 ```

5. Input JCDecaux and OpenWeatherMap API key into `dbinfo.py`.
```python
API_KEY = "your_JCDecaux_API_key"
OPENWEATHER_KEY = "your_open_weather_API_key"
```

6. Run the application
 ```bash
 python app.py    # windows
 python3 app.py   # macOS / Linux
 ```
 at
 ```
 http://127.0.0.1:5000
 ```

 ## Authentication
 - Access to API routes prohibited without authentication.
 - Users must create account and login before allowed access.
 - Session stored using Flask session cookies.

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








        







