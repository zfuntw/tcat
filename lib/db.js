// 簡易 JSON 檔資料庫：資料存在 data/db.json，寫入採「先寫暫存檔再改名」避免檔案損毀
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const defaults = require('./defaults');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

let data;

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (fs.existsSync(DB_FILE)) {
    data = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    // 補上新版本新增的欄位，舊資料不會被覆蓋
    const def = defaults();
    for (const key of Object.keys(def)) {
      if (data[key] === undefined) data[key] = def[key];
    }
    for (const key of ['settings', 'home']) {
      data[key] = { ...def[key], ...data[key] };
    }
    data.pages = { ...def.pages, ...data.pages };
  } else {
    data = defaults();
  }
  if (!data.users.length) {
    const username = process.env.ADMIN_USER || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin1234';
    data.users.push({
      id: newId(),
      username,
      passwordHash: bcrypt.hashSync(password, 10),
      mustChangePassword: !process.env.ADMIN_PASSWORD
    });
    console.log(`[db] 已建立管理員帳號：${username}（初始密碼：${process.env.ADMIN_PASSWORD ? '環境變數 ADMIN_PASSWORD' : password}）`);
  }
  save();
}

function save() {
  const tmp = DB_FILE + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
  fs.renameSync(tmp, DB_FILE);
}

function newId() {
  return crypto.randomBytes(6).toString('hex');
}

module.exports = {
  load,
  save,
  newId,
  get data() {
    return data;
  }
};
