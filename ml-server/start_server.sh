#!/bin/bash

echo "========================================"
echo "CrowdVision AI - ML Inference Server"
echo "========================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "[ERROR] Python 3 is not installed or not in PATH"
    echo "Please install Python 3.8 or higher"
    exit 1
fi

echo "[1/4] Checking Python installation..."
python3 --version
echo ""

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "[2/4] Creating virtual environment..."
    python3 -m venv venv
    echo "Virtual environment created successfully"
else
    echo "[2/4] Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "[3/4] Activating virtual environment..."
source venv/bin/activate
echo ""

# Install dependencies
echo "[4/4] Installing dependencies..."
pip install -r requirements.txt --quiet
echo "Dependencies installed"
echo ""

# Check if model exists
if [ ! -f "models/yolov8n.pt" ]; then
    echo "[WARNING] Model file not found: models/yolov8n.pt"
    echo "Please ensure the model file is in the models directory"
    exit 1
fi

echo "========================================"
echo "Starting ML Inference Server..."
echo "========================================"
echo "Server URL: http://localhost:5000"
echo "Health Check: http://localhost:5000/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

# Start the Flask server
python app.py
