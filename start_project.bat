@echo off
title CrowdVision AI - Complete System Launcher
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
echo Starting CrowdVision AI System...
echo.
echo This will open TWO windows:
echo   1. ML Inference Server (Python/Flask)
echo   2. Web Dashboard (Next.js)
echo.
echo Press any key to continue...
pause >nul

REM Start ML Server in new window
echo.
echo [1/2] Starting ML Inference Server...
start "CrowdVision AI - ML Server" cmd /k "cd ml-server && start_server.bat"
timeout /t 3 /nobreak >nul

REM Start Next.js Frontend in new window
echo [2/2] Starting Web Dashboard...
start "CrowdVision AI - Dashboard" cmd /k "npm run dev"
timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo    System Started Successfully!
echo ========================================
echo.
echo ML Server:      http://localhost:5000
echo Web Dashboard:  http://localhost:3000
echo.
echo Both services are running in separate windows.
echo Close those windows to stop the services.
echo.
echo Opening dashboard in browser in 5 seconds...
timeout /t 5 /nobreak >nul

REM Open browser
start http://localhost:3000

echo.
echo System is now running!
echo.
pause
