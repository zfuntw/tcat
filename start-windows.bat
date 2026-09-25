@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo 找不到 Node.js，請先到 https://nodejs.org 下載安裝 LTS 版本，裝好後再雙擊本檔案。
  start https://nodejs.org
  pause
  exit /b
)
if not exist node_modules (
  echo 第一次啟動，正在安裝套件，約需 1 分鐘...
  call npm install
)
echo.
echo 網站啟動中，請勿關閉此視窗。關閉視窗 = 網站停止。
start "" http://localhost:3000/admin
node server.js
pause
