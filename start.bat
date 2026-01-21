@echo off
cls
echo ========================================
echo   CrowdVision AI - Starting Application
echo ========================================
echo.

REM Check Node.js
echo [1/5] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found:
node --version
echo.

REM Check Python
echo [2/5] Checking Python installation...
where python >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org/
    pause
    exit /b 1
)
echo Python found:
python --version
echo.

REM Check if node_modules exists
echo [3/5] Checking Node.js dependencies...
if not exist "node_modules\" (
    echo Installing Node.js dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install Node.js dependencies
        pause
        exit /b 1
    )
    echo Dependencies installed successfully!
) else (
    echo Node.js dependencies already installed
)
echo.

REM Check Python dependencies
echo [4/5] Checking Python dependencies...
cd ml-server
python -c "import flask" >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Installing Python dependencies...
    pip install -r requirements.txt
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install Python dependencies
        cd ..
        pause
        exit /b 1
    )
    echo Python dependencies installed successfully!
) else (
    echo Python dependencies already installed
)
cd ..
echo.

REM Start servers
echo [5/5] Starting servers...
echo.
echo ========================================
echo   Starting ML Backend Server...
echo ========================================
echo.

start /B cmd /c "cd /d %~dp0ml-server && python app.py"

echo Waiting for ML server to start...
timeout /t 5 >nul

echo.
echo ========================================
echo   Starting Next.js Frontend Server...
echo ========================================
echo.
echo   - Frontend: http://localhost:3000
echo   - ML API:   http://localhost:5000
echo ========================================
echo.
echo Press Ctrl+C to stop both servers
echo.

npm run dev

pause
