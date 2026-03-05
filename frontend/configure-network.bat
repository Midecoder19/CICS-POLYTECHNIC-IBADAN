@echo off
echo ========================================
echo PolyIbadan Network Configuration
echo ========================================
echo.

echo Detecting your local IP address...
for /f %%i in ('powershell -command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Wi-Fi' -ErrorAction SilentlyContinue).IPAddress"') do set IP=%%i
if "%IP%"=="" for /f %%i in ('powershell -command "(Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias 'Ethernet' -ErrorAction SilentlyContinue).IPAddress"') do set IP=%%i
if "%IP%"=="" for /f %%i in ('powershell -command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like '192.168.*'}).IPAddress"') do set IP=%%i

if "%IP%"=="" (
    echo Error: Could not detect IP address.
    echo Please check your network connection and try again.
    pause
    exit /b 1
)

echo Your server IP address is: %IP%
echo.

echo Updating frontend configuration...
echo VITE_API_URL=http://%IP%:3003/api> frontend\.env

echo.
echo ========================================
echo Network configuration completed!
echo ========================================
echo.
echo Frontend API URL updated to: http://%IP%:3003/api
echo.
echo Instructions for other devices:
echo 1. Connect to the same Wi-Fi network
echo 2. Open a web browser
echo 3. Navigate to: http://%IP%:3000
echo.
echo Make sure:
echo - Windows Firewall allows connections on ports 3000 and 3003
echo - All devices are on the same network
echo - The server laptop stays awake and connected
echo.
echo Press any key to continue...
pause >nul
