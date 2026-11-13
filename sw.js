const CACHE = 'yams-v43';
const FILES = ['./', './index.html', './app.js', './en.js', './style.css', './manifest.json', './web-app-manifest-192x192.png', './web-app-manifest-512x512.png'];

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
  const url = e.request.url.split('?')[0];
  // /en est la même page que l'accueil, servie par une réécriture : hors ligne, on
  // retombe sur l'accueil en cache, que app.js affiche en anglais d'après l'adresse.
  if (url.endsWith('/en')) {
    e.respondWith(networkFirst(e.request).then(r => r || caches.match('./index.html')));
    return;
  }
  if (url.endsWith('/') || url.endsWith('/index.html') ||
      url.endsWith('/app.js') || url.endsWith('/en.js') || url.endsWith('/style.css')) {
    e.respondWith(networkFirst(e.request));
    return;
  }
  // Cache-first pour les assets statiques (icônes, manifest)
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
