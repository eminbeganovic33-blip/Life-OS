const CACHE_VERSION = 2;
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
    url.origin !== location.origin ||
    url.pathname.startsWith("/api")
  ) {
    return;
  }

  // Navigation requests: serve cached shell, fall back to network
  if (e.request.mode === "navigate") {
    e.respondWith(
      fetch(e.request).catch(() => caches.match("/"))
    );
    return;
  }

  // Assets: network-first, update cache in background
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
