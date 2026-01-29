#!/bin/bash

# Deploy Subway Dashboard to Raspberry Pi (Docker + Tunnel)

set -e

# Interactive Setup
echo "========================================"
echo "  Subway Dashboard Deployment"
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
echo "Target: $PI_HOST"
echo "----------------------------------------"
read -p "Press Enter to start deployment (or Ctrl+C to cancel)..."

echo ""
echo "=== 0. Building Frontend ==="
cd frontend
npm install
npm run build
cd ..

echo ""
echo "=== 1. Preparing files on Pi ==="
# Create a clean directory in the user's home folder
ssh "$PI_HOST" "mkdir -p ~/$REMOTE_BASE/frontend"

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

# Make start script executable (legacy support)
ssh "$PI_HOST" "chmod +x ~/$REMOTE_BASE/start.sh"

echo ""
echo "=== 2. Launching Docker Stack on Pi ==="
ssh "$PI_HOST" << EOF
    cd ~/$REMOTE_BASE
    
    # Take down old containers and remove conflicting ones by name
    docker compose down --remove-orphans || true
    docker rm -f subway-dashboard subway_tunnel || true

    # Start the stack (force build to ensure code updates are applied)
    echo "Building and starting services..."
    docker compose up -d --build
EOF

echo ""
echo "==========================================="
echo "  SUCCESS! The stack is running."
echo ""
echo "  To get your public Tunnel URL, run this on your Pi:"
echo "  ssh $PI_HOST 'docker logs subway_tunnel 2>&1 | grep trycloudflare.com'"
echo "==========================================="
