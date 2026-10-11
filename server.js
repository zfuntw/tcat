const path = require('path');
const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const db = require('./lib/db');
const helpers = require('./lib/helpers');
const fs = require('fs');
const { UPLOAD_DIR, DATA_DIR } = require('./lib/paths');
const FileStore = require('./lib/session-store');

db.load();

// 沒設定 SESSION_SECRET 時，自動產生一組並存在 DATA_DIR，重啟後沿用
function loadSecret() {
  const file = path.join(DATA_DIR, '.session-secret');
  try {
    return fs.readFileSync(file, 'utf8').trim();
  } catch {
    const secret = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(file, secret, { mode: 0o600 });
    return secret;
  }
}

const app = express();
const PORT = process.env.PORT || 3000;
const isProd = process.env.NODE_ENV === 'production';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('trust proxy', 1);
app.disable('x-powered-by');

const staticOpts = {
  maxAge: isProd ? '7d' : 0,
  // 上傳的 SVG 禁止執行腳本
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.svg')) res.setHeader('Content-Security-Policy', "script-src 'none'");
  }
};
// 上傳圖片可放在 public 以外的目錄（雲端主機的永久磁碟）
app.use('/uploads', express.static(UPLOAD_DIR, staticOpts));
app.use(express.static(path.join(__dirname, 'public'), staticOpts));
// 後台文章編輯器（Quill）由本機提供，不依賴外部 CDN
app.use('/vendor/quill', express.static(path.join(__dirname, 'node_modules', 'quill', 'dist')));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

app.use(
  session({
    name: 'sid',
    store: new FileStore(),
    secret: process.env.SESSION_SECRET || loadSecret(),
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: isProd, maxAge: 1000 * 60 * 60 * 8 }
  })
);

// 所有模板共用的變數
app.use((req, res, next) => {
  res.locals.site = db.data.settings;
  res.locals.h = helpers;
  res.locals.currentPath = req.path;
  res.locals.year = new Date().getFullYear();
  next();
});

app.use('/admin', require('./routes/admin'));
app.use('/', require('./routes/site'));

app.use((req, res) => {
  res.status(404).render('site/404', { pageTitle: '找不到頁面' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('伺服器發生錯誤，請稍後再試。');
});

app.listen(PORT, () => {
  console.log(`網站已啟動：http://localhost:${PORT}`);
  console.log(`後台登入：http://localhost:${PORT}/admin`);
});
