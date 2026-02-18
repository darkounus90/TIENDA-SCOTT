const CACHE_NAME = 'pedalazo-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './logo-pedalazo-icon.svg',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
