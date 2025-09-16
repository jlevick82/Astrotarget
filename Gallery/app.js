(function(){
'use strict';
const $ = (s, root=document)=>root.querySelector(s);
const els = { base: $('#baseUrl'), saveBase: $('#saveBase'), testPath: $('#testPath'),
  catalog: $('#catalog'), start: $('#startNum'), end: $('#endNum'), load: $('#loadBtn'),
  lazy: $('#lazy'), hires: $('#hires'), lores: $('#lores'), grid: $('#grid'),
  clearCache: $('#clearCache'), cacheInfo: $('#cacheInfo'), netStatus: $('#netStatus'),
  goNoGo: $('#go-no-go'), installBtn: $('#installBtn'), cardTpl: document.querySelector('#cardTpl') };

function loadBaseUrl(){ const saved = localStorage.getItem('astro.baseUrl'); els.base.value = saved || (window.__ASTRO_CONFIG__ && window.__ASTRO_CONFIG__.defaultBaseUrl || ''); }
function saveBaseUrl(){ localStorage.setItem('astro.baseUrl', (els.base.value||'').trim()); toast('Base URL saved.'); }
function toast(msg){ els.goNoGo.textContent = msg; els.goNoGo.classList.remove('bad'); setTimeout(()=>{ els.goNoGo.textContent = 'Ready'; }, 2000); }
function toastBad(msg){ els.goNoGo.textContent = msg; els.goNoGo.classList.add('bad'); setTimeout(()=>{ els.goNoGo.textContent = 'Ready'; els.goNoGo.classList.remove('bad'); }, 2500); }

async function testPath(){ const url = makeUrl('messier', 1, true); if(!url){ toastBad('Set a base URL first.'); return; }
  try{ const res = await fetch(url, { method: 'HEAD' }); if(res.ok){ toast('Path OK'); } else { toastBad('Path not found (HEAD '+res.status+')'); } }
  catch(e){ toastBad('Network error'); } }

function nameFor(cat, n){ return cat==='messier'?'m'+n:(cat==='caldwell'?'c'+n:'ngc'+n); }
function makeUrl(cat, n, hiRes, attempt){ hiRes = !!hiRes; attempt = attempt||0; const base = (els.base.value||'').replace(/\\s+/g,'').trim(); if(!base) return ''; const name = nameFor(cat,n);
  if(attempt===0) return base + name + (hiRes?'.jpg':'.jpeg'); if(attempt===1) return base + name + (hiRes?'-thumb.jpg':'-thumb.jpeg'); if(attempt===2) return base + name + (hiRes?'.png':'.webp'); return ''; }

function cardElement(label){ const node = els.cardTpl.content.cloneNode(true); node.querySelector('footer').textContent = label; return node; }

async function loadRange(){ els.grid.innerHTML=''; const start = Math.max(1, parseInt(els.start.value,10)||1); const end = Math.max(start, parseInt(els.end.value,10)||start);
  const cat = els.catalog.value; const max = cat==='messier'?110:(cat==='caldwell'?109:9999); const s = Math.min(start, max), e = Math.min(end, max);
  for(let n=s; n<=e; n++){ const label = nameFor(cat,n).toUpperCase(); const node = cardElement(label); const img = node.querySelector('img'); const miss = node.querySelector('.missing'); let loaded = false;
    for(let attempt=0; attempt<3; attempt++){ const url = makeUrl(cat, n, els.hires.checked, attempt); if(!url) break; try{ const res = await fetch(url, { cache: 'force-cache' });
        if(res.ok && (res.headers.get('content-type')||'').indexOf('image')>=0){ img.src = URL.createObjectURL(await res.blob()); img.alt = label; loaded = true; break; } }catch(e){} }
    if(!loaded) miss.style.display='block'; els.grid.appendChild(node); }
  updateCacheInfo(); }

async function updateCacheInfo(){ try{ const keys = await caches.keys(); let total=0; for(const k of keys){ const c = await caches.open(k); total += (await c.keys()).length; } els.cacheInfo.textContent = 'cache: '+total+' item(s)'; }
  catch(e){ els.cacheInfo.textContent = 'cache: n/a'; } }

async function clearCache(){ const keys = await caches.keys(); for(const k of keys){ await caches.delete(k); } await updateCacheInfo(); toast('Cache cleared'); }

function netStatus(){ els.netStatus.textContent = navigator.onLine ? 'online' : 'offline'; }
window.addEventListener('online', netStatus); window.addEventListener('offline', netStatus);

let deferredPrompt; window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; els.installBtn.hidden=false; });
document.querySelector('#installBtn')?.addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); try{ await deferredPrompt.userChoice; }catch(e){} });

els.saveBase.addEventListener('click', saveBaseUrl); els.testPath.addEventListener('click', testPath); els.load.addEventListener('click', loadRange); els.clearCache.addEventListener('click', clearCache);
loadBaseUrl(); netStatus(); updateCacheInfo(); if('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('./sw.js?v=18').catch(()=>{}) ); }
})();