const express = require('express');
const db = require('../lib/db');
const { stripTags } = require('../lib/helpers');

const router = express.Router();
const PER_PAGE = 9;

const publishedPosts = () =>
  db.data.posts
    .filter((p) => p.status === 'published' && new Date(p.publishedAt) <= new Date())
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

const sortedServices = () => [...db.data.services].sort((a, b) => a.order - b.order);
const sortedWorks = () => [...db.data.works].sort((a, b) => a.order - b.order);
const categoryOf = (post) => db.data.categories.find((c) => c.id === post.categoryId);

router.get('/', (req, res) => {
  res.render('site/home', {
    pageTitle: '',
    home: db.data.home,
    services: sortedServices(),
    works: sortedWorks().filter((w) => w.featured).slice(0, 6),
    posts: publishedPosts().slice(0, 3),
    categoryOf
  });
});

// 相容參考網站的中文網址
router.get(['/首頁', '/%E9%A6%96%E9%A0%81'], (req, res) => res.redirect(301, '/'));

router.get('/about', (req, res) => {
  const page = db.data.pages.about;
  res.render('site/about', { pageTitle: page.title, page, home: db.data.home });
});

router.get('/services', (req, res) => {
  res.render('site/services', { pageTitle: '服務項目', services: sortedServices(), home: db.data.home });
});

router.get('/works', (req, res) => {
  const works = sortedWorks();
  const cats = [...new Set(works.map((w) => w.category).filter(Boolean))];
  const active = req.query.category || '';
  res.render('site/works', {
    pageTitle: '作品集',
    works: active ? works.filter((w) => w.category === active) : works,
    cats,
    active
  });
});

router.get('/works/:slug', (req, res, next) => {
  const work = db.data.works.find((w) => w.slug === req.params.slug);
  if (!work) return next();
  const others = sortedWorks().filter((w) => w.id !== work.id).slice(0, 3);
  res.render('site/work', { pageTitle: work.title, work, others, metaDescription: stripTags(work.description).slice(0, 150) });
});

router.get(['/blog', '/blog/category/:cat', '/blog/tag/:tag'], (req, res, next) => {
  let posts = publishedPosts();
  let heading = '文章專欄';
  let activeCat = null;
  if (req.params.cat) {
    activeCat = db.data.categories.find((c) => c.slug === req.params.cat);
    if (!activeCat) return next();
    posts = posts.filter((p) => p.categoryId === activeCat.id);
    heading = activeCat.name;
  }
  if (req.params.tag) {
    posts = posts.filter((p) => (p.tags || []).includes(req.params.tag));
    heading = `#${req.params.tag}`;
  }
  const q = (req.query.q || '').trim();
  if (q) {
    const k = q.toLowerCase();
    posts = posts.filter((p) => (p.title + p.excerpt + stripTags(p.content)).toLowerCase().includes(k));
    heading = `搜尋：${q}`;
  }
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const totalPages = Math.max(1, Math.ceil(posts.length / PER_PAGE));
  res.render('site/blog', {
    pageTitle: heading,
    heading,
    posts: posts.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    categories: db.data.categories,
    activeCat,
    categoryOf,
    q,
    page,
    totalPages
  });
});

router.get('/blog/:slug', (req, res, next) => {
  const post = publishedPosts().find((p) => p.slug === req.params.slug);
  // 管理員可預覽草稿
  const draft = !post && req.session.userId && db.data.posts.find((p) => p.slug === req.params.slug);
  const target = post || draft;
  if (!target) return next();
  if (post) {
    post.views = (post.views || 0) + 1;
    db.save();
  }
  const all = publishedPosts();
  const idx = all.findIndex((p) => p.id === target.id);
  const related = all.filter((p) => p.id !== target.id && p.categoryId === target.categoryId).slice(0, 3);
  res.render('site/post', {
    pageTitle: target.metaTitle || target.title,
    metaDescription: target.metaDescription || target.excerpt || stripTags(target.content).slice(0, 150),
    ogImage: target.cover,
    post: target,
    isDraft: !post,
    category: categoryOf(target),
    prev: idx >= 0 ? all[idx + 1] : null,
    next: idx > 0 ? all[idx - 1] : null,
    related
  });
});

router.get('/contact', (req, res) => {
  res.render('site/contact', {
    pageTitle: db.data.pages.contact.title,
    page: db.data.pages.contact,
    sent: req.query.sent === '1',
    error: req.query.error || '',
    services: sortedServices()
  });
});

// 簡易防灌：同一 IP 每分鐘最多 3 筆，另加蜜罐欄位
const hits = new Map();
router.post('/contact', (req, res) => {
  const { name = '', email = '', phone = '', subject = '', message = '', website = '' } = req.body;
  if (website) return res.redirect('/contact?sent=1');
  const now = Date.now();
  const list = (hits.get(req.ip) || []).filter((t) => now - t < 60000);
  if (list.length >= 3) return res.redirect('/contact?error=' + encodeURIComponent('送出太頻繁，請稍後再試'));
  if (!name.trim() || !message.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.redirect('/contact?error=' + encodeURIComponent('請填寫姓名、正確的 Email 與訊息內容'));
  }
  list.push(now);
  hits.set(req.ip, list);
  db.data.messages.unshift({
    id: db.newId(),
    name: name.slice(0, 100),
    email: email.slice(0, 200),
    phone: phone.slice(0, 50),
    subject: subject.slice(0, 200),
    message: message.slice(0, 5000),
    read: false,
    createdAt: new Date().toISOString()
  });
  db.save();
  res.redirect('/contact?sent=1');
});

router.get('/sitemap.xml', (req, res) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const urls = ['/', '/about', '/services', '/works', '/blog', '/contact']
    .concat(db.data.works.map((w) => `/works/${encodeURIComponent(w.slug)}`))
    .concat(publishedPosts().map((p) => `/blog/${encodeURIComponent(p.slug)}`));
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
      .map((u) => `  <url><loc>${base}${u}</loc></url>`)
      .join('\n')}\n</urlset>`
  );
});

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nDisallow: /admin\nSitemap: ${req.protocol}://${req.get('host')}/sitemap.xml\n`);
});

module.exports = router;
