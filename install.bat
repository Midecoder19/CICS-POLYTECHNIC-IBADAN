@echo off
echo ========================================
echo PolyIbadan App Installation Script
echo ========================================
echo.

echo Checking for Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Node.js not found. Installing Node.js...
    echo Downloading Node.js installer...
    powershell -Command "Invoke-WebRequest -Uri 'https://nodejs.org/dist/v18.17.1/node-v18.17.1-x64.msi' -OutFile 'node-installer.msi'"
    echo Installing Node.js...
    msiexec /i node-installer.msi /quiet /norestart
    del node-installer.msi
    echo Node.js installed successfully.
) else (
    echo Node.js is already installed.
)

echo.
echo Checking for MongoDB...
mongod --version >nul 2>&1
if %errorlevel% neq 0 (
    echo MongoDB not found. Installing MongoDB...
    echo Downloading MongoDB installer...
    powershell -Command "Invoke-WebRequest -Uri 'https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.2-signed.msi' -OutFile 'mongodb-installer.msi'"
    echo Installing MongoDB...
    msiexec /i mongodb-installer.msi /quiet /norestart INSTALLLOCATION="C:\Program Files\MongoDB" ADDLOCAL="all"
    del mongodb-installer.msi

    echo Creating MongoDB data directory...
    if not exist "C:\data\db" mkdir "C:\data\db"

    echo Installing MongoDB as a service...
    "C:\Program Files\MongoDB\bin\mongod.exe" --config "C:\Program Files\MongoDB\mongod.cfg" --install

    echo MongoDB installed successfully.
) else (
    echo MongoDB is already installed.
)

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
echo Installation completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Run start-server.bat to start the application
echo 2. Access the app at http://localhost:3000 (frontend)
echo 3. Backend API at http://localhost:3003/api
echo.
pause
