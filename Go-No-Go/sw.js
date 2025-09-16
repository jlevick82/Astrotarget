const APP_CACHE='gng-app-v4';
const APP_SHELL=['./','./index.html','./styles.css','./app.js','./collapse.js','./messier_subset.js','./favicon.ico',
'./assets/logo-128.png','./assets/logo-256.png','./assets/logo-512.png','./assets/logo-1024.webp','./assets/logo-512.webp'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(APP_CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===APP_CACHE?null:caches.delete(k))))).then(()=>self.clients.claim())});
self.addEventListener('fetch',e=>{
  const url=new URL(e.request.url);
  if(url.origin===location.origin){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone(); caches.open(APP_CACHE).then(c=>c.put(e.request, copy)); return res;})));
  } else if(url.hostname.includes('open-meteo.com')){
    e.respondWith(fetch(e.request).then(res=>{const copy=res.clone(); caches.open(APP_CACHE).then(c=>c.put(e.request, copy)); return res;}).catch(()=>caches.match(e.request)));
  }
});