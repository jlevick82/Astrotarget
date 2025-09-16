const CACHE='astro-root-v1';
const APP_SHELL=['./','./index.html','./styles.css','./assets/logo-128.png','./assets/logo-256.png','./favicon.ico','./Go-No-Go/','./Go-No-Go/index.html'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(APP_SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k===CACHE?null:caches.delete(k))))); self.clients.claim();});
self.addEventListener('fetch',e=>{e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const copy=res.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)); return res;})).catch(()=>caches.match('./index.html')))});
