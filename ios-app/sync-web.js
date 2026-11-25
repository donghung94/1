// Copies the LIVE web app into www/ for the Capacitor wrap.
//
// In-repo layout: this script lives in <repo>/ios-app/, and the web app
// source is the repo root — the PARENT of ios-app/. Default SRC is therefore
// the parent dir. For local testing against a mirror elsewhere, override
// with the WEB_SRC env var, e.g.:
//   WEB_SRC=~/workspace/tokutei-app-redesign/repo node sync-web.js
//
// Skips:
// - ios-app/ itself (would recurse into the folder being built)
// - demo-sora/ (test build, not the live app)
// - service-worker.js (the native shell must not register the web SW)
// - .git/ and any node_modules/
// guide/ images are INCLUDED (needed by dang-ky.html).
const fs = require('fs');
const path = require('path');

const SRC = process.env.WEB_SRC
  ? path.resolve(process.env.WEB_SRC)
  : path.resolve(__dirname, '..');
const DST = path.resolve(__dirname, 'www');
const SKIP_DIRS = new Set(['ios-app', 'demo-sora', '.git', 'node_modules']);
const SKIP_FILES = new Set(['service-worker.js']);

function copy(dir, rel) {
  for (const name of fs.readdirSync(dir)) {
    const r = rel ? rel + '/' + name : name;
    const s = path.join(dir, name);
    const st = fs.statSync(s);
    if (st.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      copy(s, r);
    } else {
      if (SKIP_FILES.has(name)) continue;
      const d = path.join(DST, r);
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}

fs.rmSync(DST, { recursive: true, force: true });
fs.mkdirSync(DST, { recursive: true });
copy(SRC, '');
console.log('www/ synced from', SRC);
