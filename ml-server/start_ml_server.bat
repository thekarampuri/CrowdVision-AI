@echo off
title AI Based Crowd Watcher for Public Safety - ML Server
color 0B

echo.
echo ========================================
echo    AI Based Crowd Watcher for Public Safety - ML Inference Server
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python 3.8 or higher
    pause
    exit /b 1
)

echo [OK] Python detected
python --version
echo.

REM Check if dependencies are installed
echo [1/2] Checking dependencies...
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing required packages...
    pip install flask flask-cors ultralytics opencv-python numpy
    echo.
)

REM Check if model exists
if not exist "models\yolov8n.pt" (
    echo [ERROR] Model file not found: models\yolov8n.pt
    echo Please ensure the YOLOv8 model is in the models directory
    pause
    exit /b 1
)

echo [2/2] Starting ML Inference Server...
echo.
echo ========================================
echo Server will start on: http://127.0.0.1:5000
echo.
echo Endpoints:
echo   GET  /health  - Health check
echo   POST /detect  - Crowd detection
echo   GET  /config  - Configuration
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
python server.py

pause
