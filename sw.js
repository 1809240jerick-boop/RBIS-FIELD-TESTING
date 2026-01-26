// --- 1. VERSION CONTROL ---
// CHANGE THIS (v12 -> v13) to trigger the "New Update" toast in index.html
const CACHE_NAME = 'rbi-system-v13';

// --- 2. ASSETS TO CACHE ---
const CRITICAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.png'
];

const OPTIONAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/xlsx/dist/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// --- 3. INSTALL EVENT (Caching) ---
self.addEventListener('install', (event) => {
  // Forces the new SW to become "waiting" immediately, 
  // allowing the index.html logic to detect it.
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log(`[SW] Installing ${CACHE_NAME}`);
      await cache.addAll(CRITICAL_ASSETS);
      try {
        await cache.addAll(OPTIONAL_ASSETS);
      } catch (err) {
        console.warn('[SW] Optional assets failed, proceeding anyway.');
      }
    })
  );
});

// --- 4. ACTIVATE EVENT (Cleanup) ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          }
        })
      );
    }).then(() => {
      console.log(`[SW] ${CACHE_NAME} is now active`);
      return self.clients.claim();
    })
  );
});

// --- 5. FETCH EVENT (Serving Files) ---
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        // Fallback or silence
      });
    })
  );
});

