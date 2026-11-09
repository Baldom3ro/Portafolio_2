/**
 * Service Worker para Ejercicio 5: Estrategia Network-First con Fallback
 * Maneja el precaching de la aplicación shell y estrategias dinámicas de caché.
 */

const CACHE_NAME = 'ejercicio5-shell-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  '../styles.css',
  './app.js',
  './db.js'
];

self.addEventListener('install', (event) => {
  console.log('[SW Ejercicio 5] Instalando y almacenando Application Shell en Cache API...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW Ejercicio 5] Activado. Limpiando cachés viejas...');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First para navegación y recursos
self.addEventListener('fetch', (event) => {
  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  // Si es una petición a la API REST, permitimos que la capa app.js y db.js manejen el fallback a IndexedDB,
  // pero también guardamos una copia en Cache API como respaldo secundario.
  if (event.request.url.includes('dummyjson.com') || event.request.url.includes('jsonplaceholder')) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          // Si la red responde, clonar en cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Si la red falla, intentar desde Cache API
          return caches.match(event.request);
        })
    );
    return;
  }

  // Para los recursos estáticos locales: Stale-While-Revalidate o Cache-First con fallback a red
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Devolver caché e intentar actualizar en segundo plano
        fetch(event.request).then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkRes));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});

