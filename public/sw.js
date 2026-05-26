const CACHE_NAME = 'ahorrasuper-cache-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar el Service Worker y almacenar en caché los recursos estáticos básicos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activar el Service Worker y limpiar cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptar peticiones para servir desde la caché u obtenerlas de la red
self.addEventListener('fetch', (event) => {
  // Evitamos interceptar peticiones de APIs externas o proxies de desarrollo
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' || 
    url.origin !== self.location.origin ||
    url.pathname.includes('/api/') || 
    url.pathname.includes('/mercadona-api')
  ) {
    return;
  }
  
  // Estrategia Network-First para la página de navegación principal e index.html.
  // Esto asegura que al actualizar se busque siempre la última versión de index.html
  // (y los nuevos hashes JS/CSS de Vite) en el servidor si hay conexión.
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request) || caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }
  
  // Estrategia Cache-First para otros recursos estáticos (CSS, JS, manifest, etc.)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      });
    })
  );
});
