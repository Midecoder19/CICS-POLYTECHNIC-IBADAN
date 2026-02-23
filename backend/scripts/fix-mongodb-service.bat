@echo off
echo ========================================
echo MongoDB Service Fix Script
echo ========================================
echo.
echo This script will fix MongoDB service issues permanently.
echo Make sure to run this as Administrator!
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ Please run this script as Administrator!
    echo Right-click the batch file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo 🔍 Checking MongoDB service status...
sc query MongoDB >nul 2>&1
if %errorLevel% neq 0 (
    echo ❌ MongoDB service not found. Installing MongoDB service...
    echo.
    echo Please install MongoDB Community Server from:
    echo https://www.mongodb.com/try/download/community
    echo.
    echo Make sure to check "Install MongoDB as a Service" during installation.
    pause
    exit /b 1
)

echo ✅ MongoDB service found
echo.

REM Stop the service if running
echo 🔄 Stopping MongoDB service (if running)...
net stop MongoDB >nul 2>&1

REM Configure service to start automatically
echo 🔧 Configuring MongoDB service to start automatically...
sc config MongoDB start= auto

REM Set service to run as Local System (recommended for MongoDB)
echo 🔧 Setting service to run as Local System...
sc config MongoDB obj= LocalSystem

REM Start the service
echo 🚀 Starting MongoDB service...
net start MongoDB

if %errorLevel% == 0 (
    echo.
    echo ✅ SUCCESS: MongoDB service is now running and configured to start automatically!
    echo.
    echo 📋 Service Details:
    sc query MongoDB
    echo.
    echo 💡 MongoDB should now start automatically on system boot.
    echo 💡 If you still have connection issues, check firewall settings.
) else (
    echo.
    echo ❌ FAILED: Could not start MongoDB service.
    echo.
    echo 🔍 Troubleshooting:
    echo 1. Check if port 27017 is available: netstat -ano | findstr :27017
    echo 2. Check MongoDB logs in: C:\Program Files\MongoDB\Server\7.0\log\
    echo 3. Try starting MongoDB manually: "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
)

echo.
echo Press any key to exit...
pause >nul
