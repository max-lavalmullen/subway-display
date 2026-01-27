import json
import os
import uuid
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from mta_client import MTAClient, get_lines_for_station
from stations import STATIONS

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
CORS(app)  # Enable CORS for development

client = MTAClient()
CONFIG_FILE = os.path.join(os.path.dirname(__file__), 'station_config.json')


def load_station_config():
    """Load station configuration from JSON file."""
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            pass
    return {"stations": []}


def save_station_config(config):
    """Save station configuration to JSON file."""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)


# --- API Endpoints ---

@app.route('/api/stations', methods=['GET'])
def get_stations():
    """Get all configured stations."""
    config = load_station_config()
    return jsonify(config['stations'])


@app.route('/api/stations', methods=['POST'])
def add_station():
    """Add a new station to monitor."""
    data = request.get_json()

    if not data or 'id' not in data:
        return jsonify({'error': 'Station ID is required'}), 400

    station_id = data['id']
    direction = data.get('direction', 'N')
    name = data.get('name', STATIONS.get(station_id, station_id))

    config = load_station_config()

    # Check for duplicates
    for station in config['stations']:
        if station['id'] == station_id and station['direction'] == direction:
            return jsonify({'error': 'Station already exists'}), 409

    new_station = {
        'id': station_id,
        'direction': direction,
        'name': name,
        'uuid': str(uuid.uuid4())  # Unique ID for frontend
    }

    config['stations'].append(new_station)
    save_station_config(config)

    return jsonify(new_station), 201


@app.route('/api/stations/<station_uuid>', methods=['DELETE'])
def delete_station(station_uuid):
    """Remove a station from monitoring."""
    config = load_station_config()

    # Find and remove station by UUID or by id_direction
    original_length = len(config['stations'])
    config['stations'] = [
        s for s in config['stations']
        if s.get('uuid') != station_uuid and f"{s['id']}_{s['direction']}" != station_uuid
    ]

    if len(config['stations']) == original_length:
        return jsonify({'error': 'Station not found'}), 404

    save_station_config(config)
    return jsonify({'success': True}), 200


@app.route('/api/stations/available', methods=['GET'])
def get_available_stations():
    """Search available stations from stations.py."""
    query = request.args.get('q', '').lower()

    results = []
    for station_id, name in STATIONS.items():
        if query in name.lower() or query in station_id.lower():
            results.append({
                'id': station_id,
                'name': name,
                'lines': get_lines_for_station(station_id)
            })

    # Sort by name and limit results
    results.sort(key=lambda x: x['name'])
    return jsonify(results[:50])


@app.route('/api/arrivals', methods=['GET'])
def get_arrivals():
    """Get arrivals for all configured stations."""
    config = load_station_config()

    if not config['stations']:
        return jsonify({})

    results = client.get_arrivals_for_stations(config['stations'])

    # Transform results to include station metadata
    response = []
    for station in config['stations']:
        key = f"{station['id']}_{station['direction']}"
        station_data = results.get(key, {})
        response.append({
            'id': station['id'],
            'uuid': station.get('uuid', key),
            'direction': station['direction'],
            'name': station['name'],
            'arrivals': station_data.get('arrivals', [])
        })

    return jsonify(response)


# --- Legacy API for backward compatibility ---

@app.route('/api/data', methods=['GET'])
def get_data():
    """Legacy endpoint for LED matrix display."""
    return jsonify(client.get_current_page())


# --- Static File Serving ---

@app.route('/')
def serve_frontend():
    """Serve the React frontend."""
    return send_from_directory(app.static_folder, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    """Serve static files from the React build."""
    if os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    # Fallback to index.html for SPA routing
    return send_from_directory(app.static_folder, 'index.html')


if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
