import time
import requests
from google.transit import gtfs_realtime_pb2
import config

# Feed URLs for different subway line groups
FEED_URLS = {
    "123456S": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs",
    "NQRW": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw",
    "BDFM": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm",
    "ACE": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace",
    "JZ": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz",
    "L": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l",
    "G": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g",
    "7": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-7",
    "SIR": "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si",
}

ALERTS_URL = "https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/camsys%2Fsubway-alerts"
ALERTS_CACHE_TTL = 60  # Cache alerts for 60 seconds

# Map station ID prefixes to their feed groups
# Numeric IDs (1xx, 2xx, etc.) are typically for numbered lines
# Letter prefixes indicate specific line groups
STATION_PREFIX_TO_FEED = {
    # Numbered stations (1/2/3 lines)
    "1": "123456S",
    "2": "123456S",
    "3": "123456S",
    # 4/5/6 lines
    "4": "123456S",
    "5": "123456S",
    "6": "123456S",
    # 7 line
    "7": "7",
    # A/C/E lines
    "A": "ACE",
    "E": "ACE",
    "H": "ACE",  # Rockaway shuttle uses ACE feed
    # B/D/F/M lines
    "B": "BDFM",
    "D": "BDFM",
    "F": "BDFM",
    # N/Q/R/W lines
    "R": "NQRW",
    "N": "NQRW",
    "Q": "NQRW",
    # G line
    "G": "G",
    # J/Z lines
    "J": "JZ",
    "M": "JZ",  # M uses J/Z feed
    # L line
    "L": "L",
    # Staten Island Railway
    "S": "SIR",
}


def get_feed_for_station(station_id):
    """Determine which feed URL to use based on station ID prefix."""
    if not station_id:
        return FEED_URLS["123456S"]

    prefix = station_id[0]
    feed_key = STATION_PREFIX_TO_FEED.get(prefix, "123456S")
    return FEED_URLS[feed_key]


# Destination/terminal stations for each line by direction
# N = Uptown/Bronx/Queens, S = Downtown/Brooklyn
LINE_DESTINATIONS = {
    "1": {"N": "Van Cortlandt Park", "S": "South Ferry"},
    "2": {"N": "Wakefield-241 St", "S": "Flatbush Av"},
    "3": {"N": "Harlem-148 St", "S": "New Lots Av"},
    "4": {"N": "Woodlawn", "S": "Crown Hts-Utica Av"},
    "5": {"N": "Eastchester-Dyre Av", "S": "Flatbush Av"},
    "6": {"N": "Pelham Bay Park", "S": "Brooklyn Bridge"},
    "7": {"N": "Flushing-Main St", "S": "34 St-Hudson Yards"},
    "A": {"N": "Inwood-207 St", "S": "Far Rockaway / Ozone Park"},
    "B": {"N": "Bedford Park Blvd", "S": "Brighton Beach"},
    "C": {"N": "168 St", "S": "Euclid Av"},
    "D": {"N": "Norwood-205 St", "S": "Coney Island"},
    "E": {"N": "Jamaica Center", "S": "World Trade Center"},
    "F": {"N": "Jamaica-179 St", "S": "Coney Island"},
    "G": {"N": "Court Sq", "S": "Church Av"},
    "J": {"N": "Jamaica Center", "S": "Broad St"},
    "L": {"N": "8 Av", "S": "Canarsie-Rockaway Pkwy"},
    "M": {"N": "Forest Hills-71 Av", "S": "Middle Village"},
    "N": {"N": "Astoria-Ditmars Blvd", "S": "Coney Island"},
    "Q": {"N": "96 St", "S": "Coney Island"},
    "R": {"N": "Forest Hills-71 Av", "S": "Bay Ridge-95 St"},
    "W": {"N": "Astoria-Ditmars Blvd", "S": "Whitehall St"},
    "Z": {"N": "Jamaica Center", "S": "Broad St"},
    "S": {"N": "Times Sq", "S": "Grand Central"},  # 42nd St Shuttle
    "SIR": {"N": "St George", "S": "Tottenville"},
}


def get_destination_for_line(route_id, direction):
    """Get the terminal/destination name for a line and direction."""
    destinations = LINE_DESTINATIONS.get(route_id, {})
    return destinations.get(direction, "")


def get_lines_for_station(station_id):
    """Return likely lines that serve this station based on prefix."""
    if not station_id:
        return []

    prefix = station_id[0]
    line_map = {
        "1": ["1", "2", "3"],
        "2": ["2", "5"],
        "3": ["3"],
        "4": ["4"],
        "5": ["5"],
        "6": ["6"],
        "7": ["7"],
        "A": ["A", "C", "E"],
        "B": ["B", "D", "F", "M"],
        "D": ["B", "D", "F", "M"],
        "F": ["F"],
        "G": ["G"],
        "H": ["A", "S"],
        "J": ["J", "Z"],
        "L": ["L"],
        "M": ["M"],
        "N": ["N"],
        "Q": ["Q"],
        "R": ["N", "Q", "R", "W"],
        "S": ["SIR"],
        "E": ["E"],
    }
    return line_map.get(prefix, [])


class MTAClient:
    def __init__(self):
        self.cached_arrivals = []
        self.last_fetch_time = 0
        # Cache for multi-station fetches: {station_key: {arrivals: [], last_fetch: timestamp}}
        self.station_cache = {}
        # Cache for service alerts
        self.alerts_cache = []
        self.alerts_last_fetch = 0

    def fetch_data(self):
        """Legacy method for single station fetch (backward compatibility)."""
        if time.time() - self.last_fetch_time < config.DATA_REFRESH_RATE:
            return

        try:
            print("Fetching new MTA data...")
            response = requests.get(config.FEED_URL, timeout=10)
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            arrivals = []
            current_time = time.time()

            for entity in feed.entity:
                if entity.trip_update:
                    for update in entity.trip_update.stop_time_update:
                        if update.stop_id == config.TARGET_STATION_ID + config.DIRECTION:
                            arr_time = update.arrival.time
                            if arr_time > current_time:
                                minutes = int((arr_time - current_time) / 60)
                                line = entity.trip_update.trip.route_id
                                arrivals.append({'line': line, 'time': minutes})

            arrivals.sort(key=lambda x: x['time'])

            for i, arrival in enumerate(arrivals, 1):
                arrival['rank'] = i

            self.cached_arrivals = arrivals[:6]
            self.last_fetch_time = current_time

        except Exception as e:
            print(f"Error fetching MTA data: {e}")

    def get_current_page(self):
        """Legacy method for single station display."""
        self.fetch_data()

        if not self.cached_arrivals:
            return []

        return self.cached_arrivals[:7]

    def fetch_arrivals_for_station(self, station_id, direction, force_refresh=False):
        """Fetch arrivals for a specific station and direction."""
        cache_key = f"{station_id}_{direction}"
        current_time = time.time()

        # Check cache
        if not force_refresh and cache_key in self.station_cache:
            cached = self.station_cache[cache_key]
            if current_time - cached['last_fetch'] < config.DATA_REFRESH_RATE:
                return cached['arrivals']

        feed_url = get_feed_for_station(station_id)

        try:
            print(f"Fetching MTA data for station {station_id}{direction}...")
            response = requests.get(feed_url, timeout=10)
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            arrivals = []
            stop_id = station_id + direction

            for entity in feed.entity:
                if entity.trip_update:
                    for update in entity.trip_update.stop_time_update:
                        if update.stop_id == stop_id:
                            arr_time = update.arrival.time
                            if arr_time > current_time:
                                minutes = int((arr_time - current_time) / 60)
                                line = entity.trip_update.trip.route_id
                                destination = get_destination_for_line(line, direction)
                                arrivals.append({
                                    'line': line,
                                    'time': minutes,
                                    'destination': destination
                                })

            arrivals.sort(key=lambda x: x['time'])

            # Assign ranks
            for i, arrival in enumerate(arrivals, 1):
                arrival['rank'] = i

            # Cache results
            self.station_cache[cache_key] = {
                'arrivals': arrivals[:10],  # Keep top 10
                'last_fetch': current_time
            }

            return arrivals[:10]

        except Exception as e:
            print(f"Error fetching MTA data for {station_id}: {e}")
            # Return cached data if available
            if cache_key in self.station_cache:
                return self.station_cache[cache_key]['arrivals']
            return []

    def get_arrivals_for_stations(self, station_configs):
        """
        Fetch arrivals for multiple stations.

        Args:
            station_configs: List of dicts with {id, direction, name}

        Returns:
            Dict mapping station config to arrivals list
        """
        results = {}

        for config in station_configs:
            station_id = config.get('id')
            direction = config.get('direction', 'N')
            name = config.get('name', station_id)

            arrivals = self.fetch_arrivals_for_station(station_id, direction)

            key = f"{station_id}_{direction}"
            results[key] = {
                'id': station_id,
                'direction': direction,
                'name': name,
                'arrivals': arrivals
            }

        return results

    def fetch_service_alerts(self, lines_filter=None):
        """
        Fetch service alerts from MTA.

        Args:
            lines_filter: Optional list of line IDs to filter alerts (e.g., ['1', '2', 'A'])

        Returns:
            List of alert dicts with id, header, description, routes, severity, active_period
        """
        current_time = time.time()

        # Check cache
        if current_time - self.alerts_last_fetch < ALERTS_CACHE_TTL:
            return self._filter_alerts(self.alerts_cache, lines_filter)

        try:
            print("Fetching MTA service alerts...")
            response = requests.get(ALERTS_URL, timeout=10)
            feed = gtfs_realtime_pb2.FeedMessage()
            feed.ParseFromString(response.content)

            alerts = []

            for entity in feed.entity:
                if entity.HasField('alert'):
                    alert = entity.alert

                    # Extract affected routes
                    routes = []
                    for informed in alert.informed_entity:
                        if informed.HasField('route_id'):
                            route_id = informed.route_id
                            if route_id and route_id not in routes:
                                routes.append(route_id)

                    # Extract header text
                    header = ""
                    if alert.header_text and alert.header_text.translation:
                        for trans in alert.header_text.translation:
                            if trans.language == 'en' or not trans.language:
                                header = trans.text
                                break

                    # Extract description text
                    description = ""
                    if alert.description_text and alert.description_text.translation:
                        for trans in alert.description_text.translation:
                            if trans.language == 'en' or not trans.language:
                                description = trans.text
                                break

                    # Extract active period
                    active_period = {"start": None, "end": None}
                    if alert.active_period:
                        period = alert.active_period[0]
                        if period.HasField('start'):
                            active_period["start"] = period.start
                        if period.HasField('end'):
                            active_period["end"] = period.end

                    # Determine severity based on header/description keywords
                    severity = self._determine_severity(header, description)

                    alert_data = {
                        "id": entity.id,
                        "header": header,
                        "description": description,
                        "routes": routes,
                        "severity": severity,
                        "active_period": active_period,
                        "updated_at": current_time
                    }

                    alerts.append(alert_data)

            self.alerts_cache = alerts
            self.alerts_last_fetch = current_time

            return self._filter_alerts(alerts, lines_filter)

        except Exception as e:
            print(f"Error fetching MTA alerts: {e}")
            # Return cached alerts if available
            return self._filter_alerts(self.alerts_cache, lines_filter)

    def _determine_severity(self, header, description):
        """Determine alert severity based on keywords."""
        text = (header + " " + description).lower()

        major_keywords = ["suspended", "no service", "service suspended", "major delays"]
        minor_keywords = ["delays", "delayed", "slow speeds", "signal problems"]

        for keyword in major_keywords:
            if keyword in text:
                return "major"

        for keyword in minor_keywords:
            if keyword in text:
                return "minor"

        return "info"

    def _filter_alerts(self, alerts, lines_filter):
        """Filter alerts to only those affecting specified lines."""
        if not lines_filter:
            return alerts

        # Normalize filter to uppercase
        lines_filter = [line.upper() for line in lines_filter]

        filtered = []
        for alert in alerts:
            # Check if any of the alert's routes match the filter
            for route in alert.get("routes", []):
                if route.upper() in lines_filter:
                    filtered.append(alert)
                    break

        return filtered

    def clear_cache(self):
        """Clear all cached data."""
        self.station_cache = {}
        self.cached_arrivals = []
        self.last_fetch_time = 0
        self.alerts_cache = []
        self.alerts_last_fetch = 0
