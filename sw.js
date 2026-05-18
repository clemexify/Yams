const CACHE = 'yams-v5';
const FILES = ['./', './index.html', './app.js', './style.css', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

function networkFirst(req) {
  return fetch(req).then(r => {
    const cp = r.clone();
    caches.open(CACHE).then(c => c.put(req, cp));
    return r;
  }).catch(() => caches.match(req));
}

self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (url.endsWith('/') || url.endsWith('/index.html') ||
      url.endsWith('/app.js') || url.endsWith('/style.css')) {
    e.respondWith(networkFirst(e.request));
    return;
  }
  // Cache-first pour les assets statiques (icônes, manifest)
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
