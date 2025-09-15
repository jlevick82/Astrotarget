// Service Worker (v2) for offline caching
const CACHE_NAME = 'astro-gallery-v2';
const APP_SHELL = ['./','./index.html','./styles.css','./app.js','./config.js','./manifest.webmanifest'];

self.addEventListener('install', e=>{ e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', e=>{ e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE_NAME?null:caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e=>{
  const isImage = e.request.destination==='image' || /\.(?:jpg|jpeg|png|webp)$/i.test(new URL(e.request.url).pathname);
  if(isImage){
    e.respondWith(caches.open(CACHE_NAME).then(async cache=>{
      const cached = await cache.match(e.request);
      if(cached) return cached;
      try{ const res = await fetch(e.request); if(res && res.ok){ cache.put(e.request, res.clone()); } return res; }
      catch(err){ return cached || Response.error(); }
    }));
    return;
  }
  e.respondWith(fetch(e.request).then(res=>{ const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(e.request, copy)); return res; }).catch(()=>caches.match(e.request)));
});