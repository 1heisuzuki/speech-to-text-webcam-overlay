self.addEventListener('install', (e) => {
  console.log('[ServiceWorker] installed');
});

self.addEventListener('activate', (e) => {
  console.log('[ServiceWorker] activated');
});

self.addEventListener('fetch', (e) => {
  console.log('[ServiceWorker] fetched');
});
