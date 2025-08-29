const CACHE_NAME = "astrotarget-cache-v0.9.0";

self.addEventListener("install", e=>{
  self.skipWaiting();
});

self.addEventListener("activate", e=>{
  e.waitUntil(caches.open(CACHE_NAME));
});

self.addEventListener("fetch", e=>{
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

self.addEventListener("message", e=>{
  if(e.data.action==="cache"){
    caches.open(CACHE_NAME).then(cache=>{
      e.data.files.forEach(url=>cache.add(url));
    });
  }
});
