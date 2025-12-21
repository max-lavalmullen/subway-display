# NYC Subway Time Display (MTA) 🚇

A Python-based application that fetches real-time MTA subway arrivals and displays them on a 64x32 RGB LED Matrix connected to a Raspberry Pi. It includes a web-based simulator for local development and testing without the hardware.

## 🌟 Features

*   **Real-time Tracking:** Fetches live data from the MTA GTFS-Realtime feed.
*   **Split Layout:** Displays the top 2 trains prominently on the left, with a compact list of upcoming arrivals on the right.
*   **Web Simulator:** View the matrix output in your browser for easy debugging.
*   **Hardware Ready:** Designed to drive an Adafruit RGB Matrix Bonnet + 64x32 HUB75 LED Matrix.
*   **Configurable:** Easily change stations, directions, brightness, and refresh rates.

## 🛠 Hardware Requirements

1.  **Raspberry Pi** (Model 3B+ or 4 recommended).
2.  **Adafruit RGB Matrix Bonnet** for Raspberry Pi.
3.  **64x32 RGB LED Matrix** (HUB75 interface).
4.  **5V 4A+ Power Supply** (powering the HAT/Matrix directly is recommended).

## 📦 Software Prerequisites

*   Python 3.7+
*   `hzeller/rpi-rgb-led-matrix` library (for Raspberry Pi usage).

## 🚀 Development Setup (Mac/PC)

These steps are for running the **simulator** on your local machine. For Raspberry Pi deployment, skip to the [Raspberry Pi Deployment](#-raspberry-pi-deployment) section.

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/subway-project.git
cd subway-project
```

### 2. Configure the App
Copy the example configuration file and edit it with your station details.
```bash
cp config.py.example config.py
```
*   **TARGET_STATION_ID:** Search `stations.py` for your stop's ID.
*   **DIRECTION:** `N` for Uptown, `S` for Downtown.

### 3. Install Dependencies (Local Simulator)
If you want to run the web simulator on your computer:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 app.py
```

#### Finding Your Station ID
The project includes a `stations.py` file containing all NYC Subway station IDs. You can search this file to find the ID for your stop.

**Example: Finding "Union Square"**
```bash
grep "Union Sq" stations.py
# Output: "635": "14 St-Union Sq", ...
```
Copy the ID (e.g., `635`) into your `config.py`.

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
ssh pi@<your-pi-ip>
cd subway_app
./start.sh
```

*Note: The first run might take a minute to install dependencies.*

## 📂 Project Structure

*   **`app.py`**: Main entry point for the **Web Simulator**. Runs a Flask server.
*   **`main.py`**: Entry point for the **Raspberry Pi**. Drives the physical LED Matrix.
*   **`mta_client.py`**: Handles logic for fetching, parsing, and paging MTA GTFS data.
*   **`config.py`**: Central configuration file.
*   **`stations.py`**: Dictionary lookup for all NYC Subway station IDs.
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
