const CACHE_VERSION = 3;
const CACHE_NAME = `life-os-v${CACHE_VERSION}`;
const PRECACHE = ["/", "/favicon.svg", "/icons.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE))
  );
  // Don't skipWaiting — let the app prompt the user to refresh
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  if (
    e.request.method !== "GET" ||
    url.origin !== location.origin
  ) {
    return;
  }

  // Navigation requests: network-first for index.html so deploys propagate
  // immediately, fall back to cached shell if offline.
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/"))
    );
    return;
  }

  // Hashed Vite assets (immutable) → cache-first. The filename hash changes
  // on every deploy so there's no staleness risk; this is the right call for
  // PWA offline + fast repeat visits.
  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        if (cached) return cached;
        return fetch(e.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Other same-origin GETs (root manifests, icons): network-first, populate
  // cache in background as a fallback for offline.
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

// When a new SW takes over, tell all open tabs an update is ready
self.addEventListener("message", (e) => {
  if (e.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
