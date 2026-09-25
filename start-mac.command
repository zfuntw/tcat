#!/bin/bash
cd "$(dirname "$0")"
if ! command -v node >/dev/null 2>&1; then
  echo "找不到 Node.js，請先到 https://nodejs.org 下載安裝 LTS 版本，裝好後再雙擊本檔案。"
  open https://nodejs.org
  read -p "按 Enter 關閉"
  exit 1
fi
if [ ! -d node_modules ]; then
  echo "第一次啟動，正在安裝套件，約需 1 分鐘..."
  npm install
fi
echo ""
echo "網站啟動中，請勿關閉此視窗。關閉視窗 = 網站停止。"
(sleep 2 && open http://localhost:3000/admin) &
node server.js
