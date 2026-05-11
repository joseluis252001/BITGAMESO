self.addEventListener('install', (e) => {
  console.log('BITGAMESO: App instalada correctamente');
});

self.addEventListener('fetch', (e) => {
  // Esto mantiene la App funcionando conectada a tu servidor
  e.respondWith(fetch(e.request));
});