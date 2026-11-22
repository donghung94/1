const CACHE_NAME = 'dh-quiz-v3';
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll([
    './index.html','./exam.html','./style.css','./exam.js','./questions.js','./manifest.json','./icon-192.png','./icon-512.png','./login.html','./i18n.js','./language.html'
  ])).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  if(e.request.method!=='GET') return;
  e.respondWith(fetch(e.request).then(r=>{
    const clone = r.clone();
    caches.open(CACHE_NAME).then(c=>c.put(e.request, clone));
    return r;
  }).catch(()=>caches.match(e.request)));
});
