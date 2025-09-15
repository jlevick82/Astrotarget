/* Splash + Planner with Moon scoring */
const $ = (s, r=document)=>r.querySelector(s);

const steps = [
  { key:'env',    label:'Environment ready',        run: checkEnv },
  { key:'storage',label:'Local storage available',  run: checkStorage },
  { key:'geo',    label:'Geolocation access',       run: checkGeo },
  { key:'tz',     label:'Timezone detected',        run: checkTZ },
  { key:'wx',     label:'Weather API reachable',    run: pingWeather },
  { key:'cat',    label:'Catalog loaded',           run: loadCatalog },
  { key:'moon',   label:'Moon data computed',       run: computeMoonBrief }
];

let progress = 0;
const bar = $('#bar');
const debug = $('#debug');
const splash = $('#splash');
const app = $('#app');
const moonBrief = $('#moonBrief');

function addRow(label){
  const li = document.createElement('li');
  const spin = document.createElement('div'); spin.className='spin';
  const text = document.createElement('span'); text.textContent = label;
  const mark = document.createElement('div'); mark.className='mark'; mark.style.visibility='hidden';
  li.appendChild(spin); li.appendChild(text); li.appendChild(mark);
  debug.appendChild(li);
  return { li, spin, text, mark };
}

async function runSteps(){
  for(const st of steps){
    const row = addRow(st.label);
    try{
      await st.run();
      row.spin.remove(); row.mark.className = 'mark ok'; row.mark.style.visibility='visible';
      progress += 100/steps.length; bar.style.width = Math.min(100, progress) + '%';
    }catch(e){
      row.spin.remove(); row.mark.className = 'mark fail'; row.mark.style.visibility='visible';
      console.warn(st.key, e);
    }
  }
  setTimeout(()=>{ splash.classList.add('hidden'); app.classList.remove('hidden'); }, 300);
}

function checkEnv(){ return Promise.resolve(); }
function checkStorage(){ try{ localStorage.setItem('___t','1'); localStorage.removeItem('___t'); return Promise.resolve(); } catch(e){ return Promise.reject(e); } }
function checkGeo(){
  return new Promise((res,rej)=>{
    if(!navigator.geolocation){ rej(new Error('no geolocation')); return; }
    navigator.geolocation.getCurrentPosition(pos=>{
      const lat = pos.coords.latitude.toFixed(5), lon = pos.coords.longitude.toFixed(5);
      const U = ui(); if(U.lat) U.lat.value=lat; if(U.lon) U.lon.value=lon; res();
    }, err=>rej(err), { enableHighAccuracy:true, timeout:4000 });
  });
}
function checkTZ(){ try{ const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; $('#tz').textContent = tz || '—'; return Promise.resolve(); } catch(e){ return Promise.reject(e); } }
async function pingWeather(){
  try{ const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&hourly=cloud_cover&timezone=auto', { method:'HEAD' }); if(!r.ok) throw new Error('wx head '+r.status); }
  catch(e){ const r = await fetch('https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&hourly=cloud_cover&timezone=auto'); if(!r.ok) throw new Error('wx get '+r.status); }
}
function loadCatalog(){ if(!Array.isArray(window.MESSIER_SUBSET)) throw new Error('no catalog'); return Promise.resolve(); }

/* --- Moon / Sun calculations (approx) --- */
const d2r = x=>x*Math.PI/180, r2d = x=>x*180/Math.PI;
function jd(date){ return date.getTime()/86400000 + 2440587.5; }
function gmst(date){
  const J = jd(date), T = (J - 2451545.0)/36525;
  let th = 280.46061837 + 360.98564736629*(J-2451545) + 0.000387933*T*T - T*T*T/38710000;
  th = ((th%360)+360)%360; return th/15;
}
function lst(date, lon){ return (gmst(date) + lon/15 + 24)%24; }

function sunEq(date){
  const J = jd(date); const T = (J-2451545.0)/36525;
  const L0 = (280.46646 + 36000.76983*T + 0.0003032*T*T)%360;
  const M = (357.52911 + 35999.05029*T - 0.0001537*T*T)%360;
  const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin(d2r(M)) + (0.019993 - 0.000101*T)*Math.sin(d2r(2*M)) + 0.000289*Math.sin(d2r(3*M));
  const lam = L0 + C;
  const eps = 23.439291 - 0.0130042*T;
  const ra = Math.atan2(Math.cos(d2r(eps))*Math.sin(d2r(lam)), Math.cos(d2r(lam)));
  const dec = Math.asin(Math.sin(d2r(eps))*Math.sin(d2r(lam)));
  return { raH: (ra<0?ra+2*Math.PI:ra)*12/Math.PI, decD: r2d(dec), lamD: lam };
}

function moonEq(date){
  const J = jd(date);
  const L = (218.316 + 13.176396*(J-2451545.0))%360;
  const M = (134.963 + 13.064993*(J-2451545.0))%360;
  const F = (93.272 + 13.229350*(J-2451545.0))%360;
  const lon = (L + 6.289*Math.sin(d2r(M)))%360;
  const lat = 5.128*Math.sin(d2r(F));
  const eps = 23.439;
  const ra = Math.atan2(Math.sin(d2r(lon))*Math.cos(d2r(eps)) - Math.tan(d2r(lat))*Math.sin(d2r(eps)), Math.cos(d2r(lon)));
  const dec = Math.asin(Math.sin(d2r(lat))*Math.cos(d2r(eps)) + Math.cos(d2r(lat))*Math.sin(d2r(eps))*Math.sin(d2r(lon)));
  return { raH: (ra<0?ra+2*Math.PI:ra)*12/Math.PI, decD: r2d(dec), lonD: lon };
}

function altFor(raH, decD, latD, lonD, date){
  const LST = lst(date, lonD)*15;
  const HA = ((LST - raH*15 + 540)%360)-180;
  const ha = d2r(HA), dec = d2r(decD), lat = d2r(latD);
  const sA = Math.sin(dec)*Math.sin(lat) + Math.cos(dec)*Math.cos(lat)*Math.cos(ha);
  return r2d(Math.asin(sA));
}
function sepDeg(raH1, decD1, raH2, decD2){
  const a1 = d2r(decD1), a2 = d2r(decD2);
  const dRA = d2r((raH1-raH2)*15);
  const cosS = Math.sin(a1)*Math.sin(a2) + Math.cos(a1)*Math.cos(a2)*Math.cos(dRA);
  return r2d(Math.acos(Math.min(1,Math.max(-1,cosS))));
}

let MOON_CACHE = null;
async function computeMoonBrief(){
  try{
    const U = ui();
    const lat = parseFloat(U?.lat?.value) || 0, lon = parseFloat(U?.lon?.value) || 0;
    const now = new Date();
    const s = sunEq(now); const m = moonEq(now);
    const altM = altFor(m.raH, m.decD, lat, lon, now);
    const phase = (m.lonD - s.lamD + 360)%360;
    const k = (1 - Math.cos(d2r(phase)))/2;
    MOON_CACHE = { now, sun:s, moon:m, altM, illum:k };
    const mb = $('#moonBrief'); if(mb) mb.textContent = `Moon illum ~ ${(k*100).toFixed(0)}% • Alt ~ ${altM.toFixed(0)}°`;
  }catch(e){
    const mb = $('#moonBrief'); if(mb) mb.textContent = 'Moon data unavailable';
    throw e;
  }
}

/* ----- Planner (with Moon-aware scoring) ----- */
const scopes = [
  {name:"SVBONY 503 80ED (600mm f/7.5)", fl:600, ap:80},
  {name:"RedCat 51 (250mm f/4.9)", fl:250, ap:51},
  {name:"C8 Edge (2032mm f/10)", fl:2032, ap:203},
  {name:"Custom…", fl:null, ap:null}
];
const cameras = [
  {name:"ZWO ASI533MC Pro", w:11.31, h:11.31, px:3.76},
  {name:"Canon T100 / 4000D", w:22.3, h:14.9, px:3.7},
  {name:"IMX571 APS-C", w:23.5, h:15.7, px:3.76},
  {name:"Custom…", w:null, h:null, px:null}
];

function ui(){
  return {
    scopeSel: $('#scopeSel'), scopeFL: $('#scopeFL'), scopeAp: $('#scopeAp'),
    camSel: $('#camSel'), camW: $('#camW'), camH: $('#camH'), camPx: $('#camPx'),
    lat: $('#lat'), lon: $('#lon'), gps: $('#gpsBtn'), tz: $('#tz'),
    start: $('#start'), dur: $('#duration'), save: $('#saveSetup'),
    fov: $('#fov'), scale: $('#scale'),
    fetchWx: $('#fetchWx'), wxStatus: $('#wxStatus'), wx: $('#wx'),
    moonInfo: $('#moonInfo'),
    top5: $('#top5'),
    search: $('#search'), recompute: $('#recompute'), table: $('#table')
  };
}

function initPlanner(){
  const U = ui();
  scopes.forEach((s,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=s.name; U.scopeSel.appendChild(o); });
  cameras.forEach((c,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=c.name; U.camSel.appendChild(o); });
  U.scopeSel.value = 0; U.camSel.value = 0;
  applyScope(); applyCam();
  const now = new Date(); now.setMinutes(now.getMinutes()-now.getTimezoneOffset()); 
  U.start.value = now.toISOString().slice(0,16);
  U.tz.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone;
  loadSaved(); updateOptics(); bindPlanner();
  updateMoonInfo();
}

function bindPlanner(){
  const U = ui();
  U.scopeSel.addEventListener('change', ()=>{applyScope(); updateOptics();});
  U.camSel.addEventListener('change', ()=>{applyCam(); updateOptics();});
  U.scopeFL.addEventListener('input', updateOptics);
  U.camW.addEventListener('input', updateOptics);
  U.camH.addEventListener('input', updateOptics);
  U.camPx.addEventListener('input', updateOptics);
  U.gps.addEventListener('click', useGPS);
  U.fetchWx.addEventListener('click', fetchWeather);
  U.recompute.addEventListener('click', computeTop5);
  U.save.addEventListener('click', saveSetup);
  renderTable();
}

function applyScope(){ const U = ui(); const s=scopes[parseInt(U.scopeSel.value,10)]; if(s.fl){U.scopeFL.value=s.fl;} if(s.ap){U.scopeAp.value=s.ap;} }
function applyCam(){ const U = ui(); const c=cameras[parseInt(U.camSel.value,10)]; if(c.w){U.camW.value=c.w;} if(c.h){U.camH.value=c.h;} if(c.px){U.camPx.value=c.px;} }

function updateOptics(){
  const U = ui();
  const fl = parseFloat(U.scopeFL.value)||0;
  const sw = parseFloat(U.camW.value)||0;
  const sh = parseFloat(U.camH.value)||0;
  const px = parseFloat(U.camPx.value)||0;
  if(fl>0 && sw>0 && sh>0){
    const fovW = 57.2958 * sw / fl;
    const fovH = 57.2958 * sh / fl;
    U.fov.textContent = `FOV: ${fovW.toFixed(1)}° × ${fovH.toFixed(1)}°`;
  } else { U.fov.textContent = 'FOV: —'; }
  if(fl>0 && px>0){
    const scale = 206.265 * px / fl;
    U.scale.textContent = `Scale: ${scale.toFixed(2)}″/px`;
  } else { U.scale.textContent = 'Scale: —'; }
}

function saveSetup(){
  const U = ui();
  const data = { scope:{fl:U.scopeFL.value, ap:U.scopeAp.value, sel:U.scopeSel.value},
                 cam:{w:U.camW.value, h:U.camH.value, px:U.camPx.value, sel:U.camSel.value},
                 loc:{lat:U.lat.value, lon:U.lon.value},
                 session:{start:U.start.value, dur:U.dur.value} };
  localStorage.setItem('gng.setup', JSON.stringify(data));
}

function loadSaved(){
  const U = ui();
  const j = localStorage.getItem('gng.setup'); if(!j) return;
  const d = JSON.parse(j);
  if(d.scope){ U.scopeSel.value=d.scope.sel; U.scopeFL.value=d.scope.fl; U.scopeAp.value=d.scope.ap; }
  if(d.cam){ U.camSel.value=d.cam.sel; U.camW.value=d.cam.w; U.camH.value=d.cam.h; U.camPx.value=d.cam.px; }
  if(d.loc){ U.lat.value=d.loc.lat; U.lon.value=d.loc.lon; }
  if(d.session){ U.start.value=d.session.start; U.dur.value=d.session.dur; }
}

/* Weather + Recommendations */
async function useGPS(){
  const U = ui();
  try{
    U.gps.disabled = true;
    const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:10000}));
    U.lat.value = pos.coords.latitude.toFixed(5);
    U.lon.value = pos.coords.longitude.toFixed(5);
  }catch(e){ alert('GPS failed: '+e.message); }
  finally{ U.gps.disabled = false; }
}

async function fetchWeather(){
  const U = ui();
  const lat = parseFloat(U.lat.value); const lon = parseFloat(U.lon.value);
  if(!Number.isFinite(lat) || !Number.isFinite(lon)){ U.wxStatus.textContent = 'Set lat/lon first'; return; }
  U.wxStatus.textContent = 'Loading…';
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover,visibility,temperature_2m,relative_humidity_2m&timezone=auto`;
  try{
    const r = await fetch(url);
    const j = await r.json();
    U.wxStatus.textContent = 'Updated';
    renderWx(j);
    computeTop5();
  }catch(e){ U.wxStatus.textContent = 'Weather failed'; }
}

function renderWx(j){
  const U = ui();
  if(!j || !j.hourly){ U.wx.innerHTML = '<span class="small">No weather.</span>'; return; }
  const t = j.hourly.time.slice(0,6).map((tm,i)=>({ time:tm, cloud:j.hourly.cloud_cover[i], vis:(j.hourly.visibility[i]||0)/1000, temp:j.hourly.temperature_2m[i] }));
  let html = '<table><thead><tr><th>Time</th><th>Cloud %</th><th>Vis (km)</th><th>Temp °C</th></tr></thead><tbody>';
  for(const r of t){ html += `<tr><td>${r.time}</td><td>${r.cloud}</td><td>${r.vis.toFixed(0)}</td><td>${r.temp}</td></tr>`; }
  html += '</tbody></table>';
  U.wx.innerHTML = html;
}

function jd(date){ return date.getTime()/86400000 + 2440587.5; }
function gmst(date){
  const J = jd(date), T = (J - 2451545.0)/36525;
  let th = 280.46061837 + 360.98564736629*(J-2451545) + 0.000387933*T*T - T*T*T/38710000;
  th = ((th%360)+360)%360; return th/15;
}
function lst(date, lon){ return (gmst(date) + lon/15 + 24)%24; }
function altFor(raH, decD, latD, lonD, date){
  const LST = lst(date, lonD)*15;
  const HA = ((LST - raH*15 + 540)%360)-180;
  const ha = (Math.PI/180)*HA, dec = (Math.PI/180)*decD, lat = (Math.PI/180)*latD;
  const sA = Math.sin(dec)*Math.sin(lat) + Math.cos(dec)*Math.cos(lat)*Math.cos(ha);
  return (180/Math.PI)*Math.asin(sA);
}
function sunEq(date){
  const J = jd(date); const T = (J-2451545.0)/36525;
  const L0 = (280.46646 + 36000.76983*T + 0.0003032*T*T)%360;
  const M = (357.52911 + 35999.05029*T - 0.0001537*T*T)%360;
  const C = (1.914602 - 0.004817*T - 0.000014*T*T)*Math.sin((Math.PI/180)*M) + (0.019993 - 0.000101*T)*Math.sin(2*(Math.PI/180)*M) + 0.000289*Math.sin(3*(Math.PI/180)*M);
  const lam = L0 + C;
  const eps = 23.439291 - 0.0130042*T;
  const ra = Math.atan2(Math.cos((Math.PI/180)*eps)*Math.sin((Math.PI/180)*lam), Math.cos((Math.PI/180)*lam));
  const dec = Math.asin(Math.sin((Math.PI/180)*eps)*Math.sin((Math.PI/180)*lam));
  return { raH: (ra<0?ra+2*Math.PI:ra)*12/Math.PI, decD: (180/Math.PI)*dec, lamD: lam };
}
function moonEq(date){
  const J = jd(date);
  const L = (218.316 + 13.176396*(J-2451545.0))%360;
  const M = (134.963 + 13.064993*(J-2451545.0))%360;
  const F = (93.272 + 13.229350*(J-2451545.0))%360;
  const lon = (L + 6.289*Math.sin((Math.PI/180)*M))%360;
  const lat = 5.128*Math.sin((Math.PI/180)*F);
  const eps = 23.439;
  const ra = Math.atan2(Math.sin((Math.PI/180)*lon)*Math.cos((Math.PI/180)*eps) - Math.tan((Math.PI/180)*lat)*Math.sin((Math.PI/180)*eps), Math.cos((Math.PI/180)*lon));
  const dec = Math.asin(Math.sin((Math.PI/180)*lat)*Math.cos((Math.PI/180)*eps) + Math.cos((Math.PI/180)*lat)*Math.sin((Math.PI/180)*eps)*Math.sin((Math.PI/180)*lon));
  return { raH: (ra<0?ra+2*Math.PI:ra)*12/Math.PI, decD: (180/Math.PI)*dec, lonD: lon };
}
function sepDeg(raH1, decD1, raH2, decD2){
  const a1 = (Math.PI/180)*decD1, a2 = (Math.PI/180)*decD2;
  const dRA = (Math.PI/180)*((raH1-raH2)*15);
  const cosS = Math.sin(a1)*Math.sin(a2) + Math.cos(a1)*Math.cos(a2)*Math.cos(dRA);
  return (180/Math.PI)*Math.acos(Math.min(1,Math.max(-1,cosS)));
}

function updateMoonInfo(){
  const U = ui();
  const lat = parseFloat(U.lat.value)||0, lon = parseFloat(U.lon.value)||0;
  const start = new Date(U.start.value || new Date());
  const hours = parseInt(U.dur.value,10)||3;
  const mid = new Date(start.getTime() + hours*0.5*3600*1000);
  const s = sunEq(mid), m = moonEq(mid);
  const altM = altFor(m.raH, m.decD, lat, lon, mid);
  const phase = (m.lonD - s.lamD + 360)%360;
  const illum = (1 - Math.cos((Math.PI/180)*phase))/2;
  U.moonInfo.textContent = `Moon: ${(illum*100).toFixed(0)}% • Alt ~ ${altM.toFixed(0)}° at ${mid.toLocaleTimeString()}`;
  return { s, m, altM, illum };
}

function computeTop5(){
  const U = ui();
  const lat = parseFloat(U.lat.value), lon = parseFloat(U.lon.value);
  if(!Number.isFinite(lat) || !Number.isFinite(lon)){ U.top5.innerHTML = '<li class="bad">Set location first</li>'; return; }
  const start = new Date(U.start.value);
  const hours = parseInt(U.dur.value,10)||3;
  const mid = new Date(start.getTime() + hours*0.5*3600*1000);

  const s = sunEq(mid);
  const altSun = altFor(s.raH, s.decD, lat, lon, mid);
  if(altSun > -12){ U.top5.innerHTML = '<li class="bad">Astronomical darkness not reached in your window.</li>'; return; }

  const clouds = Array.from(document.querySelectorAll('#wx tbody tr td:nth-child(2)')).slice(0,3).map(td=>parseFloat(td.textContent)||50);
  const cloudPenalty = clouds.length? (clouds.reduce((a,b)=>a+b,0)/clouds.length)/100 : 0.5;

  const m = moonEq(mid);
  const altM = altFor(m.raH, m.decD, lat, lon, mid);
  const illum = (1 - Math.cos((Math.PI/180)*((m.lonD - s.lamD + 360)%360)))/2;
  function moonPenalty(raH, decD){
    const sep = sepDeg(raH, decD, m.raH, m.decD);
    let p = 0;
    if(sep < 15) p = 0.6;
    else if(sep < 30) p = 0.35;
    else p = 0.1;
    const high = altM > 45 ? 0.15 : 0.0;
    return (p + high) * illum;
  }

  const scored = window.MESSIER_SUBSET.map(o=>{
    const alt = altFor(o.ra, o.dec, lat, lon, mid);
    if(alt<=25) return {...o, alt, score:0, sep:null};
    const sep = sepDeg(o.ra, o.dec, m.raH, m.decD);
    const mpen = moonPenalty(o.ra, o.dec);
    let score = (alt/90) * (1 - cloudPenalty) * (1 - mpen);
    return {...o, alt, sep, score};
  }).filter(o=>o.score>0).sort((a,b)=>b.score-a.score).slice(0,5);

  const li = scored.map(o=>`<li><strong>${o.id}</strong> — ${o.name} • alt ~ ${o.alt.toFixed(0)}° • sep ${o.sep?.toFixed(0)}° • ${(o.score*100).toFixed(0)}%</li>`).join('');
  U.top5.innerHTML = li || '<li class="bad">No suitable targets in this subset for the chosen window.</li>';

  U.moonInfo.textContent = `Moon: ${(illum*100).toFixed(0)}% • Alt ~ ${altM.toFixed(0)}° at ${mid.toLocaleTimeString()}`;
  renderTable();
}

function renderTable(){
  const U = ui();
  const q = (U.search.value||'').toLowerCase();
  const rows = window.MESSIER_SUBSET.filter(o=>!q || o.id.toLowerCase().includes(q) || o.name.toLowerCase().includes(q) || o.type.toLowerCase().includes(q))
    .map(o=>`<tr><td>${o.id}</td><td>${o.name}</td><td>${o.type}</td><td>${o.ra.toFixed(3)}h</td><td>${o.dec.toFixed(1)}°</td></tr>`).join('');
  U.table.innerHTML = `<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>RA</th><th>Dec</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* Splash controls */
$('#skip').addEventListener('click', ()=>{ splash.classList.add('hidden'); app.classList.remove('hidden'); });
$('#retry').addEventListener('click', ()=>{ debug.innerHTML=''; bar.style.width='0%'; progress=0; runSteps(); });

document.addEventListener('DOMContentLoaded', ()=>{ initPlanner(); runSteps(); });
