const $ = (s, r=document)=>r.querySelector(s);

/* Astronomy helpers */
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

function ui(){ return {
  statusBadge:$('#statusBadge'), summary:$('#summary'), miniMoon:$('#miniMoon'),
  topPickName:$('#topPickName'), topPickMeta:$('#topPickMeta'),
  scopeSel:$('#scopeSel'), scopeFL:$('#scopeFL'), scopeAp:$('#scopeAp'), optFactor:$('#optFactor'), chips:$('#chips'), savePreset:$('#savePreset'),
  camSel:$('#camSel'), camW:$('#camW'), camH:$('#camH'), camPx:$('#camPx'),
  lat:$('#lat'), lon:$('#lon'), gps:$('#gpsBtn'), tz:$('#tz'),
  start:$('#start'), dur:$('#duration'), save:$('#saveSetup'),
  fov:$('#fov'), scale:$('#scale'), effFL:$('#effFL'),
  fetchWx:$('#fetchWx'), wxStatus:$('#wxStatus'), wx:$('#wx'),
  moonInfo:$('#moonInfo'),
  top5:$('#top5'),
  search:$('#search'), recompute:$('#recompute'), table:$('#table')
};}

const scopes=[
  {id:'sv503', name:"SVBONY SV503 80ED (560mm f/7)", fl:560, ap:80, presets:[0.8, 1.0, 2.0]},
  {id:'redcat', name:"RedCat 51 (250mm f/4.9)", fl:250, ap:51, presets:[1.0, 2.0]},
  {id:'edge8', name:"Celestron EdgeHD 8" (2032mm f/10)", fl:2032, ap:203, presets:[0.7, 0.63, 1.0, 2.0]},
  {id:'custom', name:"Custom…", fl:null, ap:null, presets:[1.0]}
];
const cameras=[
  {name:"ZWO ASI533MC Pro", w:11.31, h:11.31, px:3.76},
  {name:"Canon T100 / 4000D", w:22.3, h:14.9, px:3.7},
  {name:"IMX571 APS-C", w:23.5, h:15.7, px:3.76},
  {name:"Custom…", w:null, h:null, px:null}
];

let lastWeather=null;

function init(){ const U=ui();
  scopes.forEach((s,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=s.name; U.scopeSel.appendChild(o); });
  cameras.forEach((c,i)=>{ const o=document.createElement('option'); o.value=i; o.textContent=c.name; U.camSel.appendChild(o); });
  U.scopeSel.value=0; U.camSel.value=0; applyScope(); applyCam(); renderChips();
  const now=new Date(); now.setMinutes(now.getMinutes()-now.getTimezoneOffset()); U.start.value=now.toISOString().slice(0,16);
  U.tz.textContent=Intl.DateTimeFormat().resolvedOptions().timeZone;
  const Llat=localStorage.getItem('gng.last.lat'), Llon=localStorage.getItem('gng.last.lon'); if(Llat && Llon){ U.lat.value=Llat; U.lon.value=Llon; autoFetchWeather(); }
  else { tryGPS(); }
  loadSaved(); updateOptics(); bind(); updateMoonInfo();
}

function bind(){ const U=ui();
  U.scopeSel.addEventListener('change', ()=>{applyScope(); renderChips(); updateOptics(); computeAll();});
  U.camSel.addEventListener('change', ()=>{applyCam(); updateOptics();});
  U.scopeFL.addEventListener('input', ()=>{updateOptics();});
  U.optFactor.addEventListener('input', ()=>{ updateOptics(); highlightChip(parseFloat(U.optFactor.value)||1); });
  U.camW.addEventListener('input', updateOptics);
  U.camH.addEventListener('input', updateOptics);
  U.camPx.addEventListener('input', updateOptics);
  U.gps.addEventListener('click', tryGPS);
  U.fetchWx.addEventListener('click', autoFetchWeather);
  U.recompute.addEventListener('click', computeAll);
  U.save.addEventListener('click', saveSetup);
  U.savePreset.addEventListener('click', ()=>{ const s=scopes[parseInt(U.scopeSel.value,10)]; const factor=parseFloat(U.optFactor.value)||1; localStorage.setItem(`gng.preset.${s.id}`, String(factor)); renderChips(); });
  U.search.addEventListener('input', renderTable);
  renderTable();
}

function renderChips(){ const U=ui(); U.chips.innerHTML=''; const s=scopes[parseInt(U.scopeSel.value,10)]; const key=`gng.preset.${s.id}`; const custom=localStorage.getItem(key);
  const list=[...s.presets]; if(custom){ const v=parseFloat(custom); if(Number.isFinite(v) && !list.includes(v)) list.unshift(v); }
  list.forEach(f=>{ const b=document.createElement('button'); b.textContent=`${f}×`; b.addEventListener('click',()=>{ U.optFactor.value=String(f); highlightChip(f); updateOptics(); }); U.chips.appendChild(b); });
  highlightChip(parseFloat(U.optFactor.value)||1);
}
function highlightChip(v){ const U=ui(); [...U.chips.querySelectorAll('button')].forEach(b=>b.classList.toggle('active', b.textContent===`${v}×`)); }

function applyScope(){ const U=ui(); const s=scopes[parseInt(U.scopeSel.value,10)]; if(s.fl){U.scopeFL.value=s.fl;} if(s.ap){U.scopeAp.value=s.ap;} }
function applyCam(){ const U=ui(); const c=cameras[parseInt(U.camSel.value,10)]; if(c.w){U.camW.value=c.w;} if(c.h){U.camH.value=c.h;} if(c.px){U.camPx.value=c.px;} }

function updateOptics(){ const U=ui(); const fl=parseFloat(U.scopeFL.value)||0; const f=parseFloat(U.optFactor.value)||1; const eff=fl*f;
  const sw=parseFloat(U.camW.value)||0, sh=parseFloat(U.camH.value)||0, px=parseFloat(U.camPx.value)||0;
  U.effFL.textContent = eff>0 ? `Eff. FL: ${eff.toFixed(0)} mm` : 'Eff. FL: —';
  U.fov.textContent = (eff>0 && sw>0 && sh>0) ? `FOV: ${(57.2958*sw/eff).toFixed(1)}° × ${(57.2958*sh/eff).toFixed(1)}°` : 'FOV: —';
  U.scale.textContent = (eff>0 && px>0) ? `Scale: ${(206.265*px/eff).toFixed(2)}″/px` : 'Scale: —';
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
  U.wxStatus.textContent='Loading…';
  try{ const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloud_cover,visibility,temperature_2m,relative_humidity_2m,wind_speed_10m,wind_gusts_10m&timezone=auto`);
    const j=await r.json(); lastWeather=j; U.wxStatus.textContent='Updated'; renderWx(j); computeAll();
  }catch(e){ U.wxStatus.textContent='Weather failed'; }
}
function renderWx(j){ const U=ui(); if(!j || !j.hourly){ U.wx.innerHTML='<span class="small">No weather.</span>'; return; }
  const n=6; const t=j.hourly.time.slice(0,n).map((tm,i)=>({time:tm, cloud:j.hourly.cloud_cover[i], vis:(j.hourly.visibility[i]||0)/1000, temp:j.hourly.temperature_2m[i], wind:j.hourly.wind_speed_10m[i], gust:j.hourly.wind_gusts_10m[i]}));
  let html='<table><thead><tr><th>Time</th><th>Cloud %</th><th>Vis km</th><th>Temp °C</th><th>Wind</th><th>Gust</th></tr></thead><tbody>';
  for(const r of t){ html+=`<tr><td>${r.time}</td><td>${r.cloud}</td><td>${r.vis.toFixed(0)}</td><td>${r.temp}</td><td>${r.wind||'—'}</td><td>${r.gust||'—'}</td></tr>`; } html+='</tbody></table>'; U.wx.innerHTML=html; }

function updateMoonInfo(){ const U=ui(); const lat=parseFloat(U.lat.value)||0, lon=parseFloat(U.lon.value)||0;
  const start=new Date(U.start.value||new Date()); const hours=parseInt(U.dur.value,10)||3; const mid=new Date(start.getTime()+hours*0.5*3600*1000);
  const s=sunEq(mid), m=moonEq(mid); const altM=altFor(m.raH,m.decD,lat,lon,mid); const phase=(m.lonD-s.lamD+360)%360; const illum=(1-Math.cos(d2r(phase)))/2;
  ui().moonInfo.textContent=`Moon: ${(illum*100).toFixed(0)}% • Alt ${altM.toFixed(0)}° at ${mid.toLocaleTimeString()}`;
  ui().miniMoon.textContent=`Moon ${(illum*100).toFixed(0)}% • alt ${altM.toFixed(0)}°`;
  return {s,m,altM,illum}; }

function glanceStatus(){ const U=ui();
  const clouds=Array.from(document.querySelectorAll('#wx tbody tr td:nth-child(2)')).slice(0,3).map(td=>parseFloat(td.textContent)||50);
  const avgCloud = clouds.length?(clouds.reduce((a,b)=>a+b,0)/clouds.length):60;
  const s=sunEq(new Date(U.start.value)); const altSun=altFor(s.raH,s.decD,parseFloat(U.lat.value)||0,parseFloat(U.lon.value)||0,new Date(U.start.value));
  const dark = altSun<=-12;
  // Simple rubric: combine cloud + darkness
  let status='MARGINAL', cls='marginal';
  if(!dark) { status='NO-GO'; cls='nogo'; }
  else if(avgCloud<=35) { status='GO'; cls='go'; }
  else if(avgCloud>70) { status='NO-GO'; cls='nogo'; }
  U.statusBadge.textContent = status; U.statusBadge.className = 'badge ' + cls;
  const visCell = document.querySelector('#wx tbody tr td:nth-child(3)'); const vis = visCell? Number(visCell.textContent)||0 : 0;
  U.summary.textContent = `${status} • Clouds ~${Math.round(avgCloud)}% • Vis ${Math.round(vis)}km • ${dark?'Astro dark':'Too bright'}`;
}

function computeTop5(){
  const U=ui(); const lat=parseFloat(U.lat.value), lon=parseFloat(U.lon.value);
  if(!Number.isFinite(lat)||!Number.isFinite(lon)){ U.top5.innerHTML='<li class="bad">Set location first</li>'; U.topPickName.textContent='—'; U.topPickMeta.textContent=''; return; }
  const start=new Date(U.start.value); const hours=parseInt(U.dur.value,10)||3; const mid=new Date(start.getTime()+hours*0.5*3600*1000);
  const s=sunEq(mid); const altSun=altFor(s.raH,s.decD,lat,lon,mid); if(altSun>-12){ U.top5.innerHTML='<li class="bad">Astronomical darkness not reached.</li>'; U.topPickName.textContent='—'; U.topPickMeta.textContent=''; return; }
  const clouds=Array.from(document.querySelectorAll('#wx tbody tr td:nth-child(2)')).slice(0,3).map(td=>parseFloat(td.textContent)||50);
  const cloudPenalty=clouds.length?(clouds.reduce((a,b)=>a+b,0)/clouds.length)/100:0.5;
  const m=moonEq(mid); const altM=altFor(m.raH,m.decD,lat,lon,mid); const illum=(1-Math.cos(d2r(((m.lonD - s.lamD + 360)%360))))/2;
  function moonPenalty(raH,decD){ const sep=sepDeg(raH,decD,m.raH,m.decD); let p=0; if(sep<15)p=0.6; else if(sep<30)p=0.35; else p=0.1; const high=altM>45?0.15:0.0; return (p+high)*illum; }
  const scored=window.MESSIER_SUBSET.map(o=>{ const alt=altFor(o.ra,o.dec,lat,lon,mid); if(alt<=25) return {...o,alt,score:0,sep:null}; const sep=sepDeg(o.ra,o.dec,m.raH,m.decD);
    const mpen=moonPenalty(o.ra,o.dec); let score=(alt/90)*(1-cloudPenalty)*(1-mpen); return {...o,alt,sep,score}; })
    .filter(o=>o.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
  U.top5.innerHTML = scored.length ? scored.map((o,i)=>`<li>${i===0?'<span aria-hidden="true">★</span> ':''}<strong>${o.id}</strong> — ${o.name} • alt ${o.alt.toFixed(0)}° • sep ${o.sep?.toFixed(0)}° • ${(o.score*100).toFixed(0)}%</li>`).join('') : '<li class="bad">No suitable targets.</li>';
  if(scored.length){ const t=scored[0]; U.topPickName.textContent = t.name; U.topPickMeta.textContent = `alt ${t.alt.toFixed(0)}° • sep ${t.sep?.toFixed(0)}° • ${(t.score*100).toFixed(0)}%`; }
  else { U.topPickName.textContent='—'; U.topPickMeta.textContent=''; }
  updateMoonInfo();
  glanceStatus();
  renderTable();
}

function renderTable(){ const U=ui(); const q=(U.search?.value||'').toLowerCase();
  const rows=window.MESSIER_SUBSET.filter(o=>!q||o.id.toLowerCase().includes(q)||o.name.toLowerCase().includes(q)||o.type.toLowerCase().includes(q))
    .map(o=>`<tr><td>${o.id}</td><td>${o.name}</td><td>${o.type}</td><td>${o.ra.toFixed(3)}h</td><td>${o.dec.toFixed(1)}°</td></tr>`).join('');
  U.table.innerHTML=`<table><thead><tr><th>ID</th><th>Name</th><th>Type</th><th>RA</th><th>Dec</th></tr></thead><tbody>${rows}</tbody></table>`; }

function computeAll(){ updateMoonInfo(); computeTop5(); glanceStatus(); }

document.addEventListener('DOMContentLoaded', ()=>{ init(); });
