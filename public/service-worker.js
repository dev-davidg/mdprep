// Minimal runtime-caching service worker for MDprep
// - Network-first for same-origin GETs, fallback to cache
// - No precache (safer for now)

const CACHE_NAME = 'mdprep-runtime-v1';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((k) => k.startsWith('mdprep-runtime-') && k !== CACHE_NAME)
        .map((k) => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  try {
    const url = new URL(req.url);
    const sameOrigin = url.origin === self.location.origin;
    if (req.method !== 'GET' || !sameOrigin) return;
  } catch { return; }

  event.respondWith((async () => {
    try {
      const net = await fetch(req);
      if (net && net.ok) {
        const cache = await caches.open(CACHE_NAME);
        cache.put(req, net.clone());
      }
      return net;
    } catch {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(req);
      if (cached) return cached;
      if (req.destination === 'document') {
        return caches.match('/index.html');
      }
      throw new Error('Offline and not cached');
    }
  })());
});
