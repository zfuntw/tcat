const sanitizeHtml = require('sanitize-html');

// 產生網址代稱：保留中文、英數與連字號
function slugify(str) {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function uniqueSlug(base, list, selfId) {
  let slug = slugify(base) || 'item';
  let n = 2;
  const taken = (s) => list.some((x) => x.slug === s && x.id !== selfId);
  const root = slug;
  while (taken(slug)) slug = `${root}-${n++}`;
  return slug;
}

function cleanHtml(html) {
  return sanitizeHtml(html || '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'iframe', 'span', 'u', 's']),
    allowedAttributes: {
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
      '*': ['class', 'style']
    },
    allowedStyles: {
      '*': {
        color: [/^#[0-9a-f]{3,8}$/i, /^rgb\([\d\s,.%]+\)$/i],
        'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb\([\d\s,.%]+\)$/i],
        'text-align': [/^(left|right|center|justify)$/]
      }
    },
    allowedIframeHostnames: ['www.youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'www.google.com'],
    allowedSchemes: ['http', 'https', 'mailto', 'tel']
  });
}

// 地圖嵌入只允許 Google Maps iframe
function cleanMapEmbed(html) {
  return sanitizeHtml(html || '', {
    allowedTags: ['iframe'],
    allowedAttributes: { iframe: ['src', 'width', 'height', 'style', 'allowfullscreen', 'loading', 'referrerpolicy'] },
    allowedIframeHostnames: ['www.google.com', 'maps.google.com']
  });
}

function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  const tw = new Date(dt.getTime() + 8 * 3600 * 1000);
  return tw.toISOString().slice(0, 10).replace(/-/g, '.');
}

// 將使用者輸入的純文字轉為安全 HTML（保留換行）
function nl2br(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function stripTags(html) {
  return String(html || '').replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// 只允許站內路徑或 http(s) 連結，避免 javascript: 之類的連結
function safeUrl(url) {
  const u = String(url || '').trim();
  if (/^(https?:\/\/|\/|#|mailto:|tel:)/i.test(u)) return u;
  return '#';
}

module.exports = { slugify, uniqueSlug, cleanHtml, cleanMapEmbed, formatDate, nl2br, stripTags, safeUrl };
