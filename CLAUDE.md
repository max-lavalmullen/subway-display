# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Local development (web simulator)
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python3 app.py
# Open http://localhost:5001

# Deploy to Raspberry Pi
bash upload.sh
ssh pi@<ip> && cd subway_app && ./start.sh
```

## Architecture

**Data Flow:** MTA GTFS-RT Feed → `mta_client.py` (fetch/cache/parse) → `app.py` or `main.py` (display)

### Key Files
- `app.py` - Flask web server with embedded HTML simulator (port 5001). Serves `/` (simulator UI) and `/api/data` (JSON arrivals)
- `main.py` - Raspberry Pi entry point. Drives physical 64x32 RGB LED matrix using `rgbmatrix` library
- `mta_client.py` - `MTAClient` class that fetches GTFS-realtime protobuf from MTA, parses arrivals for configured station, caches for 30s
- `config.py` - Runtime config: `TARGET_STATION_ID`, `DIRECTION` (N/S), `FEED_URL`, refresh rates
- `stations.py` - Dictionary mapping station IDs (e.g., "120", "R20") to human names

### MTA Feed Structure
- Feed URL: `https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs` (no API key needed)
- Station IDs have direction suffix: `120N` = 96 St Uptown, `120S` = 96 St Downtown
- Different feeds exist for different line groups (current config uses 1/2/3 lines feed)

### Display Logic
- Fetches top 6-7 upcoming trains for configured station+direction
- Left panel: 2 large train arrivals with line bullet + minutes
- Right panel: Compact list of next 4-5 trains
- Line colors: Red (1/2/3), Green (4/5/6), Purple (7)

## Configuration

Edit `config.py` to change station:
```python
TARGET_STATION_ID = "120"  # Find IDs in stations.py
DIRECTION = "N"            # N=Uptown/North, S=Downtown/South
```

Find station IDs: `grep "Station Name" stations.py`
