window.GNG_VERSION='v13';
window.GNG_VERSION='v11';
'use strict';
const $ = (s, r=document)=>r.querySelector(s);

/* ===== Astronomy helpers ===== */
const d2r=x=>x*Math.PI/180,r2d=x=>x*180/Math.PI;
function jd(date){ return date.getTime()/86400000 + 2440587.5; }
function gmst(date){ const J=jd(date),T=(J-2451545)/36525; let th=280.46061837+360.98564736629*(J-2451545)+0.000387933*T*T-T*T*T/38710000; th=((th%360)+360)%360; return th/15; }
function lst(date, lon){ return (gmst(date)+lon/15+24)%24; }
function sunEq(date){ const J=jd(date),T=(J-2451545)/36525; const L0=(280.46646+36000.76983*T+0.0003032*T*T)%360; const M=(357.52911+35999.05029*T-0.0001537*T*T)%360;
  const C=(1.914602-0.004817*T-0.000014*T*T)*Math.sin(d2r(M))+(0.019993-0.000101*T)*Math.sin(d2r(2*M))+0.000289*Math.sin(d2r(3*M)); const lam=L0+C, eps=23.439291-0.0130042*T;
  const ra=Math.atan2(Math.cos(d2r(eps))*Math.sin(d2r(lam)),Math.cos(d2r(lam))); const dec=Math.asin(Math.sin(d2r(eps))*Math.sin(d2r(lam))); return {raH:(ra<0?ra+2*Math.PI:ra)*12/Math.PI, decD:r2d(dec), lamD:lam}; }
function moonEq(date){ const J=jd(date); const L=(218.316+13.176396*(J-2451545))%360, M=(134.963+13.064993*(J-2451545))%360, F=(93.272+13.229350*(J-2451545))%360;
  const lon=(L+6.289*Math.sin(d2r(M)))%360, lat=5.128*Math.sin(d2r(F)), eps=23.439; const ra=Math.atan2(Math.sin(d2r(lon))*Math.cos(d2r(eps))-Math.tan(d2r(lat))*Math.sin(d2r(eps)),Math.cos(d2r(lon)));
  const dec=Math.asin(Math.sin(d2r(lat))*Math.cos(d2r(eps))+Math.cos(d2r(lat))*Math.sin(d2r(eps))*Math.sin(d2r(lon))); return {raH:(ra<0?ra+2*Math.PI:ra)*12/Math.PI, decD:r2d(dec), lonD:lon}; }
function altFor(raH, decD, latD, lonD, date){ const LST=lst(date,lonD)*15; const HA=((LST-raH*15+540)%360)-180; const ha=d2r(HA), dec=d2r(decD), lat=d2r(latD);
  const sA=Math.sin(dec)*Math.sin(lat)+Math.cos(dec)*Math.cos(lat)*Math.cos(ha); return r2d(Math.asin(sA)); }
function sepDeg(raH1,decD1,raH2,decD2){ const a1=d2r(decD1),a2=d2r(decD2), dRA=d2r((raH1-raH2)*15);
  const cosS=Math.sin(a1)*Math.sin(a2)+Math.cos(a1)*Math.cos(a2)*Math.cos(dRA); return r2d(Math.acos(Math.min(1,Math.max(-1,cosS)))); }

/* ===== UI getters ===== */
function ui(){ return {
  statusBadge:$('#statusBadge'), summary:$('#summary'), miniMoon:$('#miniMoon'),
  topPickName:$('#topPickName'), topPickMeta:$('#topPickMeta'),
  scopeSel:$('#scopeSel'), scopeFL:$('#scopeFL'), scopeAp:$('#scopeAp'), optFactor:$('#optFactor'), chips:$('#chips'), savePreset:$('#savePreset'),
  camSel:$('#camSel'), camW:$('#camW'), camH:$('#camH'), camPx:$('#camPx'),
  lat:$('#lat'), lon:$('#lon'), gps:$('#gpsBtn'), tz:$('#tz'),
  start:$('#start'), dur:$('#duration'), save:$('#saveSetup'),
  fov:$('#fov'), scale:$('#scale'), effFL:$('#effFL'),
  fetchWx:$('#fetchWx'), wxStatus:$('#wxStatus'), wx:$('#wx'),
  moonInfo:$('#moonInfo'), top5:$('#top5'), search:$('#search'), recompute:$('#recompute'), table:$('#table'),
  offlineBtn:$('#offlineCache'), clearOffline:$('#clearOffline'), cacheState:$('#cacheState'),
  // scoring controls
  sAltMin:$('#s-alt-min'), sAltBest:$('#s-alt-best'),
  sCloudGood:$('#s-cloud-good'), sCloudBad:$('#s-cloud-bad'),
  sWindGood:$('#s-wind-good'), sWindBad:$('#s-wind-bad'),
  sHumidGood:$('#s-humid-good'), sHumidBad:$('#s-humid-bad'),
  sVisGood:$('#s-vis-good'), sVisBad:$('#s-vis-bad'),
  sMoonTight:$('#s-moon-tight'), sMoonLoose:$('#s-moon-loose'),
  sWeightAlt:$('#w-alt'), sWeightCloud:$('#w-cloud'), sWeightMoon:$('#w-moon'), sWeightMet:$('#w-met')
};}

/* ===== Presets (expanded) ===== */
const scopes=[
  {id:'sv503', name:"SVBONY SV503 80ED (560mm f/7)", fl:560, ap:80, presets:[0.8,1.0,2.0]},
  {id:'gt71',  name:"William Optics GT71 (420mm f/5.9)", fl:420, ap:71, presets:[0.8,1.0,2.0]},
  {id:'redcat',name:"RedCat 51 (250mm f/4.9)", fl:250, ap:51, presets:[1.0,2.0]},
  {id:'fra400',name:"Askar FRA400 (400mm f/5.6)", fl:400, ap:72, presets:[0.7,0.8,1.0,2.0]},
  {id:'esprit100',name:"SkyWatcher Esprit 100 (550mm f/5.5)", fl:550, ap:100, presets:[0.77,0.8,1.0,2.0]},
  {id:'samy135',name:"Samyang/Rokinon 135mm f/2 (135mm)", fl:135, ap:67, presets:[1.0,2.0]},
  {id:'edge8', name:"Celestron EdgeHD 8" (2032mm f/10)", fl:2032, ap:203, presets:[0.7,0.63,1.0,2.0]},
  {id:'c925',  name:"Celestron C9.25 (2350mm f/10)", fl:2350, ap:235, presets:[0.7,0.63,1.0,2.0]},
  {id:'c11',   name:"Celestron C11 (2800mm f/10)", fl:2800, ap:279, presets:[0.7,0.63,1.0,2.0]},
  {id:'rasa8', name:"Celestron RASA 8 (400mm f/2)", fl:400, ap:203, presets:[1.0]},
  {id:'sw150p',name:"SkyWatcher 150P (750mm f/5)", fl:750, ap:150, presets:[1.0,2.0]},
  {id:'c6',   name:"Celestron C6 / 6SE (1500mm f/10)", fl:1500, ap:150, presets:[0.63,1.0,2.0]},
  {id:'custom',name:"Custom...", fl:null, ap:null, presets:[1.0]}
];
const cameras=[
  {name:"ZWO ASI533MC Pro (IMX533)", w:11.31, h:11.31, px:3.76},
  {name:"ZWO ASI2600 (IMX571 APS-C)", w:23.5, h:15.7, px:3.76},
  {name:"ZWO ASI6200 (Full Frame)", w:36.0, h:24.0, px:3.76},
  {name:"ZWO ASI294MM", w:19.1, h:13.0, px:4.63},
  {name:"ZWO ASI1600MM", w:17.7, h:13.4, px:3.80},
  {name:"ZWO ASI183MC", w:13.2, h:8.8, px:2.40},
  {name:"Canon T3i / 600D", w:22.3, h:14.9, px:4.30},
  {name:"Canon R6", w:35.9, h:23.9, px:6.56},
  {name:"Nikon D750", w:35.9, h:24.0, px:5.97},
  {name:"Nikon Z6", w:35.9, h:23.9, px:5.94},
  {name:"Sony A7 III", w:35.8, h:23.8, px:5.94},
  {name:"Custom...", w:null, h:null, px:null}
];

/* ===== Scoring defaults (astro-imaging biased) ===== */
const DEFAULT_THRESHOLDS = {
  alt_min: 35,   // below this, reject
  alt_best: 60,  // 60+ is ideal
  cloud_good: 25, // <=25% clouds best
  cloud_bad: 60, // >=60% clouds is bad
  wind_good: 10, // km/h
  wind_bad: 25,
  humid_good: 35, // % RH
  humid_bad: 85,
  vis_good: 15, // km
  vis_bad: 8,
  moon_tight: 20, // deg separation where penalty is strongest
  moon_loose: 45, // deg where penalty fades
  weights: { alt: 0.35, cloud: 0.25, moon: 0.25, met: 0.15 }
};

function loadThresholds(){
  try{ return JSON.parse(localStorage.getItem('gng.thresholds')) || DEFAULT_THRESHOLDS; }catch(e){ return DEFAULT_THRESHOLDS; }
}
function saveThresholds(t){ localStorage.setItem('gng.thresholds', JSON.stringify(t)); }

let TH = loadThresholds();
let lastWeather=null;

function init(){ const U=ui();
  document.querySelectorAll('button:not([type])').forEach(b=>b.setAttribute('type','button'));
  // presets
  scopes.forEach((s,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=s.name; U.scopeSel.appendChild(o); });
  cameras.forEach((c,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=c.name; U.camSel.appendChild(o); });
  U.scopeSel.value=0; U.camSel.value=0; applyScope(); applyCam(); renderChips();
  // session
  const now=new Date(); now.setMinutes(now.getMinutes()-now.getTimezoneOffset()); U.start.value=now.toISOString().slice(0,16);
  U.tz.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const Llat=localStorage.getItem('gng.last.lat'), Llon=localStorage.getItem('gng.last.lon'); if(Llat && Llon){ U.lat.value=Llat; U.lon.value=Llon; autoFetchWeather(); } else { tryGPS(); }
  loadSaved(); updateOptics(); bind(); hydrateThresholdControls(); updateMoonInfo(); glanceStatus(); updateCacheState();
}

function bind(){ const U=ui();
  U.scopeSel.addEventListener('change', ()=>{applyScope(); renderChips(); updateOptics(); computeAll();});
  U.camSel.addEventListener('change', ()=>{applyCam(); updateOptics();});
  U.scopeFL.addEventListener('input', ()=>{updateOptics();});
  U.optFactor.addEventListener('input', ()=>{ updateOptics(); highlightChip(parseFloat(U.optFactor.value)||1); });
  U.camW.addEventListener('input', updateOptics); U.camH.addEventListener('input', updateOptics); U.camPx.addEventListener('input', updateOptics);
  U.gps.addEventListener('click', tryGPS);
  U.fetchWx.addEventListener('click', autoFetchWeather);
  U.recompute.addEventListener('click', computeAll);
  U.save.addEventListener('click', saveSetup);
  U.savePreset.addEventListener('click', ()=>{ const s=scopes[parseInt(U.scopeSel.value,10)]; const factor=parseFloat(U.optFactor.value)||1; localStorage.setItem(`gng.preset.${s.id}`, String(factor)); renderChips(); });
  U.search.addEventListener('input', renderTable);
  if(U.offlineBtn) U.offlineBtn.addEventListener('click', precacheOffline);
  if(U.clearOffline) U.clearOffline.addEventListener('click', clearOfflineCache);
  // scoring binds
  ['sAltMin','sAltBest','sCloudGood','sCloudBad','sWindGood','sWindBad','sHumidGood','sHumidBad','sVisGood','sVisBad','sMoonTight','sMoonLoose','sWeightAlt','sWeightCloud','sWeightMoon','sWeightMet']
    .forEach(id=>{ const el=ui()[id]; if(el){ el.addEventListener('input', onThresholdChange); }});
  renderTable();
}

function renderChips(){ const U=ui(); U.chips.innerHTML=''; const s=scopes[parseInt(U.scopeSel.value,10)]; const key=`gng.preset.${s.id}`; const custom=localStorage.getItem(key);
  const list=[...s.presets]; if(custom){ const v=parseFloat(custom); if(Number.isFinite(v) && !list.includes(v)) list.unshift(v); }
  list.forEach(f=>{ const b=document.createElement('button'); b.textContent=`${f}x`; b.addEventListener('click',()=>{ U.optFactor.value=String(f); highlightChip(f); updateOptics(); }); U.chips.appendChild(b); });
  highlightChip(parseFloat(U.optFactor.value)||1);
}
function highlightChip(v){ const U=ui(); [...U.chips.querySelectorAll('button')].forEach(b=>b.classList.toggle('active', b.textContent===`${v}x`)); }
function applyScope(){ const U=ui(); const s=scopes[parseInt(U.scopeSel.value,10)]; if(s.fl){U.scopeFL.value=s.fl;} if(s.ap){U.scopeAp.value=s.ap;} }
function applyCam(){ const U=ui(); const c=cameras[parseInt(U.camSel.value,10)]; if(c.w){U.camW.value=c.w;} if(c.h){U.camH.value=c.h;} if(c.px){U.camPx.value=c.px;} }
function updateOptics(){ const U=ui(); const fl=parseFloat(U.scopeFL.value)||0; const f=parseFloat(U.optFactor.value)||1; const eff=fl*f;
  const sw=parseFloat(U.camW.value)||0, sh=parseFloat(U.camH.value)||0, px=parseFloat(U.camPx.value)||0;
  U.effFL.textContent = eff>0 ? `Eff. FL: ${eff.toFixed(0)} mm` : 'Eff. FL: -';
  U.fov.textContent = (eff>0 && sw>0 && sh>0) ? `FOV: ${(57.2958*sw/eff).toFixed(1)} deg x ${(57.2958*sh/eff).toFixed(1)} deg` : 'FOV: -';
  U.scale.textContent = (eff>0 && px>0) ? `Scale: ${(206.265*px/eff).toFixed(2)}"/px` : 'Scale: -';
}
function saveSetup(){ const U=ui(); const data={scope:{fl:U.scopeFL.value, ap:U.scopeAp.value, sel:U.scopeSel.value, factor:U.optFactor.value},
  cam:{w:U.camW.value, h:U.camH.value, px:U.camPx.value, sel:U.camSel.value},
  loc:{lat:U.lat.value, lon:U.lon.value}, session:{start:U.start.value, dur:U.dur.value}}; localStorage.setItem('gng.setup', JSON.stringify(data)); }
function loadSaved(){ const U=ui(); const j=localStorage.getItem('gng.setup'); if(!j) return; const d=JSON.parse(j);
  if(d.scope){ U.scopeSel.value=d.scope.sel; U.scopeFL.value=d.scope.fl; U.scopeAp.value=d.scope.ap; U.optFactor.value=d.scope.factor||'1.00'; }
  if(d.cam){ U.camSel.value=d.cam.sel; U.camW.value=d.cam.w; U.camH.value=d.cam.h; U.camPx.value=d.cam.px; }
  if(d.loc){ U.lat.value=d.loc.lat; U.lon.value=d.loc.lon; }
  if(d.session){ U.start.value=d.session.start; U.dur.value=d.session.dur; } }

async function tryGPS(){ const U=ui(); try{ U.gps.disabled=true;
  const pos=await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{enableHighAccuracy:true,timeout:8000}));
  U.lat.value=pos.coords.latitude.toFixed(5); U.lon.value=pos.coords.longitude.toFixed(5);
  localStorage.setItem('gng.last.lat', U.lat.value); localStorage.setItem('gng.last.lon', U.lon.value);
  autoFetchWeather();
} catch(e){ U.wxStatus.textContent='GPS failed'; } finally{ U.gps.disabled=false; } }

async function autoFetchWeather(){ const U=ui(); const lat=parseFloat(U.lat.value), lon=parseFloat(U.lon.value);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)){ U.wxStatus.textContent='Set lat/lon'; return; }
  U.wxStatus.textContent='Loading...';
  try{ const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover,visibility,temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m&timezone=auto`);
    const j=await r.json(); lastWeather=j; U.wxStatus.textContent='Updated'; renderWx(j); computeAll();
  }catch(e){ U.wxStatus.textContent='Weather failed'; }
}
function renderWx(j){ const U=ui(); if(!j || !j.hourly){ U.wx.innerHTML='<span class="small">No weather.</span>'; return; }
  const n=6; const t=j.hourly.time.slice(0,n).map((tm,i)=>({time:tm, cloud:j.hourly.cloud_cover[i], vis:(j.hourly.visibility[i]||0)/1000, temp:j.hourly.temperature_2m[i], rh:j.hourly.relative_humidity_2m[i], wind:j.hourly.wind_speed_10m[i], gust:j.hourly.wind_gusts_10m[i]}));
  let html='<table><thead><tr><th>Time</th><th>Cloud %</th><th>Vis km</th><th>Temp  degC</th><th>RH %</th><th>Wind</th><th>Gust</th></tr></thead><tbody>';
  for(const r of t){ html+=`<tr><td>${r.time}</td><td>${r.cloud}</td><td>${r.vis.toFixed(0)}</td><td>${r.temp}</td><td>${r.rh||'-'}</td><td>${r.wind||'-'}</td><td>${r.gust||'-'}</td></tr>`; } html+='</tbody></table>'; U.wx.innerHTML=html; }

function updateMoonInfo(){ const U=ui(); const lat=parseFloat(U.lat.value)||0, lon=parseFloat(U.lon.value)||0;
  const start=new Date(U.start.value||new Date()); const hours=parseInt(U.dur.value,10)||3; const mid=new Date(start.getTime()+hours*0.5*3600*1000);
  const s=sunEq(mid), m=moonEq(mid); const altM=altFor(m.raH,m.decD,lat,lon,mid); const phase=(m.lonD-s.lamD+360)%360; const illum=(1-Math.cos(d2r(phase)))/2;
  ui().moonInfo.textContent=`Moon: ${(illum*100).toFixed(0)}%   Alt ${altM.toFixed(0)} deg at ${mid.toLocaleTimeString()}`;
  ui().miniMoon.textContent=`Moon ${(illum*100).toFixed(0)}%   alt ${altM.toFixed(0)} deg`;
  return {s,m,altM,illum}; }

function clamp01(x){ return Math.max(0, Math.min(1, x)); }
function lerp01(x, a0, a1){ if(a0===a1) return 0; return clamp01((x - a0) / (a1 - a0)); }

function glanceStatus(){
  const U=ui();
  const clouds=Array.from(document.querySelectorAll('#wx tbody tr td:nth-child(2)')).slice(0,3).map(td=>parseFloat(td.textContent)||50);
  const avgCloud = clouds.length?(clouds.reduce((a,b)=>a+b,0)/clouds.length):60;
  const s=sunEq(new Date(U.start.value)); const altSun=altFor(s.raH,s.decD,parseFloat(U.lat.value)||0,parseFloat(U.lon.value)||0,new Date(U.start.value));
  const dark = altSun<=-12;
  let status='MARGINAL', cls='marginal';
  if(!dark) { status='NO-GO'; cls='nogo'; }
  else if(avgCloud<=TH.cloud_good) { status='GO'; cls='go'; }
  else if(avgCloud>=TH.cloud_bad) { status='NO-GO'; cls='nogo'; }
  U.statusBadge.textContent = status; U.statusBadge.className = 'badge ' + cls;
  const visCell = document.querySelector('#wx tbody tr td:nth-child(3)'); const vis = visCell? Number(visCell.textContent)||0 : 0;
  U.summary.textContent = `${status}   Clouds ~${Math.round(avgCloud)}%   Vis ${Math.round(vis)}km   ${dark?'Astro dark':'Too bright'}`;
}

function scoreTarget(o, mid, lat, lon, mInfo){
  const alt = altFor(o.ra,o.dec,lat,lon,mid);
  if(alt<TH.alt_min) return {score:0, alt, sep:null, reason:'low-alt'};
  // Clouds (avg of first 3 rows)
  const clouds = Array.from(document.querySelectorAll('#wx tbody tr td:nth-child(2)')).slice(0,3).map(td=>parseFloat(td.textContent)||50);
  const cloudAvg = clouds.length?(clouds.reduce((a,b)=>a+b,0)/clouds.length):60;
  let cloudScore = 1 - lerp01(cloudAvg, TH.cloud_good, TH.cloud_bad); // 1 good, 0 bad

  // Moon separation & illumination
  const sep = sepDeg(o.ra,o.dec,mInfo.raH,mInfo.decD);
  let sepFactor = 1 - lerp01(sep, TH.moon_tight, TH.moon_loose); // 1 at tight, 0 at loose => invert below
  sepFactor = 1 - sepFactor; // now 1 when loose (good), 0 when tight (bad)
  const illum = mInfo.illum; // 0..1
  const moonScore = clamp01(sepFactor * (1 - illum)); // prefer large sep & low illumination

  // Meteorology: wind / humidity / visibility from first row
  const row = document.querySelector('#wx tbody tr');
  let wind = 15, rh = 50, vis = 10;
  if(row){
    const tds = row.querySelectorAll('td');
    const visCell = parseFloat(tds[2]?.textContent||10);
    const rhCell  = parseFloat(tds[4]?.textContent||50);
    const windCell= parseFloat(tds[5]?.textContent||15);
    vis = isFinite(visCell)?visCell:10;
    rh  = isFinite(rhCell)?rhCell:50;
    wind= isFinite(windCell)?windCell:15;
  }
  const windScore = 1 - lerp01(wind, TH.wind_good, TH.wind_bad);
  const rhScore   = 1 - lerp01(rh,   TH.humid_good, TH.humid_bad);
  const visScore  = lerp01(vis, TH.vis_bad, TH.vis_good); // more is better
  const metScore  = clamp01((windScore + rhScore + visScore)/3);

  // Altitude: below alt_min rejected; between min and best ramps 0..1; above best is 1
  const altScore = alt>=TH.alt_best ? 1 : lerp01(alt, TH.alt_min, TH.alt_best);

  const W = TH.weights;
  const score = clamp01(W.alt*altScore + W.cloud*cloudScore + W.moon*moonScore + W.met*metScore);

  return {score, alt, sep};
}

function computeTop5(){
  const U=ui(); const lat=parseFloat(U.lat.value), lon=parseFloat(U.lon.value);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)){ U.top5.innerHTML='<li class="bad">Set location first</li>'; U.topPickName.textContent='-'; U.topPickMeta.textContent=''; return; }
  const start=new Date(U.start.value); const hours=parseInt(U.dur.value,10)||3; const mid=new Date(start.getTime()+hours*0.5*3600*1000);
  const s=sunEq(mid); const altSun=altFor(s.raH,s.decD,lat,lon,mid); if(altSun>-12){ U.top5.innerHTML='<li class="bad">Astronomical darkness not reached.</li>'; U.topPickName.textContent='-'; U.topPickMeta.textContent=''; return; }
  const m=moonEq(mid); const mInfo={ raH:m.raH, decD:m.decD, illum:(1-Math.cos(d2r(((m.lonD - s.lamD + 360)%360))))/2 };
  const scored=window.MESSIER_SUBSET.map(o=>{ const r=scoreTarget(o, mid, lat, lon, mInfo); return {...o, ...r}; })
    .filter(o=>o.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
  U.top5.innerHTML = scored.length ? scored.map((o,i)=>`<li>${i===0?'<span aria-hidden="true"> </span> ':''}<strong>${o.id}</strong> - ${o.name}   alt ${o.alt.toFixed(0)} deg   ${(o.sep??0).toFixed(0)} deg from Moon   ${(o.score*100).toFixed(0)}%</li>`).join('') : '<li class="bad">No suitable targets.</li>';
  if(scored.length){ const t=scored[0]; U.topPickName.textContent = t.name; U.topPickMeta.textContent = `alt ${t.alt.toFixed(0)} deg   ${(t.sep??0).toFixed(0)} deg from Moon   ${(t.score*100).toFixed(0)}%`; }
  else { U.topPickName.textContent='-'; U.topPickMeta.textContent=''; }
  updateMoonInfo(); glanceStatus(); renderTable();
}

function renderTable(){ const U=ui(); const q=(U.search?.value||'').toLowerCase();
  const rows=window.MESSIER_SUBSET.filter(o=>!q||o.id.toLowerCase().includes(q)||o.name.toLowerCase().includes(q)||o.type.toLowerCase().includes(q))
    .map(o=>`<tr><td>${o.id}</td><td>${o.name}</td><td>${o.type}</td><td>${o.ra.toFixed(3)}h</td><td>${o.dec.toFixed(1)} deg</td></tr>`).join('');
  U.table.innerHTML=`<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>RA</th><th>Dec</th></tr></thead><tbody>${rows}</tbody></table>`; }

function computeAll(){ updateMoonInfo(); computeTop5(); glanceStatus(); }

// Offline cache (unchanged, JS syntax corrected earlier)
async function precacheOffline(){
  try{ await navigator.serviceWorker.ready; const res = await fetch('./precache.json', {cache:'no-store'}); const files = await res.json();
    const cache = await caches.open('gng-app-v1'); await cache.addAll(files); ui().cacheState.textContent = 'Offline assets stored.'; }
  catch(e){ ui().cacheState.textContent = 'Offline caching failed.'; }
}
async function clearOfflineCache(){
  const keys = await caches.keys();
  await Promise.all(keys.map(k => (k.startsWith('gng-') || k==='gng-app-v1') ? caches.delete(k) : null));
  ui().cacheState.textContent = 'Offline cache cleared.';
}
async function updateCacheState(){
  try{ const keys = await caches.keys(); const g = keys.filter(k=>k.startsWith('gng-') || k==='gng-app-v1'); ui().cacheState.textContent = g.length ? `Offline caches: ${g.join(', ')}` : 'No offline cache yet.'; }
  catch(e){ ui().cacheState.textContent='cache: n/a'; }
}

/* ===== Thresholds UI ===== */
function hydrateThresholdControls(){
  const U=ui();
  // set values
  if(U.sAltMin) U.sAltMin.value = TH.alt_min;
  if(U.sAltBest) U.sAltBest.value = TH.alt_best;
  if(U.sCloudGood) U.sCloudGood.value = TH.cloud_good;
  if(U.sCloudBad) U.sCloudBad.value = TH.cloud_bad;
  if(U.sWindGood) U.sWindGood.value = TH.wind_good;
  if(U.sWindBad) U.sWindBad.value = TH.wind_bad;
  if(U.sHumidGood) U.sHumidGood.value = TH.humid_good;
  if(U.sHumidBad) U.sHumidBad.value = TH.humid_bad;
  if(U.sVisGood) U.sVisGood.value = TH.vis_good;
  if(U.sVisBad) U.sVisBad.value = TH.vis_bad;
  if(U.sMoonTight) U.sMoonTight.value = TH.moon_tight;
  if(U.sMoonLoose) U.sMoonLoose.value = TH.moon_loose;
  if(U.sWeightAlt) U.sWeightAlt.value = TH.weights.alt;
  if(U.sWeightCloud) U.sWeightCloud.value = TH.weights.cloud;
  if(U.sWeightMoon) U.sWeightMoon.value = TH.weights.moon;
  if(U.sWeightMet) U.sWeightMet.value = TH.weights.met;
}
function onThresholdChange(){
  const U=ui();
  TH = {
    alt_min: parseFloat(U.sAltMin.value)||DEFAULT_THRESHOLDS.alt_min,
    alt_best: parseFloat(U.sAltBest.value)||DEFAULT_THRESHOLDS.alt_best,
    cloud_good: parseFloat(U.sCloudGood.value)||DEFAULT_THRESHOLDS.cloud_good,
    cloud_bad: parseFloat(U.sCloudBad.value)||DEFAULT_THRESHOLDS.cloud_bad,
    wind_good: parseFloat(U.sWindGood.value)||DEFAULT_THRESHOLDS.wind_good,
    wind_bad: parseFloat(U.sWindBad.value)||DEFAULT_THRESHOLDS.wind_bad,
    humid_good: parseFloat(U.sHumidGood.value)||DEFAULT_THRESHOLDS.humid_good,
    humid_bad: parseFloat(U.sHumidBad.value)||DEFAULT_THRESHOLDS.humid_bad,
    vis_good: parseFloat(U.sVisGood.value)||DEFAULT_THRESHOLDS.vis_good,
    vis_bad: parseFloat(U.sVisBad.value)||DEFAULT_THRESHOLDS.vis_bad,
    moon_tight: parseFloat(U.sMoonTight.value)||DEFAULT_THRESHOLDS.moon_tight,
    moon_loose: parseFloat(U.sMoonLoose.value)||DEFAULT_THRESHOLDS.moon_loose,
    weights: {
      alt: parseFloat(U.sWeightAlt.value)||DEFAULT_THRESHOLDS.weights.alt,
      cloud: parseFloat(U.sWeightCloud.value)||DEFAULT_THRESHOLDS.weights.cloud,
      moon: parseFloat(U.sWeightMoon.value)||DEFAULT_THRESHOLDS.weights.moon,
      met: parseFloat(U.sWeightMet.value)||DEFAULT_THRESHOLDS.weights.met
    }
  };
  // normalize weights to sum to 1
  const wSum=TH.weights.alt+TH.weights.cloud+TH.weights.moon+TH.weights.met;
  if(wSum>0){ TH.weights.alt/=wSum; TH.weights.cloud/=wSum; TH.weights.moon/=wSum; TH.weights.met/=wSum; }
  saveThresholds(TH);
  computeAll();
}

document.addEventListener('DOMContentLoaded', ()=>{ init(); });
