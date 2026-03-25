@echo off
echo ========================================
echo AI Based Crowd Watcher for Public Safety - ML Inference Server
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

echo [1/4] Checking Python installation...
python --version
echo.

REM Check if virtual environment exists
if not exist "venv" (
    echo [2/4] Creating virtual environment...
    python -m venv venv
    echo Virtual environment created successfully
) else (
    echo [2/4] Virtual environment already exists
)
echo.

REM Activate virtual environment
echo [3/4] Activating virtual environment...
call venv\Scripts\activate.bat
echo.

REM Install dependencies
echo [4/4] Installing dependencies...
pip install -r requirements.txt --quiet
echo Dependencies installed
echo.

REM Check if model exists
if not exist "models\yolov8n.pt" (
    echo [WARNING] Model file not found: models\yolov8n.pt
    echo Please ensure the model file is in the models directory
    pause
    exit /b 1
)

echo ========================================
echo Starting ML Inference Server...
echo ========================================
echo Server URL: http://localhost:5000
echo Health Check: http://localhost:5000/health
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the Flask server
python app.py

pause
