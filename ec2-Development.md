## EC2 Deployment (Sprint 2)

### Overview

The Flask application has been successfully deployed on an AWS EC2 instance and is accessible via public IP.

All required endpoints return JSON responses and remain accessible after SSH disconnection (running in background via tmux).

### EC2 Setup

1. SSH into EC2
2. Navigate to project directory:

```bash
cd ~/COMP30830-Project-Group3
```

3. Activate virtual environment:

```bash
source venv/bin/activate
```

4. Set environment variables:

```bash
export JCDECAUX_API_KEY="your_key"
export OPENWEATHER_API_KEY="your_key"
```

5. Start Flask using tmux:

```bash
tmux new -s flask
python3 app.py
```

Detach without stopping the server:

```
Ctrl + B, then D
```

### Verification

The following endpoints were tested successfully:

* `/health`
* `/api/weather/current`
* `/api/stations/current`

Verification method:

```bash
sudo ss -lntp | grep :5000
```

Output confirms Flask is listening on 0.0.0.0:5000.

### Notes

* Resolved 403 error caused by missing JCDecaux API environment variable.
* Resolved port conflict issues on port 5000.
* Ensured background execution using tmux to maintain availability after SSH disconnect.
* Confirmed external accessibility via public EC2 IP.

---


