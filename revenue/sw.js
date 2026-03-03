const CACHE_NAME = 'so-doanh-thu';
const FONTS_CACHE = 'so-doanh-thu-fonts';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './js/constants.js',
  './js/utils.js',
  './js/storage.js',
  './js/state.js',
  './js/render.js',
  './js/handlers.js',
  './js/print.js',
  './js/export.js',
  './js/main.js',
  './css/variables.css',
  './css/base.css',
  './css/components.css',
  './css/responsive.css',
  './css/print.css',
  './lib/xlsx.full.min.js',
];

/* Cache all app files on install */
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});

/* Fetch handler */
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  /* External CDNs (Fonts, Lucide): network-first, cache as fallback */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com'
      || url.hostname === 'unpkg.com') {
    e.respondWith(
      caches.open(FONTS_CACHE).then(async (cache) => {
        try {
          const response = await fetch(e.request);
          cache.put(e.request, response.clone());
          return response;
        } catch {
          return cache.match(e.request);
        }
      })
    );
    return;
  }

  /* App files: network-first, cache on success, fallback to cache on network failure */
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
