@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Starting PolyIbadan Application
echo ========================================
echo.

:: Check if MongoDB is installed and try to start it
echo Checking MongoDB...
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB not found in PATH.
    echo Please install MongoDB first from: https://www.mongodb.com/try/download/community
    echo.
) else (
    echo Starting MongoDB...
    net start MongoDB >nul 2>&1
    if %errorlevel% neq 0 (
        echo Trying to start MongoDB manually...
        start "MongoDB" cmd /k "mongod --dbpath C:\data\db"
        timeout /t 3 /nobreak >nul
    ) else (
        echo MongoDB started.
    )
)

echo.
echo ========================================
echo Checking Environment Files
echo ========================================

:: Check backend .env
if not exist "backend\.env" (
    echo ERROR: backend\.env not found!
    echo Please run install.bat first to create environment files.
    echo.
    pause
    exit /b 1
)
echo Backend .env found.

:: Check frontend .env
if not exist "frontend\.env" (
    echo ERROR: frontend\.env not found!
    echo Please run install.bat first to create environment files.
    echo.
    pause
    exit /b 1
)
echo Frontend .env found.

echo.
echo ========================================
echo Starting Servers
echo ========================================

echo.
echo Starting backend server (port 3003)...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"
cd /d "%~dp0"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

echo.
echo Starting frontend server (port 3000)...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"
cd /d "%~dp0"

echo.
echo ========================================
echo Started Successfully!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:3003/api
echo.
echo NOTE: If login doesn't work, make sure MongoDB is running
echo       and you have created a user account.
echo.
pause
