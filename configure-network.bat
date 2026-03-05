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
    pause
    exit /b 1
)

echo Your server IP: %IP%

echo Updating frontend config...
echo VITE_API_URL=http://%IP%:3003/api > frontend\.env

echo.
echo ========================================
echo Network Config Complete!
echo ========================================
echo.
echo Other devices can access: http://%IP%:3000
echo.
pause
