const APP_CACHE='gng-app-v6';
const APP_SHELL=['./','./index.html','./styles.css?v=15','./app.js?v=15','./collapse.js?v=15','./messier_subset.js?v=15','./favicon.ico',
'./assets/logo-128.png','./assets/logo-256.png','./assets/logo-512.png','./assets/logo-1024.webp','./assets/logo-512.webp'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(APP_CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k===APP_CACHE ? Promise.resolve() : caches.delete(k)))).then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const url=new URL(event.request.url);
  if(url.origin===location.origin){
    event.respondWith(
      caches.match(event.request).then(r=> r || fetch(event.request).then(res=>{ const copy=res.clone(); caches.open(APP_CACHE).then(c=>c.put(event.request, copy)); return res; }))
    );
  } else if(url.hostname.includes('open-meteo.com')){
    event.respondWith(
      fetch(event.request).then(res=>{ const copy=res.clone(); caches.open(APP_CACHE).then(c=>c.put(event.request, copy)); return res; }).catch(()=>caches.match(event.request))
    );
  }
});