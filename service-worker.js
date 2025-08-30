// === AstroTarget v1.0 Service Worker ===

const CACHE_NAME = "astro-cache-v1";
const CORE_ASSETS = [
  "/",
  "/index.html",
  "/styles.css",
  "/main.js",
  "/messier.js",
  "/caldwell.js",
  "/brightngc.js",
  "/images/full/placeholder.jpg"
];

// Install → cache core files
self.addEventListener("install", e => {
  console.log("Service Worker: Installing...");
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Service Worker: Caching core assets");
      return cache.addAll(CORE_ASSETS);
    })
  );
});

// Activate → clean up old caches
self.addEventListener("activate", e => {
  console.log("Service Worker: Activated");
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => {
        if (k !== CACHE_NAME) {
          console.log("Service Worker: Removing old cache:", k);
          return caches.delete(k);
        }
      }))
    )
  );
});

// Fetch → serve from cache, then network
self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      if (response) return response;

      return fetch(e.request).then(fetchRes => {
        // Check user preference for caching images
        if (e.request.url.includes("/images/full/")) {
          return handleImageCache(e.request, fetchRes);
        } else {
          // Always cache core non-image requests
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, fetchRes.clone());
            return fetchRes;
          });
        }
      }).catch(err => {
        console.warn("❌ Fetch failed:", e.request.url, err);
        // If image fails → serve placeholder
        if (e.request.url.includes("/images/full/")) {
          return caches.match("/images/full/placeholder.jpg");
        }
      });
    })
  );
});

// Image caching behavior depends on toggle (stored in localStorage? nope, not available here)
// Instead → use a custom header or rely on always caching images after fetch
async function handleImageCache(request, fetchRes) {
  try {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, fetchRes.clone());
  } catch (err) {
    console.warn("⚠️ Failed to cache image:", request.url);
  }
  return fetchRes;
}
