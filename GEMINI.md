# Project: NYC Subway Time Display (MTA)
**Hardware:** Raspberry Pi 4 Model B (4GB)
**OS:** Raspberry Pi OS (Desktop) running headless.
**Display:** Adafruit RGB Matrix Bonnet + 64x32 HUB75 LED Matrix.
**Network:** Connected via Wi-Fi.

# Architecture
- **Language:** Python 3 (Virtual Env: venv).
- **Web Framework:** Flask (Port 5001).
- **Data Source:** MTA GTFS-Realtime Public Feed (No API Key).
- **Files:**
  - `app.py`: Main Flask entry point (Web Simulator + JSON API).
  - `mta_client.py`: Handles GTFS data fetching, caching, and pagination logic.
  - `config.py`: Configuration constants (Station ID, Refresh Rates, etc.).
  - `upload.sh`: Deploys all files to the Pi via SCP.
- **Deployment:** Edited locally on Mac, uploaded via `upload.sh`.

# Current State
- **Station:** 96 St (1/2/3 Lines) - Uptown (`120` + `N`).
- **Visuals:** "RideOnTime" style (Red circle icons for lines 1/2/3).
- **Simulator:** Web-based simulator at `http://localhost:5001`.
- **Logic:** Fetches top 6 trains, cycles through them in pages of 2 every 5 seconds.
- **Development:** Flask Debug Mode is ON (`debug=True`). Codebase refactored into modular files (`app`, `config`, `client`) for better auto-reload support.

# Constraints
- Audio is disabled in `/boot/firmware/config.txt` to prevent matrix flickering.
- Must run as `root` (sudo) when driving the matrix hardware (future step).
- **Port:** Uses 5001 to avoid macOS AirPlay conflict on 5000.

# Next Steps
1. Deploy to Raspberry Pi and verify hardware integration.
2. Adapt `app.py` or create `main.py` to drive the actual RGB Matrix using the `rgbmatrix` library.
