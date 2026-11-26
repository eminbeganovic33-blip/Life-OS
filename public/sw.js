// Life OS Service Worker
// "__BUILD_ID__" and the BUILD_ASSETS list are filled in at build time
// (vite.config.js → stampServiceWorker) so every deploy gets fresh caches,
// precaches its own hashed assets, and the old caches are deleted on activate.
const CACHE_VERSION = "__BUILD_ID__";
const BUILD_ASSETS = [] /* __BUILD_ASSETS__ */;
const STATIC_CACHE = `life-os-static-${CACHE_VERSION}`;
const RUNTIME_CACHE = `life-os-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/icons.svg",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  ...BUILD_ASSETS,
];

// ── Install: precache app shell ──────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      // No skipWaiting() here: a new version waits until the user taps
      // "Update" (SKIP_WAITING message below) or every window is closed, so a
      // deploy never yanks the page mid-workout or mid-journal.
  );
});

// ── Activate: clear old caches ───────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== STATIC_CACHE && k !== RUNTIME_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Message: allow the page to trigger skipWaiting ───────────────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// ── Fetch strategies ─────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GETs. Let the browser handle POST/PUT/Firebase/etc.
  if (request.method !== "GET" || url.origin !== location.origin) return;

  // Navigation requests → network-first (so fresh HTML wins), fall back to cached shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => {
          // Never cache an error page as the offline app shell.
          if (res.ok) {
            const clone = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put("/index.html", clone));
          }
          return res;
        })
        .catch(() =>
          caches.match(request).then(
            (cached) => cached || caches.match("/index.html") || caches.match("/")
          )
        )
    );
    return;
  }

  // Hashed build assets (Vite puts them under /assets/) → cache-first, immutable
  if (url.pathname.startsWith("/assets/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        });
      })
    );
    return;
  }

  // Everything else → stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(RUNTIME_CACHE).then((c) => c.put(request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
