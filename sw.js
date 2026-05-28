/**
 * sw.js — Service Worker (Önbellek Katmanı)
 *
 * Strateji:
 *   - Statik varlıklar (JS, CSS, görseller): Cache First — disk'ten anında yükle
 *   - API istekleri: Network First — önce sunucu, hata varsa cache
 *   - Sahne API'si: Stale-While-Revalidate — anında cache ver, arka planda güncelle
 */

const CACHE_VERSION  = 'lise-aski-v1';
const STATIC_CACHE   = `${CACHE_VERSION}-static`;
const API_CACHE      = `${CACHE_VERSION}-api`;

// İlk yüklemede cache'lenecek statik varlıklar
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/config.js',
  '/src/core/EventBus.js',
  '/src/core/Container.js',
  '/src/interfaces/IAuthService.js',
  '/src/interfaces/IGameService.js',
  '/src/interfaces/IRenderers.js',
  '/src/api/ApiClient.js',
  '/src/services/AuthService.js',
  '/src/services/GameService.js',
  '/src/engine/DialogueBox.js',
  '/src/engine/SceneManager.js',
  '/src/engine/GameEngine.js',
  '/src/auth/AuthManager.js',
  '/src/ui/UIController.js',
  '/src/app.js',
  '/src/styles/main.css',
  '/src/styles/auth.css',
  '/src/styles/novel.css',
  '/assets/characters/elif.png',
  '/assets/characters/mert.png',
  '/assets/characters/selin.png',
  '/assets/backgrounds/classroom.png',
  '/assets/backgrounds/corridor.png',
  '/assets/backgrounds/library.png',
  '/assets/backgrounds/rainy.png',
];

// ── Install: Statik dosyaları cache'e yaz ─────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: Eski cache'leri temizle ─────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith('lise-aski-') && k !== STATIC_CACHE && k !== API_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: İstek stratejisi ───────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ① Sahne API — Stale-While-Revalidate (anında cevap, arka planda güncelle)
  if (url.pathname.startsWith('/api/game/scene/')) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // ② Diğer API istekleri — Network First (kullanıcıya özel, fresh olmalı)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ③ Statik varlıklar — Cache First (JS, CSS, görseller)
  event.respondWith(cacheFirst(request, STATIC_CACHE));
});

// ── Strateji: Cache First ──────────────────────────────────
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
    return new Response('Çevrimdışı — kaynak bulunamadı.', { status: 503 });
  }
}

// ── Strateji: Network First ────────────────────────────────
async function networkFirst(request) {
  try {
    return await fetch(request);
  } catch {
    const cached = await caches.match(request);
    return cached || new Response(
      JSON.stringify({ error: 'Çevrimdışı.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── Strateji: Stale-While-Revalidate ──────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Arka planda güncelle (fire and forget)
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => null);

  // Cache varsa hemen dön, yoksa ağı bekle
  return cached || fetchPromise;
}
