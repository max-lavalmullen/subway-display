#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

# --- CONFIGURATION ---
PI_USER="maxpi"
PI_IP="192.168.1.242"
# ---------------------

echo "🚀 Uploading Subway App to $PI_USER@$PI_IP..."

# Ensure directory exists
ssh $PI_USER@$PI_IP "mkdir -p ~/subway_app"

# Upload all Python files and scripts
scp app.py config.py mta_client.py main.py requirements.txt start.sh stations.py $PI_USER@$PI_IP:~/subway_app/

# Make the start script executable
ssh $PI_USER@$PI_IP "chmod +x ~/subway_app/start.sh"

echo -e "${GREEN}✅ Upload Complete!${NC}"
echo "To run it, SSH in and type:"
echo "cd subway_app"
echo "./start.sh"
