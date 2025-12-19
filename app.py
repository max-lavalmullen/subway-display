from flask import Flask, jsonify
from mta_client import MTAClient

app = Flask(__name__)
client = MTAClient()

# --- WEB SIMULATOR HTML ---
# (Kept inside app.py for simplicity of single-file distribution if needed, 
# but could be moved to templates/index.html)
HTML_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
    <title>Matrix Simulator</title>
    <style>
        body { background: #222; color: white; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
        .bonnet {
            width: 640px;
            height: 320px;
            background-color: #000;
            border: 20px solid #333;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            padding: 10px;
            box-sizing: border-box;
            box-shadow: 0 0 50px rgba(0,0,0,0.8);
            position: relative;
            overflow: hidden;
        }
        .grid-overlay {
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
                linear-gradient(#111 1px, transparent 1px),
                linear-gradient(90deg, #111 1px, transparent 1px);
            background-size: 10px 10px;
            z-index: 2;
            pointer-events: none;
        }
        .row {
            display: flex;
            align-items: center;
            height: 50%;
            z-index: 1;
            padding-left: 20px;
        }
        .bullet {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Helvetica, Arial, sans-serif;
            font-weight: bold;
            font-size: 50px;
            margin-right: 30px;
            color: white;
        }
        .line-1, .line-2, .line-3 { background-color: #EE352E; } /* Red Line */
        .line-4, .line-5, .line-6 { background-color: #00933C; } /* Green Line */
        .line-7 { background-color: #B933AD; } /* Purple Line */
        
        .rank {
            font-size: 40px;
            color: #888;
            margin-right: 20px;
            width: 50px;
            text-align: right;
            font-family: 'Courier New', Courier, monospace;
        }

        .time {
            font-family: 'Courier New', Courier, monospace;
            font-size: 60px;
            color: #ffb81c; /* Amber/Orange LED color */
            font-weight: bold;
            text-shadow: 0 0 10px #ffb81c;
        }
        .no-trains {
            width: 100%;
            text-align: center;
            font-size: 50px;
            color: #ff0000;
            margin-top: 100px;
        }
    </style>
    <script>
        function updateDisplay() {
            fetch('/api/data')
                .then(response => response.json())
                .then(data => {
                    const container = document.getElementById('content');
                    container.innerHTML = '';
                    
                    if (data.length === 0) {
                        container.innerHTML = '<div class="no-trains">NO TRAINS</div>';
                        return;
                    }

                    data.forEach(train => {
                        const row = document.createElement('div');
                        row.className = 'row';
                        
                        const rank = document.createElement('div');
                        rank.className = 'rank';
                        rank.innerText = train.rank + '.';

                        const bullet = document.createElement('div');
                        bullet.className = `bullet line-${train.line}`;
                        bullet.innerText = train.line;
                        
                        const time = document.createElement('div');
                        time.className = 'time';
                        time.innerText = train.time + ' min';
                        
                        row.appendChild(rank);
                        row.appendChild(bullet);
                        row.appendChild(time);
                        container.appendChild(row);
                    });
                });
        }
        setInterval(updateDisplay, 1000);
    </script>
</head>
<body>
    <h2>96 St (Uptown) Simulator</h2>
    <div class="bonnet">
        <div class="grid-overlay"></div>
        <div id="content" style="width:100%; height:100%">Loading...</div>
    </div>
</body>
</html>
"""

@app.route('/')
def home():
    return HTML_TEMPLATE

@app.route('/api/data')
def get_data():
    return jsonify(client.get_current_page())

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5001, debug=True)
