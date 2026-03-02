const CACHE_NAME = 'phieu-can-gas';
const FONTS_CACHE = 'google-fonts';

const FILES_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './assets/icon-180.png',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/logo-header.png',
  './js/constants.js',
  './js/utils.js',
  './js/storage.js',
  './js/state.js',
  './js/render.js',
  './js/history.js',
  './js/print.js',
  './js/handlers.js',
  './js/main.js',
  './css/variables.css',
  './css/base.css',
  './css/form.css',
  './css/components.css',
  './css/confirm.css',
  './css/history.css',
  './css/toast.css',
  './css/responsive.css',
  './css/print.css',
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

  /* Google Fonts: network-first, cache as fallback (hỗ trợ offline) */
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
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

  /* App files: network-first, cache as offline fallback */
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
