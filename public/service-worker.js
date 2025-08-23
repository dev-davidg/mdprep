// public/service-worker.js
// Force new SW to take control immediately and never cache app assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Take control of all pages ASAP
    await clients.claim();
    // Clean up any old caches if they exist
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  })());
});

// Always network-pass-through (no caching)
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
