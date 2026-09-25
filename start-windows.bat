@echo off
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

if exist node_modules\express goto run
echo [1/2] Installing packages (first run only, about 1 minute)...
call npm install
if errorlevel 1 goto installfail

:run
echo.
echo [2/2] Website is running. KEEP THIS WINDOW OPEN.
echo       Closing this window will stop the website.
echo       Admin: http://localhost:3000/admin
echo.
start "" http://localhost:3000/admin
node server.js
pause
exit /b

:nonode
echo Node.js not found. Please install the LTS version from https://nodejs.org
start "" https://nodejs.org
pause
exit /b

:installfail
echo.
echo npm install FAILED. Please take a screenshot of this window.
pause
exit /b
