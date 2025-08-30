// ===========================
// AstroTarget v1.0 Service Worker
// ===========================

const CACHE_NAME = "astrotarget-v1.0";
const STATIC_ASSETS = [
  "/",                // root
  "/index.html",
  "/style.css",
  "/main.js",
  "/messier.js",
  "/caldwell.js",
  "/brightngc.js",
  "/images/placeholder.jpg",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
];

// ===========================
// Install Event
// ===========================
self.addEventListener("install", event => {
  console.log("Service Worker: Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service Worker: Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
});

// ===========================
// Activate Event
// ===========================
self.addEventListener("activate", event => {
  console.log("Service Worker: Activated");
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
      )
    )
  );
});

// ===========================
// Fetch Event
// ===========================
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(cachedRes => {
      if (cachedRes) return cachedRes;

      return fetch(event.request).catch(() => {
        if (event.request.destination === "image") {
          return caches.match("/images/placeholder.jpg");
        }
        return new Response("⚠️ Resource unavailable in offline mode.", {
          status: 503,
          headers: { "Content-Type": "text/plain" }
        });
      });
    })
  );
});
