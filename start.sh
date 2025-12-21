#!/bin/bash
# start.sh - Setup and Run the Subway App on Raspberry Pi

# 1. Ensure Virtual Environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment with system access..."
    python3 -m venv --system-site-packages venv
fi

# 2. Activate Virtual Environment
source venv/bin/activate

# 3. Install/Update Dependencies (quietly)
echo "⬇️  Checking dependencies..."
pip install -r requirements.txt > /dev/null 2>&1

# 4. Start the Application
echo "🚇🚂 Starting Subway App..."
# Use exec so this script is replaced by the python process.
# Sudo is required for RGB Matrix hardware access.
exec sudo $(which python3) main.py