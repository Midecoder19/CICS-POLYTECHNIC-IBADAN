@echo off
echo ========================================
echo MongoDB Server Starter
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERROR] This script must be run as Administrator!
    echo.
    echo Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo [1/3] Checking MongoDB service status...
sc query MongoDB >nul 2>&1
if %errorLevel% equ 0 (
    echo [INFO] MongoDB service found
    sc query MongoDB | findstr "RUNNING" >nul
    if %errorLevel% equ 0 (
        echo [SUCCESS] MongoDB service is already running!
        echo.
        echo MongoDB is ready to use.
        echo Connection string: mongodb://localhost:27017
        pause
        exit /b 0
    ) else (
        echo [INFO] MongoDB service is stopped, starting...
        net start MongoDB
        if %errorLevel% equ 0 (
            echo [SUCCESS] MongoDB service started successfully!
            echo.
            echo MongoDB is ready to use.
            echo Connection string: mongodb://localhost:27017
            pause
            exit /b 0
        ) else (
            echo [ERROR] Failed to start MongoDB service
            echo.
            goto :manual_start
        )
    )
) else (
    echo [WARNING] MongoDB service not found
    echo.
    goto :manual_start
)

:manual_start
echo [2/3] Attempting to start MongoDB manually...

REM Try to find MongoDB installation
set MONGODB_PATH=
if exist "C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe
) else if exist "C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe
) else if exist "C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" (
    set MONGODB_PATH=C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe
) else if exist "C:\mongodb\bin\mongod.exe" (
    set MONGODB_PATH=C:\mongodb\bin\mongod.exe
)

if defined MONGODB_PATH (
    echo [INFO] Found MongoDB at: %MONGODB_PATH%
    echo.
    echo [3/3] Creating data directory if needed...
    if not exist "C:\data\db" (
        mkdir "C:\data\db" 2>nul
        if %errorLevel% equ 0 (
            echo [SUCCESS] Created data directory: C:\data\db
        ) else (
            echo [WARNING] Could not create data directory. You may need to create it manually.
        )
    )
    echo.
    echo [INFO] Starting MongoDB server...
    echo [NOTE] Keep this window open - MongoDB runs in this window
    echo [NOTE] Press Ctrl+C to stop MongoDB
    echo.
    echo ========================================
    echo MongoDB Server Starting...
    echo Connection: mongodb://localhost:27017
    echo ========================================
    echo.
    "%MONGODB_PATH%" --dbpath "C:\data\db"
) else (
    echo [ERROR] MongoDB installation not found!
    echo.
    echo MongoDB is not installed or not in the expected location.
    echo.
    echo Please install MongoDB Community Server:
    echo 1. Download from: https://www.mongodb.com/try/download/community
    echo 2. Run the installer
    echo 3. Make sure to check "Install MongoDB as a Service"
    echo 4. Run this script again after installation
    echo.
    pause
    exit /b 1
)
