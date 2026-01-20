@echo off
echo ============================================================
echo CrowdVision AI - Backend Servers
echo ============================================================
echo.

REM Check if virtual environment exists
if not exist "venv\" (
    echo Virtual environment not found. Creating...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate
echo.

REM Check if dependencies are installed
echo Checking dependencies...
pip show ultralytics >nul 2>&1
if errorlevel 1 (
    echo Dependencies not installed. Installing...
    pip install -r requirements.txt
    echo.
)

echo.
echo Starting Backend Servers...
echo.
echo Camera Feed Server will run on: http://localhost:999
echo Data API Server will run on: http://localhost:666
echo.
echo Press Ctrl+C in each window to stop the servers
echo.

REM Start Camera Feed Server in new window
start "CrowdVision AI - Camera Feed Server (Port 999)" cmd /k "call venv\Scripts\activate && python camera_feed_server.py"

REM Wait a bit for first server to start
timeout /t 3 /nobreak >nul

REM Start Data API Server in new window
start "CrowdVision AI - Data API Server (Port 666)" cmd /k "call venv\Scripts\activate && python data_api_server.py"

echo.
echo ============================================================
echo Backend servers started successfully!
echo ============================================================
echo.
echo Camera Feed Server: http://localhost:999
echo Data API Server: http://localhost:666
echo.
echo Check the server windows for logs and status
echo.
pause
