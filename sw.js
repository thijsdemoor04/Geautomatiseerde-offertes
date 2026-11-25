const CACHE_NAME = 'pw-offerte-versie-4';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './PlenderWestendorp_app-icoon_512.png'
];

// Installeren: sla de app-bestanden op in de cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activeren: verwijder oude caches automatisch bij een versiewijziging
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Ophalen: probeer eerst het netwerk (zodat updates snel doorkomen), val terug op cache bij slecht bereik
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return networkResponse;
      })
      .catch(() => caches.match(event.request))
  );
});
