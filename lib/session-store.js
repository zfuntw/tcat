// 把登入 Session 存在 DATA_DIR/sessions.json，主機重啟或重新部署後不必重新登入
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const { DATA_DIR } = require('./paths');

const FILE = path.join(DATA_DIR, 'sessions.json');

class FileStore extends session.Store {
  constructor() {
    super();
    try {
      this.sessions = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    } catch {
      this.sessions = {};
    }
    this.timer = null;
  }

  persist() {
    if (this.timer) return;
    this.timer = setTimeout(() => {
      this.timer = null;
      const now = Date.now();
      for (const [sid, s] of Object.entries(this.sessions)) {
        if (s.cookie && s.cookie.expires && new Date(s.cookie.expires).getTime() < now) delete this.sessions[sid];
      }
      fs.writeFile(FILE + '.tmp', JSON.stringify(this.sessions), (err) => {
        if (!err) fs.rename(FILE + '.tmp', FILE, () => {});
      });
    }, 500);
  }

  get(sid, cb) {
    const s = this.sessions[sid];
    if (s && s.cookie && s.cookie.expires && new Date(s.cookie.expires) < new Date()) {
      delete this.sessions[sid];
      return cb(null, null);
    }
    cb(null, s ? JSON.parse(JSON.stringify(s)) : null);
  }

  set(sid, sess, cb) {
    this.sessions[sid] = JSON.parse(JSON.stringify(sess));
    this.persist();
    cb && cb(null);
  }

  destroy(sid, cb) {
    delete this.sessions[sid];
    this.persist();
    cb && cb(null);
  }

  touch(sid, sess, cb) {
    if (this.sessions[sid]) this.sessions[sid].cookie = sess.cookie;
    this.persist();
    cb && cb(null);
  }
}

module.exports = FileStore;
