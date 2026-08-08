/**
 * MongondowPedia Service Worker — Offline & Cache Strategy
 *
 * Cache Strategy per resource type:
 * - Static assets (JS/CSS/fonts/icons): Cache First → 1 tahun
 * - Halaman HTML: Network First → fallback ke cache (offline support)
 * - Knowledge & Kamus API: Stale While Revalidate → 5 menit
 * - Auth & Chat API: Network Only → tidak pernah di-cache
 */

const CACHE_NAME = 'mongondowpedia-v3';
const STATIC_CACHE = 'mp-static-v3';
const API_CACHE = 'mp-api-v3';

// Asset statis yang di-cache saat install
const PRECACHE_ASSETS = [
  '/',
  '/kamus',
  '/knowledge',
  '/aksara-mongondow',
  '/offline',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/favicon-96x96.png',
  '/apple-touch-icon.png',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/manifest.json',
  '/og-image.png',
];

// URL pattern yang TIDAK boleh di-cache SW
const NO_CACHE_PATTERNS = [
  /\/api\/auth\//,
  /\/api\/homepage\//,
  /\/api\/public\/conversations/,
  /\/api\/admin\//,
  /\/api\/v1\//,
];

// URL pattern API yang boleh di-cache sementara (5 menit)
const API_CACHE_PATTERNS = [
  /\/api\/public\/knowledge/,
  /\/api\/kamus/,
  /\/api\/knowledge/,
  /\/api\/public\/voice-lookup/,
];

const API_CACHE_TTL = 5 * 60 * 1000; // 5 menit

// ─── Install: Pre-cache aset statis ───────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_ASSETS).catch(() => {
        // Jangan batalkan install jika sebagian asset gagal
      })
    ).then(() => self.skipWaiting())
  );
});

// ─── Activate: Hapus cache lama ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME && k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── Fetch: Strategi cache per jenis resource ──────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Hanya handle GET request dari origin yang sama
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const pathname = url.pathname;

  // 1. NO CACHE: Auth, Chat, Admin API
  if (NO_CACHE_PATTERNS.some((p) => p.test(pathname))) {
    event.respondWith(fetch(request));
    return;
  }

  // 2. STALE WHILE REVALIDATE: Knowledge & Kamus API
  if (API_CACHE_PATTERNS.some((p) => p.test(pathname))) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE, API_CACHE_TTL));
    return;
  }

  // 3. CACHE FIRST: Aset statis Next.js (_next/static, css, js, fonts, icons)
  if (
    pathname.startsWith('/_next/static/') ||
    pathname.startsWith('/fonts/') ||
    /\.(png|jpg|jpeg|ico|svg|webp|woff|woff2|ttf|otf|css|js)$/.test(pathname) ||
    pathname === '/manifest.json'
  ) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // 4. NETWORK FIRST: Halaman HTML (dengan offline fallback)
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_NAME));
    return;
  }

  // 5. Default: Network dengan cache fallback
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});

// ─── Strategy: Cache First ─────────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Asset not available offline', { status: 503 });
  }
}

// ─── Strategy: Network First ───────────────────────────────────────────────
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback halaman offline
    const offlinePage = await caches.match('/');
    return offlinePage || new Response('Offline — Koneksi internet tidak tersedia.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
}

// ─── Strategy: Stale While Revalidate (dengan TTL) ────────────────────────
async function staleWhileRevalidate(request, cacheName, ttl) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Cek apakah cache sudah kedaluwarsa
    const cachedDate = new Date(cached.headers.get('sw-cached-at') || 0).getTime();
    const isExpired = Date.now() - cachedDate > ttl;

    if (!isExpired) {
      // Masih segar — langsung return, revalidate di background
      fetch(request).then((response) => {
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set('sw-cached-at', new Date().toISOString());
          const cloned = new Response(response.body, {
            status: response.status,
            headers,
          });
          cache.put(request, cloned);
        }
      }).catch(() => {});
      return cached;
    }
  }

  // Tidak ada cache atau expired — fetch dari network
  try {
    const response = await fetch(request);
    if (response.ok) {
      const headers = new Headers(response.headers);
      headers.set('sw-cached-at', new Date().toISOString());
      const toCache = new Response(response.clone().body, {
        status: response.status,
        headers,
      });
      cache.put(request, toCache);
    }
    return response;
  } catch {
    // Fallback ke cache expired kalau network mati
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'Offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
