@echo off
setlocal enabledelayedexpansion

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
echo ========================================
echo Setting up Environment Files
echo ========================================

:: Check and copy backend .env file
if not exist "backend\.env" (
    echo Creating backend .env file...
    if exist "backend\.env.example" (
        copy "backend\.env.example" "backend\.env" >nul
        echo Created backend\.env from .env.example
    ) else (
        echo WARNING: backend\.env.example not found
    )
) else (
    echo Backend .env already exists
)

:: Check and copy frontend .env file
if not exist "frontend\.env" (
    echo Creating frontend .env file...
    if exist "frontend\.env.lan" (
        copy "frontend\.env.lan" "frontend\.env" >nul
        echo Created frontend\.env from .env.lan
    ) else (
        echo # Frontend Environment > "frontend\.env"
        echo VITE_API_URL=http://localhost:3003/api >> "frontend\.env"
        echo Created frontend\.env with default settings
    )
) else (
    echo Frontend .env already exists
)

echo.
echo ========================================
echo Installing Dependencies
echo ========================================

echo.
echo Installing backend dependencies...
cd /d "%~dp0backend"
call npm install
cd /d "%~dp0"

if %errorlevel% neq 0 (
    echo ERROR: Failed to install backend dependencies!
    pause
    exit /b 1
)

echo.
echo Installing frontend dependencies...
cd /d "%~dp0frontend"
call npm install
cd /d "%~dp0"

if %errorlevel% neq 0 (
    echo ERROR: Failed to install frontend dependencies!
    pause
    exit /b 1
)

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo IMPORTANT: If this is the FIRST time running the app:
echo 1. Make sure MongoDB is installed and running
echo 2. The backend .env file has been created with default settings
echo 3. The frontend .env file has been created with localhost API
echo.
echo NEXT STEPS:
echo 1. Make sure MongoDB is running (install from mongodb.com if needed)
echo 2. Run: cd backend ^&^& npm run seed  (to create admin user)
echo 3. Run: start-server.bat
echo.
echo DEFAULT LOGIN (after running seed):
echo   Username: admin
echo   Password: admin123
echo.
pause
