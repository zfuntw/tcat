const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const db = require('../lib/db');
const { uniqueSlug, cleanHtml, cleanMapEmbed } = require('../lib/helpers');
const forms = require('../lib/forms');

const router = express.Router();
const UPLOAD_DIR = path.join(__dirname, '..', 'public', 'uploads');
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'];

const upload = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024, files: 20 },
  fileFilter: (req, file, cb) => {
    const ok = IMAGE_EXT.includes(path.extname(file.originalname).toLowerCase()) && /^image\//.test(file.mimetype);
    cb(ok ? null : new Error('只接受圖片檔（jpg、png、gif、webp、svg、ico）'), ok);
  }
});

// ---------- 共用中介層 ----------
router.use((req, res, next) => {
  if (!req.session.csrf) req.session.csrf = crypto.randomBytes(24).toString('hex');
  res.locals.csrf = req.session.csrf;
  res.locals.user = db.data.users.find((u) => u.id === req.session.userId);
  res.locals.flash = req.session.flash;
  res.locals.unread = db.data.messages.filter((m) => !m.read).length;
  delete req.session.flash;
  next();
});

// 解析 multipart 表單並檢查 CSRF
router.use((req, res, next) => {
  if (req.method !== 'POST') return next();
  upload.any()(req, res, (err) => {
    const token = (req.body && req.body._csrf) || req.get('x-csrf-token');
    if (token !== req.session.csrf) {
      cleanupFiles(req);
      return res.status(403).send('表單已過期，請重新整理頁面後再試一次。');
    }
    if (err) {
      if (req.xhr || req.get('accept')?.includes('json')) return res.status(400).json({ error: err.message });
      flash(req, 'error', err.message);
      return res.redirect(req.get('referer') || '/admin');
    }
    registerMedia(req);
    next();
  });
});

function cleanupFiles(req) {
  (req.files || []).forEach((f) => fs.unlink(f.path, () => {}));
}

function registerMedia(req) {
  for (const f of req.files || []) {
    db.data.media.unshift({
      id: db.newId(),
      url: `/uploads/${f.filename}`,
      name: f.originalname,
      size: f.size,
      createdAt: new Date().toISOString()
    });
  }
  if (req.files && req.files.length) db.save();
}

function flash(req, type, text) {
  req.session.flash = { type, text };
}

function requireLogin(req, res, next) {
  if (!res.locals.user) return res.redirect('/admin/login?next=' + encodeURIComponent(req.originalUrl));
  if (res.locals.user.mustChangePassword && !req.path.startsWith('/account')) {
    flash(req, 'error', '請先修改預設密碼');
    return res.redirect('/admin/account');
  }
  next();
}

// 取得上傳圖片網址：有新上傳用新檔、勾選移除則清空、否則保留原值
function imageField(req, name, current) {
  const f = (req.files || []).find((x) => x.fieldname === name + 'File');
  if (f) return `/uploads/${f.filename}`;
  if (req.body[name + 'Remove']) return '';
  if (req.body[name] !== undefined) return String(req.body[name]).trim();
  return current || '';
}

// 依表單定義把 req.body 寫回物件
function applySchema(req, schema, target) {
  for (const section of schema) {
    for (const field of section.fields) {
      const { name, type } = field;
      if (type === 'image') target[name] = imageField(req, name, target[name]);
      else if (type === 'checkbox') target[name] = !!req.body[name];
      else if (type === 'richtext') target[name] = cleanHtml(req.body[name]);
      else if (type === 'map') target[name] = cleanMapEmbed(req.body[name]);
      else if (type === 'pairs') target[name] = parsePairs(req.body[name], field.keys);
      else if (type === 'code') target[name] = String(req.body[name] || '');
      else if (type === 'select') {
        if (field.options.some((o) => o[0] === req.body[name])) target[name] = req.body[name];
      } else if (type === 'color') target[name] = /^#[0-9a-f]{6}$/i.test(req.body[name]) ? req.body[name] : target[name];
      else if (req.body[name] !== undefined) target[name] = String(req.body[name]).trim();
    }
  }
}

function parsePairs(text, keys) {
  return String(text || '')
    .split(/\r?\n/)
    .map((line) => line.split('|').map((s) => s.trim()))
    .filter((parts) => parts[0])
    .map((parts) => ({ [keys[0]]: parts[0], [keys[1]]: parts[1] || '' }));
}

// ---------- 登入 ----------
const loginFails = new Map();

router.get('/login', (req, res) => {
  if (res.locals.user) return res.redirect('/admin');
  res.render('admin/login', { error: '' });
});

router.post('/login', (req, res) => {
  const key = req.ip;
  const rec = loginFails.get(key) || { count: 0, until: 0 };
  if (rec.until > Date.now()) {
    return res.render('admin/login', { error: '登入失敗次數過多，請 10 分鐘後再試' });
  }
  const user = db.data.users.find((u) => u.username === String(req.body.username || '').trim());
  if (!user || !bcrypt.compareSync(String(req.body.password || ''), user.passwordHash)) {
    rec.count += 1;
    if (rec.count >= 5) Object.assign(rec, { count: 0, until: Date.now() + 10 * 60 * 1000 });
    loginFails.set(key, rec);
    return res.render('admin/login', { error: '帳號或密碼錯誤' });
  }
  loginFails.delete(key);
  const next = String(req.query.next || '');
  req.session.regenerate(() => {
    req.session.userId = user.id;
    res.redirect(next.startsWith('/admin') ? next : '/admin');
  });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

router.use(requireLogin);

// ---------- 儀表板 ----------
router.get('/', (req, res) => {
  const d = db.data;
  const topPosts = [...d.posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  res.render('admin/dashboard', {
    title: '儀表板',
    stats: {
      posts: d.posts.filter((p) => p.status === 'published').length,
      drafts: d.posts.filter((p) => p.status !== 'published').length,
      works: d.works.length,
      messages: d.messages.length
    },
    messages: d.messages.slice(0, 5),
    topPosts
  });
});

// ---------- 通用表單頁（網站設定、首頁、關於、聯絡） ----------
const formPages = {
  settings: { title: '網站設定', schema: forms.settings, target: () => db.data.settings },
  home: { title: '首頁內容', schema: forms.home, target: () => db.data.home },
  about: { title: '關於我們頁面', schema: forms.about, target: () => db.data.pages.about },
  contact: { title: '聯絡我們頁面', schema: forms.contact, target: () => db.data.pages.contact }
};

router.get('/edit/:key', (req, res, next) => {
  const fp = formPages[req.params.key];
  if (!fp) return next();
  res.render('admin/form', { title: fp.title, schema: fp.schema, values: fp.target(), action: req.originalUrl });
});

router.post('/edit/:key', (req, res, next) => {
  const fp = formPages[req.params.key];
  if (!fp) return next();
  applySchema(req, fp.schema, fp.target());
  db.save();
  flash(req, 'success', '已儲存');
  res.redirect(req.originalUrl);
});

// ---------- 文章 ----------
router.get('/posts', (req, res) => {
  const status = req.query.status || '';
  const q = (req.query.q || '').trim().toLowerCase();
  let posts = [...db.data.posts].sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
  if (status) posts = posts.filter((p) => p.status === status);
  if (q) posts = posts.filter((p) => p.title.toLowerCase().includes(q));
  res.render('admin/posts', { title: '文章管理', posts, status, q: req.query.q || '', categories: db.data.categories });
});

router.get('/posts/new', (req, res) => {
  res.render('admin/post-edit', {
    title: '新增文章',
    post: { status: 'draft', tags: [], author: res.locals.user.username, publishedAt: new Date().toISOString() },
    categories: db.data.categories
  });
});

router.get('/posts/:id', (req, res, next) => {
  const post = db.data.posts.find((p) => p.id === req.params.id);
  if (!post) return next();
  res.render('admin/post-edit', { title: '編輯文章', post, categories: db.data.categories });
});

router.post(['/posts/new', '/posts/:id'], (req, res, next) => {
  const isNew = !req.params.id;
  let post = isNew ? { id: db.newId(), createdAt: new Date().toISOString(), views: 0 } : db.data.posts.find((p) => p.id === req.params.id);
  if (!post) return next();
  const b = req.body;
  const title = String(b.title || '').trim();
  if (!title) {
    flash(req, 'error', '請輸入標題');
    return res.redirect(req.get('referer') || '/admin');
  }
  const published = b.publishedAt ? new Date(b.publishedAt + ':00+08:00') : new Date();
  Object.assign(post, {
    title,
    slug: uniqueSlug(b.slug || title, db.data.posts, post.id),
    excerpt: String(b.excerpt || '').trim(),
    content: cleanHtml(b.content),
    cover: imageField(req, 'cover', post.cover),
    categoryId: b.categoryId || '',
    tags: String(b.tags || '')
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean),
    status: b.status === 'published' ? 'published' : 'draft',
    featured: !!b.featured,
    author: String(b.author || '').trim(),
    metaTitle: String(b.metaTitle || '').trim(),
    metaDescription: String(b.metaDescription || '').trim(),
    publishedAt: isNaN(published) ? new Date().toISOString() : published.toISOString(),
    updatedAt: new Date().toISOString()
  });
  if (isNew) db.data.posts.push(post);
  db.save();
  flash(req, 'success', post.status === 'published' ? '文章已發布' : '草稿已儲存');
  res.redirect(`/admin/posts/${post.id}`);
});

router.post('/posts/:id/delete', (req, res) => {
  db.data.posts = db.data.posts.filter((p) => p.id !== req.params.id);
  db.save();
  flash(req, 'success', '文章已刪除');
  res.redirect('/admin/posts');
});

// ---------- 文章分類 ----------
router.get('/categories', (req, res) => {
  const counts = {};
  db.data.posts.forEach((p) => (counts[p.categoryId] = (counts[p.categoryId] || 0) + 1));
  res.render('admin/categories', { title: '文章分類', categories: db.data.categories, counts });
});

router.post('/categories', (req, res) => {
  const name = String(req.body.name || '').trim();
  if (name) {
    db.data.categories.push({ id: db.newId(), name, slug: uniqueSlug(req.body.slug || name, db.data.categories) });
    db.save();
    flash(req, 'success', '分類已新增');
  }
  res.redirect('/admin/categories');
});

router.post('/categories/:id', (req, res) => {
  const cat = db.data.categories.find((c) => c.id === req.params.id);
  if (cat && req.body.name) {
    cat.name = String(req.body.name).trim();
    cat.slug = uniqueSlug(req.body.slug || cat.name, db.data.categories, cat.id);
    db.save();
    flash(req, 'success', '分類已更新');
  }
  res.redirect('/admin/categories');
});

router.post('/categories/:id/delete', (req, res) => {
  db.data.categories = db.data.categories.filter((c) => c.id !== req.params.id);
  db.data.posts.forEach((p) => {
    if (p.categoryId === req.params.id) p.categoryId = '';
  });
  db.save();
  flash(req, 'success', '分類已刪除（原分類文章改為未分類）');
  res.redirect('/admin/categories');
});

// ---------- 作品集與服務項目（共用 CRUD） ----------
const collections = {
  works: {
    label: '作品',
    title: '作品集管理',
    schema: forms.work,
    hasSlug: true
  },
  services: {
    label: '服務項目',
    title: '服務項目管理',
    schema: forms.service,
    hasSlug: false
  }
};

for (const colName of Object.keys(collections)) {
  router.get(`/${colName}`, (req, res) => {
    req.params.col = colName;
    const c = collections[req.params.col];
    const items = [...db.data[req.params.col]].sort((a, b) => a.order - b.order);
    res.render('admin/collection', { title: c.title, col: req.params.col, label: c.label, items });
  });

  router.get(`/${colName}/:id`, (req, res, next) => {
    req.params.col = colName;
    const c = collections[req.params.col];
    const isNew = req.params.id === 'new';
    const item = isNew ? { order: db.data[req.params.col].length + 1 } : db.data[req.params.col].find((x) => x.id === req.params.id);
    if (!item) return next();
    res.render('admin/form', {
      title: (isNew ? '新增' : '編輯') + c.label,
      schema: c.schema,
      values: item,
      action: req.originalUrl,
      back: `/admin/${req.params.col}`,
      deleteAction: isNew ? null : `/admin/${req.params.col}/${item.id}/delete`,
      viewUrl: c.hasSlug && !isNew ? `/works/${encodeURIComponent(item.slug)}` : null
    });
  });

  router.post(`/${colName}/:id`, (req, res, next) => {
    req.params.col = colName;
    const col = req.params.col;
    const c = collections[col];
    const isNew = req.params.id === 'new';
    const item = isNew ? { id: db.newId(), createdAt: new Date().toISOString() } : db.data[col].find((x) => x.id === req.params.id);
    if (!item) return next();
    if (!String(req.body.title || '').trim()) {
      flash(req, 'error', '請輸入標題');
      return res.redirect(req.get('referer') || '/admin');
    }
    applySchema(req, c.schema, item);
    item.order = parseInt(item.order, 10) || 0;
    if (c.hasSlug) item.slug = uniqueSlug(req.body.slug || item.title, db.data[col], item.id);
    if (isNew) db.data[col].push(item);
    db.save();
    flash(req, 'success', '已儲存');
    res.redirect(`/admin/${col}/${item.id}`);
  });

  router.post(`/${colName}/:id/delete`, (req, res) => {
    const col = colName;
    db.data[col] = db.data[col].filter((x) => x.id !== req.params.id);
    db.save();
    flash(req, 'success', '已刪除');
    res.redirect(`/admin/${col}`);
  });
}

// ---------- 聯絡訊息 ----------
router.get('/messages', (req, res) => {
  res.render('admin/messages', { title: '聯絡訊息', messages: db.data.messages });
});

router.get('/messages/:id', (req, res, next) => {
  const msg = db.data.messages.find((m) => m.id === req.params.id);
  if (!msg) return next();
  if (!msg.read) {
    msg.read = true;
    db.save();
    res.locals.unread = Math.max(0, res.locals.unread - 1);
  }
  res.render('admin/message', { title: '訊息內容', msg });
});

router.post('/messages/:id/delete', (req, res) => {
  db.data.messages = db.data.messages.filter((m) => m.id !== req.params.id);
  db.save();
  flash(req, 'success', '訊息已刪除');
  res.redirect('/admin/messages');
});

router.get('/messages.csv', (req, res) => {
  const esc = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
  const rows = [['時間', '姓名', 'Email', '電話', '主旨', '內容']].concat(
    db.data.messages.map((m) => [m.createdAt, m.name, m.email, m.phone, m.subject, m.message])
  );
  res.setHeader('Content-Disposition', 'attachment; filename="messages.csv"');
  res.type('text/csv').send('﻿' + rows.map((r) => r.map(esc).join(',')).join('\n'));
});

// ---------- 媒體庫 ----------
router.get('/media', (req, res) => {
  res.render('admin/media', { title: '媒體庫', media: db.data.media });
});

router.post('/media', (req, res) => {
  flash(req, 'success', `已上傳 ${(req.files || []).length} 個檔案`);
  res.redirect('/admin/media');
});

// 給文章編輯器插入圖片用（回傳 JSON）
router.post('/media/upload', (req, res) => {
  const f = (req.files || [])[0];
  if (!f) return res.status(400).json({ error: '沒有收到檔案' });
  res.json({ url: `/uploads/${f.filename}` });
});

router.post('/media/:id/delete', (req, res) => {
  const item = db.data.media.find((m) => m.id === req.params.id);
  if (item) {
    const file = path.join(UPLOAD_DIR, path.basename(item.url));
    fs.unlink(file, () => {});
    db.data.media = db.data.media.filter((m) => m.id !== item.id);
    db.save();
    flash(req, 'success', '檔案已刪除');
  }
  res.redirect('/admin/media');
});

// ---------- 帳號 ----------
router.get('/account', (req, res) => {
  res.render('admin/account', { title: '帳號設定' });
});

router.post('/account', (req, res) => {
  const user = res.locals.user;
  const { current = '', password = '', confirm = '', username = '' } = req.body;
  if (!bcrypt.compareSync(current, user.passwordHash)) {
    flash(req, 'error', '目前密碼不正確');
  } else if (password && password.length < 8) {
    flash(req, 'error', '新密碼至少 8 碼');
  } else if (password !== confirm) {
    flash(req, 'error', '兩次輸入的新密碼不一致');
  } else {
    if (username.trim()) user.username = username.trim();
    if (password) {
      user.passwordHash = bcrypt.hashSync(password, 10);
      user.mustChangePassword = false;
    }
    db.save();
    flash(req, 'success', '帳號已更新');
  }
  res.redirect('/admin/account');
});

// ---------- 資料備份 ----------
router.get('/backup.json', (req, res) => {
  const { users, ...rest } = db.data;
  res.setHeader('Content-Disposition', `attachment; filename="backup-${new Date().toISOString().slice(0, 10)}.json"`);
  res.json(rest);
});

module.exports = router;
