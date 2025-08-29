const CACHE_NAME = "astrotarget-v1.0";
const ASSETS = [
  "/",                // root
  "/index.html",
  "/messier.js",
  "/caldwell.js",
  "/brightngc.js",
  "/images/placeholder.jpg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"
];

// Install SW and cache assets
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate SW and remove old caches
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => {
      return res || fetch(event.request).catch(() => {
        if (event.request.destination === "image") {
          return caches.match("/images/placeholder.jpg");
        }
      });
    })
  );
});
