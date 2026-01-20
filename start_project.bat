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
pip show ultralytics >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Installing ML server dependencies...
    pip install -r requirements.txt
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
echo [3/4] Starting ML Inference Server...
echo [4/4] Starting Web Dashboard...
echo.
echo This will run both services in this window.
echo.
echo Press Ctrl+C to stop all services.
echo.
echo ========================================
echo.

REM Start ML server in background
start /B cmd /c "cd ml-server && python app.py" 2>&1

REM Wait for ML server to start
timeout /t 5 /nobreak >nul

REM Start Next.js frontend
echo.
echo ========================================
echo    System Started Successfully!
echo ========================================
echo.
echo ML Server:      http://localhost:5000
echo Web Dashboard:  http://localhost:3000
echo.
echo Opening dashboard in 5 seconds...
echo ========================================
echo.

REM Wait before opening browser
timeout /t 5 /nobreak >nul
start http://localhost:3000

REM Run Next.js in foreground (keeps window open)
npm run dev
