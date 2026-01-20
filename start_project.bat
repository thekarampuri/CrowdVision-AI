@echo off
title CrowdVision AI - Complete System
color 0A

echo.
echo ========================================
echo    CrowdVision AI - System Launcher
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

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js 18 or higher
    pause
    exit /b 1
)

echo [OK] Python and Node.js detected
echo.

REM Check if ML server dependencies are installed
echo [1/4] Checking ML server dependencies...
cd ml-server
pip show flask >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing ML server dependencies...
    pip install flask flask-cors ultralytics opencv-python numpy
)
cd ..

REM Check if Node modules are installed
echo [2/4] Checking Node.js dependencies...
if not exist "node_modules" (
    echo [INFO] Installing Node.js dependencies...
    call npm install
)

echo.
echo ========================================
echo     Starting CrowdVision AI System
echo ========================================
echo.
echo [3/4] Starting ML Inference Server (port 5000)...
echo [4/4] Starting Web Dashboard (port 3000)...
echo.
echo Both services will run in background.
echo This window will show the Next.js output.
echo.
echo ========================================
echo.

REM Start ML server in background
start /B python ml-server\server.py

REM Wait for ML server to start
echo Waiting for ML server to initialize...
timeout /t 8 /nobreak >nul

echo.
echo ========================================
echo    System Started Successfully!
echo ========================================
echo.
echo ML Server:      http://localhost:5000
echo Web Dashboard:  http://localhost:3000
echo.
echo Opening dashboard in 3 seconds...
echo ========================================
echo.

REM Wait before opening browser
timeout /t 3 /nobreak >nul
start http://localhost:3000

REM Run Next.js in foreground (keeps window open)
echo.
echo Starting Next.js server...
echo Press Ctrl+C to stop all services
echo.
npm run dev

REM When user presses Ctrl+C, cleanup
taskkill /F /IM python.exe /FI "WINDOWTITLE eq CrowdVision*" >nul 2>&1
