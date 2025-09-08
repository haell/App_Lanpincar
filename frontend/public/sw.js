const CACHE_NAME = 'lanpincar-static-v1';
const toCache = ['/', '/index.html', '/static/js/bundle.js'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(toCache)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // only cache GETs here
  event.respondWith(
    caches.match(event.request).then(resp => {
      return resp || fetch(event.request).then(r => {
        return caches.open(CACHE_NAME).then(cache => { cache.put(event.request, r.clone()); return r; });
      });
    })
  );
});
