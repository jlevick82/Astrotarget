const CACHE_NAME='astro-gallery-v9';
const APP_SHELL=['./','./index.html','./styles.css?v=18','./app.js?v=18','./config.js?v=18','./manifest.webmanifest'];
self.addEventListener('install',event=>{ event.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting())); });
self.addEventListener('activate',event=>{ event.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE_NAME?Promise.resolve():caches.delete(k)))).then(()=>self.clients.claim())); });
self.addEventListener('fetch',event=>{
  const isImage = event.request.destination==='image' || /\.(?:jpg|jpeg|png|webp)$/i.test(new URL(event.request.url).pathname);
  if(isImage){
    event.respondWith(caches.open(CACHE_NAME).then(async cache=>{ const cached = await cache.match(event.request); if(cached) return cached; try{ const res = await fetch(event.request); if(res && res.ok){ cache.put(event.request, res.clone()); } return res; } catch(err){ return cached || Response.error(); } })); return;
  }
  event.respondWith(fetch(event.request).then(res=>{ const copy=res.clone(); caches.open(CACHE_NAME).then(c=>c.put(event.request, copy)); return res; }).catch(()=>caches.match(event.request)));
});