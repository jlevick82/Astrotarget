/* Astro Gallery app — GitHub raw loader with offline caching */
const $ = (s, root=document)=>root.querySelector(s);
const $$ = (s, root=document)=>Array.from(root.querySelectorAll(s));

const els = {
  base: $('#baseUrl'),
  saveBase: $('#saveBase'),
  testPath: $('#testPath'),
  catalog: $('#catalog'),
  start: $('#startNum'),
  end: $('#endNum'),
  load: $('#loadBtn'),
  lazy: $('#lazy'),
  hires: $('#hires'),
  lores: $('#lores'),
  grid: $('#grid'),
  clearCache: $('#clearCache'),
  cacheInfo: $('#cacheInfo'),
  netStatus: $('#netStatus'),
  goNoGo: $('#go-no-go'),
  installBtn: $('#installBtn'),
  cardTpl: $('#cardTpl')
};

const state = {
  baseUrl: '',
  installing: false
};

function loadBaseUrl(){
  const saved = localStorage.getItem('astro.baseUrl');
  state.baseUrl = saved || (window.__ASTRO_CONFIG__?.defaultBaseUrl || '');
  els.base.value = state.baseUrl;
}

function saveBaseUrl(){
  state.baseUrl = els.base.value.trim();
  localStorage.setItem('astro.baseUrl', state.baseUrl);
  toast('Base URL saved.');
}

function toast(msg){
  els.goNoGo.textContent = msg;
  els.goNoGo.classList.remove('bad');
  setTimeout(()=>{ els.goNoGo.textContent = 'Ready'; }, 2000);
}

function toastBad(msg){
  els.goNoGo.textContent = msg;
  els.goNoGo.classList.add('bad');
  setTimeout(()=>{ els.goNoGo.textContent = 'Ready'; els.goNoGo.classList.remove('bad'); }, 2500);
}

async function testPath(){
  const url = makeUrl('messier', 1, true);
  if(!url){ toastBad('Set a base URL first.'); return; }
  try{
    const res = await fetch(url, { method: 'HEAD' });
    if(res.ok){ toast('Path OK'); }
    else { toastBad('Path not found (HEAD '+res.status+')'); }
  }catch(e){ toastBad('Network error'); }
}

function pad(n){ return String(n); }

function nameFor(catalog, n){
  if(catalog==='messier') return `m${n}`;
  if(catalog==='caldwell') return `c${n}`;
  return `ngc${n}`;
}

function makeUrl(catalog, n, hiRes=true, attempt=0){
  const base = state.baseUrl.replace(/\s+/g,'').trim();
  if(!base) return '';
  const name = nameFor(catalog,n);
  if(attempt===0) return base + name + (hiRes?'.jpg':'.jpeg');
  if(attempt===1) return base + name + (hiRes?'-thumb.jpg':'-thumb.jpeg');
  if(attempt===2) return base + name + (hiRes?'.png':'.webp');
  return '';
}

function cardElement(label){
  const node = els.cardTpl.content.cloneNode(true);
  node.querySelector('footer').textContent = label;
  return node;
}

async function loadRange(){
  els.grid.innerHTML='';
  const start = parseInt(els.start.value,10);
  const end = parseInt(els.end.value,10);
  const catalog = els.catalog.value;

  const minMax = catalog==='messier' ? [1,110] : (catalog==='caldwell' ? [1,109] : [1,9999]);
  const s = Math.max(minMax[0], Math.min(start, minMax[1]));
  const e = Math.max(s, Math.min(end, minMax[1]));

  for(let n=s; n<=e; n++){
    const label = nameFor(catalog,n).toUpperCase();
    const node = cardElement(label);
    const card = node.querySelector('.card');
    const img = node.querySelector('img');
    const miss = node.querySelector('.missing');

    let loaded = false;
    for(let attempt=0; attempt<3; attempt++){
      const url = makeUrl(catalog, n, els.hires.checked, attempt);
      if(!url) break;
      try{
        const res = await fetch(url, { cache: 'force-cache' });
        if(res.ok && res.headers.get('content-type')?.includes('image')){
          const blob = await res.blob();
          const objUrl = URL.createObjectURL(blob);
          img.src = objUrl;
          img.alt = label;
          loaded = true;
          break;
        }
      }catch(e){ /* continue */ }
    }
    if(!loaded){
      miss.style.display='block';
    }
    els.grid.appendChild(node);
  }
  updateCacheInfo();
}

async function updateCacheInfo(){
  try{
    const keys = await caches.keys();
    let total = 0;
    for(const k of keys){
      const cache = await caches.open(k);
      const reqs = await cache.keys();
      total += reqs.length;
    }
    els.cacheInfo.textContent = `cache: ${total} item(s)`;
  }catch(e){
    els.cacheInfo.textContent = 'cache: n/a';
  }
}

async function clearCache(){
  const keys = await caches.keys();
  for(const k of keys){ await caches.delete(k); }
  await updateCacheInfo();
  toast('Cache cleared');
}

function netStatus(){
  els.netStatus.textContent = navigator.onLine ? 'online' : 'offline';
}
window.addEventListener('online', netStatus);
window.addEventListener('offline', netStatus);

// PWA install prompt (optional)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  els.installBtn.hidden = false;
});
els.installBtn?.addEventListener('click', async ()=>{
  if(!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if(outcome==='accepted'){ els.installBtn.hidden = true; }
});

// Events
els.saveBase.addEventListener('click', saveBaseUrl);
els.testPath.addEventListener('click', testPath);
els.load.addEventListener('click', loadRange);
els.clearCache.addEventListener('click', clearCache);

// init
loadBaseUrl();
netStatus();
updateCacheInfo();

// Service worker
if('serviceWorker' in navigator){
  window.addEventListener('load', ()=>{
    navigator.serviceWorker.register('./sw.js').catch(()=>{});
  });
}
