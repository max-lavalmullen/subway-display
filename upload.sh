#!/bin/bash

# Define colors for output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🚀 Uploading Subway App to MaxPi (192.168.1.242)..."

# Ensure directory exists
ssh maxpi@192.168.1.242 "mkdir -p ~/subway_app"

# Upload all Python files and scripts
scp app.py config.py mta_client.py main.py requirements.txt start.sh maxpi@192.168.1.242:~/subway_app/

# Make the start script executable
ssh maxpi@192.168.1.242 "chmod +x ~/subway_app/start.sh"

echo -e "${GREEN}✅ Upload Complete!${NC}"
echo "To run it, SSH in and type:"
echo "cd subway_app"
echo "./start.sh"
