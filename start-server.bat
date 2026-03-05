@echo off
echo ========================================
echo Starting PolyIbadan Application
echo ========================================
echo.

echo Starting MongoDB service...
net start MongoDB >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB service not found. Starting MongoDB manually...
    start "MongoDB" "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
    timeout /t 5 /nobreak >nul
) else (
    echo MongoDB service started.
)

echo.
echo Starting backend server (port 3003)...
cd backend
start "Backend Server" cmd /k "npm run dev"
cd ..

echo.
echo Starting frontend server (port 3000)...
cd frontend
start "Frontend Server" cmd /k "npm run dev"
cd ..

echo.
echo ========================================
echo Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3003/api
echo.
pause
