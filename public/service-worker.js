const CACHE_NAME = 'seo-cache-v1';
const EXPIRATION_TIME = 24 * 60 * 60 * 1000; // 24 hours

self.addEventListener('install', (event) => {
  self.skipWaiting();
  console.log('[Service Worker] Installed');
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Intercept Product Pages for Caching
  if (event.request.mode === 'navigate' && url.pathname.startsWith('/product/')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Check expiration manually via headers if we implemented it, 
          // but basic Cache API relies on cache invalidation strategies.
          return cachedResponse;
        }

        return fetch(event.request).then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Offline fallback
          return caches.match('/');
        });
      })
    );
  }

  // Intercept Sitemap XML to ensure correct content type
  if (url.pathname === '/sitemap.xml') {
    // We let the frontend render it, but if we wanted to enforce headers, 
    // we could reconstruct the response.
    // For now, let the network handle it, but fallback if needed.
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
  }
});