import time
import requests
from google.transit import gtfs_realtime_pb2
import config

class MTAClient:
    def __init__(self):
        self.cached_arrivals = []
        self.last_fetch_time = 0

    def fetch_data(self):
        # Only fetch if cache is old
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
            
            # Assign rank based on order
            for i, arrival in enumerate(arrivals, 1):
                arrival['rank'] = i

            self.cached_arrivals = arrivals[:6] # Keep top 6
            self.last_fetch_time = current_time

        except Exception as e:
            print(f"Error fetching MTA data: {e}")

    def get_current_page(self):
        self.fetch_data()
        
        if not self.cached_arrivals:
            return []

        # Return top 7 trains for the new layout (2 big + 5 small list)
        return self.cached_arrivals[:7]
