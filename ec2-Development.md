## EC2 Deployment

### Overview

The Dublin Bikes Flask web application was deployed on an AWS EC2 Ubuntu instance.

The final deployment uses Flask as the backend framework, Gunicorn as the WSGI server, Nginx as the reverse proxy, and a MySQL/MariaDB database for persistent data.

The deployed application serves the frontend pages, backend API routes, database-backed station data, weather data, and the machine learning prediction endpoint.

### Project Directory

After connecting to the EC2 instance through SSH, the project is located at:

* `~/COMP30830-Project-Group3`

The Python virtual environment can be activated with:

* `source venv/bin/activate`

### Environment Configuration

The application requires API keys and database credentials to be configured locally on EC2.

Required credentials include:

* JCDecaux API key
* OpenWeatherMap API key
* Google Maps API key
* Database host, user, password, and database name
* Flask secret key

Real API keys, database passwords, and secret credentials are not committed to GitHub.

### Running the Application on EC2

The final EC2 deployment uses Gunicorn and Nginx rather than manually running `python app.py`.

Useful service checks:

* `sudo systemctl status bikeapp`
* `sudo systemctl status nginx`

Useful restart commands:

* `sudo systemctl restart bikeapp`
* `sudo systemctl restart nginx`

Useful log checks:

* `sudo journalctl -u bikeapp -n 100 --no-pager`

### Verification

The deployment was verified by checking:

* EC2 instance status
* SSH access to the project directory
* Gunicorn service status
* Nginx service status
* Flask health endpoint
* Public access through the EC2 public IPv4 address
* API JSON responses
* Database connectivity
* Frontend map and station display
* ML prediction file availability and model loading behaviour

Example backend verification:

* `curl http://127.0.0.1:5000/health`

Example socket check:

* `sudo ss -lntp | grep -E ':80|:5000'`

Expected result:

* Nginx listens on port `80`
* Gunicorn/Flask listens internally on `127.0.0.1:5000`

### Main Deployment Checks

The following application functions were checked after deployment:

* Main web application accessible through EC2 public IP
* User login and signup pages available
* Station data returned as JSON
* Current bike availability returned as JSON
* Historical station availability available for frontend charts
* Weather information available for frontend display
* Prediction endpoint connected to the deployed machine learning model
* Gunicorn and Nginx services active

### Notes

During deployment and final integration, the following issues were checked or resolved:

* EC2 SSH access and project directory verification
* Python dependency installation
* Flask service startup issues
* Gunicorn and Nginx runtime configuration
* Database connection debugging
* API endpoint verification
* Missing or incorrect environment variables
* ML model file availability on EC2
* Runtime model loading constraints
* Public IP access to the deployed frontend

The final deployment uses the EC2 production setup rather than running Flask manually through `python app.py` or keeping the application alive with `tmux`.

