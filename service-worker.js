const CACHE_NAME = 'pedalazo-v' + Date.now(); // Cache name dinámico basado en tiempo para forzar purga en cada cambio
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './logo-pedalazo-icon.svg',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Obliga al nuevo service worker a instalarse de inmediato sin esperar a que se cierren las pestañas
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Eliminar todas las memorias caché antiguas (problema de la raíz en los celulares)
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[ServiceWorker] Eliminando caché vieja:', key);
          return caches.delete(key);
        }
      }));
    }).then(() => self.clients.claim()) // Tomar el control de la página subyacente de inmediato
  );
});

// Estrategia "Network First, Falling back to Cache"
self.addEventListener('fetch', (e) => {
  // Solo interceptamos peticiones GET
  if (e.request.method !== 'GET') return;
  // Ignoramos consultas explícitas hacia APIs u orígenes externos complejos para evitar bloqueos
  if (e.request.url.includes('/api/')) return;

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Clonar la respuesta de la red fresca y actualizar el cache actual silenciosamente
        const resClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return response;
      })
      .catch(() => {
        // En caso de modo avión o sin red, intenta buscarlo en el caché local
        return caches.match(e.request);
      })
  );
});
