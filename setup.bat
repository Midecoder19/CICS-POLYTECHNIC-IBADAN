@echo off
setlocal enabledelayedexpansion

echo ========================================
echo PolyIbadan First-Time Setup
echo ========================================
echo.
echo This will:
echo 1. Install all dependencies
echo 2. Create environment files
echo 3. Seed the database with admin user
echo 4. Start the application
echo.

:: Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js first.
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
echo Node.js found.

echo.
echo ========================================
echo Setting up Environment Files
echo ========================================

:: Create backend .env
if not exist "backend\.env" (
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo Created backend\.env
    )
)

:: Create frontend .env
if not exist "frontend\.env" (
    if exist "frontend\.env.lan" (
        copy "frontend\.env.lan" "frontend\.env" >nul
        echo Created frontend\.env
    ) else (
        echo VITE_API_URL=http://localhost:3003/api > "frontend\.env"
        echo Created frontend\.env
    )
)

echo.
echo ========================================
echo Installing Dependencies
echo ========================================

echo.
echo Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)

cd /d "%~dp0"

echo.
echo ========================================
echo Seeding Database
echo ========================================
echo.
echo Make sure MongoDB is running before proceeding!
echo.
echo Press any key to run seed command...
pause >nul

cd /d "%~dp0backend"
call npm run seed
cd /d "%~dp0"

if %errorlevel% neq 0 (
    echo.
    echo WARNING: Seed command failed. This is normal if MongoDB is not running.
    echo You can run it manually later with: cd backend ^&^& npm run seed
) else (
    echo.
    echo Seed completed successfully!
)

echo.
echo ========================================
echo Starting Servers
echo ========================================

echo.
echo Starting backend server...
cd /d "%~dp0backend"
start "Backend Server" cmd /k "npm run dev"
cd /d "%~dp0"

timeout /t 3 /nobreak >nul

echo.
echo Starting frontend server...
cd /d "%~dp0frontend"
start "Frontend Server" cmd /k "npm run dev"
cd /d "%~dp0"

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:3003/api
echo.
echo DEFAULT LOGIN:
echo   Username: admin
echo   Password: admin123
echo.
echo IMPORTANT: If login doesn't work, make sure MongoDB is running!
echo.

pause
