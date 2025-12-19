# NYC Subway Time Display (MTA) 🚇

A Python-based application that fetches real-time MTA subway arrivals and displays them on a 64x32 RGB LED Matrix connected to a Raspberry Pi. It includes a web-based simulator for local development and testing without the hardware.

## 🌟 Features

*   **Real-time Tracking:** Fetches live data from the MTA GTFS-Realtime feed.
*   **Pagination:** Cycles through upcoming train arrivals (2 per screen).
*   **Web Simulator:** View the matrix output in your browser for easy debugging.
*   **Hardware Ready:** Designed to drive an Adafruit RGB Matrix Bonnet + 64x32 HUB75 LED Matrix.
*   **Configurable:** Easily change stations, directions, and refresh rates.

## 🛠 Hardware Requirements

1.  **Raspberry Pi** (Model 3B+ or 4 recommended).
2.  **Adafruit RGB Matrix Bonnet** for Raspberry Pi.
3.  **64x32 RGB LED Matrix** (HUB75 interface).
4.  **5V 4A+ Power Supply** (powering the HAT/Matrix directly is recommended).

## 📦 Software Prerequisites

*   Python 3.7+
*   `hzeller/rpi-rgb-led-matrix` library (for Raspberry Pi usage).

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/subway-project.git
cd subway-project
```

### 2. Install Python Dependencies
It is recommended to use a virtual environment.
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Configure the Station
Edit `config.py` to set your desired station and direction.
*   **TARGET_STATION_ID:** Find your station ID in the [MTA GTFS Static Data](http://web.mta.info/developers/data/nyct/subway/Stations.csv) (e.g., `120` for 96 St).
*   **DIRECTION:** `N` for Northbound, `S` for Southbound.

```python
TARGET_STATION_ID = "120" 
DIRECTION = "N"
```

## 🖥 Local Development (Simulator)

You can run the web simulator on your Mac/PC to test the logic and layout.

1.  **Run the App:**
    ```bash
    python3 app.py
    ```
2.  **Open Browser:**
    Navigate to `http://localhost:5001`.
    
    *Note: The simulator visualizes the 64x32 grid using HTML/CSS.*

## 🍓 Raspberry Pi Deployment

### 1. Prerequisites on the Pi
Ensure your Raspberry Pi is set up and accessible via SSH. You will need to install the RGB Matrix bindings:

```bash
# Example for installing hzeller/rpi-rgb-led-matrix bindings
curl https://raw.githubusercontent.com/adafruit/Raspberry-Pi-Installer-Scripts/master/rgb-matrix.sh > rgb-matrix.sh
sudo bash rgb-matrix.sh
```

### 2. Upload Code
Use the included script to upload files to your Pi.
*   Edit `upload.sh` to update your Pi's IP address if necessary.
*   Run the script:

```bash
bash upload.sh
```

### 3. Run on Pi
SSH into your Pi and run the start script. This handles all dependency installation (venv) automatically.

```bash
ssh maxpi@<your-pi-ip>
cd subway_app
./start.sh
```

*Note: The first run might take a minute to install dependencies.*

## 📂 Project Structure

*   **`app.py`**: Main entry point for the **Web Simulator**. Runs a Flask server.
*   **`main.py`**: Entry point for the **Raspberry Pi**. Drives the physical LED Matrix.
*   **`mta_client.py`**: Handles logic for fetching, parsing, and paging MTA GTFS data.
*   **`config.py`**: Central configuration file.
*   **`upload.sh`**: Utility script to deploy code to the Pi via SCP.
*   **`start.sh`**: Helper script for the Pi that creates the virtual environment, installs dependencies, and runs the app.

## 🤝 Contributing

1.  Fork the project.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
