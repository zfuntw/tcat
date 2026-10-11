const fs = require('fs');
const path = require('path');

// 雲端部署時只要掛一顆永久磁碟並設定 DATA_DIR（例如 /data），
// 資料檔與上傳圖片就會一起存在裡面，重新部署也不會遺失
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const UPLOAD_DIR =
  process.env.UPLOAD_DIR || (process.env.DATA_DIR ? path.join(DATA_DIR, 'uploads') : path.join(__dirname, '..', 'public', 'uploads'));

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

module.exports = { DATA_DIR, UPLOAD_DIR };
