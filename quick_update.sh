#!/bin/bash

# Quick Update for Subway Dashboard
# Updates code WITHOUT killing the Cloudflare Tunnel

set -e

# Interactive Setup
echo "========================================"
echo "  Subway: Quick Code Update"
echo "  (Preserves Tunnel URL)"
echo "========================================"
echo ""

# Ensure we are in the project directory
cd "$(dirname "$0")"

# Ask for Username
read -p "Enter Raspberry Pi username (default: max): " PI_USER
PI_USER=${PI_USER:-max}

# Ask for Hostname or IP
read -p "Enter Raspberry Pi IP or Hostname (default: 192.168.1.254): " PI_ADDRESS
PI_ADDRESS=${PI_ADDRESS:-192.168.1.254}

PI_HOST="$PI_USER@$PI_ADDRESS"
REMOTE_BASE="subway_app"

echo ""
echo "=== 0. Building Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo ""
echo "=== 1. Uploading New Code ==="
# Copy the application files
echo "Copying application files..."
scp app.py \
    config.py \
    mta_client.py \
    main.py \
    requirements.txt \
    start.sh \
    stations.py \
    station_config.json \
    Dockerfile \
    docker-compose.yml \
    "$PI_HOST:~/$REMOTE_BASE/"

# Copy the built frontend
echo "Copying frontend..."
scp -r frontend/dist "$PI_HOST:~/$REMOTE_BASE/frontend/"

echo ""
echo "=== 2. Refreshing App Container ==="
ssh "$PI_HOST" << EOF
    cd ~/$REMOTE_BASE
    
    # Rebuild and restart ONLY the subway-dashboard service
    # --no-deps: Don't restart linked services (like the tunnel)
    # --build: Force image rebuild with new code
    echo "Swapping out application code..."
    docker compose up -d --no-deps --build subway-dashboard
EOF

echo ""
echo "============================================"
echo "  SUCCESS! Code updated."
echo "  Your Tunnel URL should still be active."
echo "============================================