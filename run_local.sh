#!/bin/bash
pkill -f "python3 app.py"
echo "♻️ Restarting Subway App..."
nohup python3 app.py > output.log 2>&1 &
echo "✅ App started in background! (Port 5001)"
tail -f output.log