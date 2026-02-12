@echo off
echo ========================================
echo   Starting Backend Server
echo ========================================
echo.

cd /d "%~dp0"

echo Checking if port 3001 is in use...
netstat -ano | findstr :3001 >nul
if %errorlevel% == 0 (
    echo Port 3001 is already in use!
    echo.
    echo Finding process...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001 ^| findstr LISTENING') do (
        echo Killing process %%a...
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 >nul
)

echo.
echo Starting server...
echo.

node server.js

pause
