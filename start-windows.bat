@echo off
title Studio Website - KEEP THIS WINDOW OPEN
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 goto nonode

if exist node_modules\express\package.json goto run
echo [1/2] Installing packages (first run only, about 1-3 minutes)...
call npm install
if errorlevel 1 goto installfail

:run
echo.
echo ==========================================================
echo   Website is starting. KEEP THIS WINDOW OPEN.
echo   Closing this window = website stops.
echo.
echo   Admin : http://localhost:3000/admin
echo   Site  : http://localhost:3000
echo ==========================================================
echo.
start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000/admin"
node server.js
echo.
echo The website has STOPPED. Take a screenshot of this window if you see errors above.
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
