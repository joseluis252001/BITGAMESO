// ============================================================
//  BITGAMESO — Service Worker PWA
//  Cache inteligente + auto-actualización
// ============================================================

const CACHE_NAME = 'bitgameso-v1';

// Archivos que se cachean para uso offline
const STATIC_ASSETS = [
    '/',
    '/src/PaginaMenu/menu-index.html',
    '/src/PaginaMenu/style.css',
    '/src/PaginaMenu/script.js',
    '/src/InicioCuenta/inico.html',
    '/src/InicioCuenta/inico.js',
    '/src/InicioCuenta/inicio.css',
    '/src/CrearCuenta/registro.html',
    '/src/CrearCuenta/registro.js',
    '/src/CrearCuenta/styleRegistro.css',
    '/src/Game/game.html',
    '/src/Game/game.js',
    '/src/Game/game.css',
    '/src/Game/pets.js',
    '/src/Game/tutorial.js',
    '/src/Game/finance.js',
    '/src/Game/game-sync.js',
    '/src/Supabase/supabase-client.js',
    '/src/assets/logo/Coin-128.png',
    '/manifest.json',
];

// ── Instalación: cachear archivos estáticos ──────────────────
self.addEventListener('install', (e) => {
    console.log('[SW] Instalando BITGAMESO PWA...');
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        }).then(() => {
            console.log('[SW] Archivos cacheados correctamente');
            // Activar inmediatamente sin esperar
            return self.skipWaiting();
        })
    );
});

// ── Activación: limpiar caches antiguas ──────────────────────
self.addEventListener('activate', (e) => {
    console.log('[SW] Activando nueva versión...');
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => {
                        console.log('[SW] Eliminando cache antigua:', key);
                        return caches.delete(key);
                    })
            );
        }).then(() => {
            // Tomar control de todas las pestañas inmediatamente
            return self.clients.claim();
        })
    );
});

// ── Fetch: Network First para HTML/JS/CSS, Cache First para assets ──
self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);

    // Ignorar peticiones a Supabase, Resend y APIs externas
    if (
        url.hostname.includes('supabase.co') ||
        url.hostname.includes('resend.com') ||
        url.hostname.includes('fonts.googleapis.com') ||
        url.hostname.includes('fonts.gstatic.com') ||
        url.hostname.includes('cdn.jsdelivr.net') ||
        url.pathname.startsWith('/api/')
    ) {
        e.respondWith(fetch(e.request));
        return;
    }

    // HTML, JS, CSS → Network First (siempre busca actualización)
    if (
        e.request.destination === 'document' ||
        e.request.destination === 'script' ||
        e.request.destination === 'style'
    ) {
        e.respondWith(
            fetch(e.request)
                .then((response) => {
                    // Guardar copia actualizada en cache
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, clone);
                    });
                    return response;
                })
                .catch(() => {
                    // Sin internet → usar cache
                    return caches.match(e.request);
                })
        );
        return;
    }

    // Imágenes y otros assets → Cache First (más rápido)
    e.respondWith(
        caches.match(e.request).then((cached) => {
            if (cached) return cached;
            return fetch(e.request).then((response) => {
                const clone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, clone);
                });
                return response;
            });
        })
    );
});

// ── Mensaje para forzar actualización desde el juego ─────────
self.addEventListener('message', (e) => {
    if (e.data === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});