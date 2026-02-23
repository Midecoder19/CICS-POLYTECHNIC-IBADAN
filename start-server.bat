@echo off
echo ========================================
echo Starting PolyIbadan Application Server
echo ========================================
echo.

echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB service not found. Starting MongoDB manually...
    start "MongoDB" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
    timeout /t 5 /nobreak >nul
) else (
    echo MongoDB service started successfully.
)

echo.
echo Starting backend server...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo Starting frontend development server...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Application started successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3003/api
echo.
echo For network access from other devices:
echo 1. Find your server laptop's IP address (run: ipconfig)
echo 2. Other devices can access at: http://[SERVER_IP]:3000
echo 3. Make sure firewall allows connections on ports 3000 and 3003
echo.
echo Press any key to close this window...
pause >nul
