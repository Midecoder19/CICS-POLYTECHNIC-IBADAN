@echo off
echo ========================================
echo PolyIbadan App Installation
echo ========================================
echo.

echo Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
echo Node.js found.

echo.
echo Installing backend dependencies...
cd backend
npm install
cd ..

echo.
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Run start-server.bat to start the app
echo.
pause
