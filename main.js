let allCatalogs = [...messierCatalog, ...caldwellCatalog, ...brightNGCCatalog];

// RA/Dec → Alt/Az
function radecToAltAz(ra, dec, lat, lon, date) {
  const rad = Math.PI / 180;
  const raRad = ra * rad * 15; // RA hours → radians
  const decRad = dec * rad;
  const latRad = lat * rad;

  // Julian date
  const JD = (date.getTime() / 86400000) + 2440587.5;
  const D = JD - 2451545.0;
  const GMST = 18.697374558 + 24.06570982441908 * D;
  const LST = (GMST + lon / 15) % 24;
  const lstRad = LST * 15 * rad;

  const HA = lstRad - raRad;
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(HA);
  return Math.asin(sinAlt) / rad; // degrees
}

// Results
function renderResults(objects) {
  const results = document.getElementById('results');
  results.innerHTML = '';
  if (objects.length === 0) {
    results.innerHTML = `<p class="text-center text-muted">No objects match your filters.</p>`;
    return;
  }
  objects.forEach(obj => {
    results.innerHTML += `
      <div class="col-md-4">
        <div class="card bg-secondary text-light h-100">
          <img src="${obj.image}" class="thumb card-img-top" alt="${obj.name}"
               onerror="this.src='images/placeholder.jpg';">
          <div class="card-body">
            <h5 class="card-title">${obj.id} – ${obj.name}</h5>
            <p>${obj.type}<br>Mag: ${obj.mag} | Size: ${obj.size}</p>
            <button class="btn btn-outline-light btn-sm" onclick="openFOVModal('${obj.image}', '${obj.id}')">🔭 FOV Preview</button>
          </div>
        </div>
      </div>`;
  });
}

// Filters
function applyFilters() {
  let filtered = [...allCatalogs];
  const catalogFilter = document.getElementById('catalog-filter').value;
  if (catalogFilter !== 'all') {
    filtered = filtered.filter(obj => obj.id.toLowerCase().startsWith(catalogFilter[0]));
  }
  const magLimit = parseFloat(document.getElementById('magnitude-filter').value);
  if (!isNaN(magLimit)) filtered = filtered.filter(obj => obj.mag <= magLimit);
  const searchTerm = document.getElementById('search-box').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(obj =>
      obj.id.toLowerCase().includes(searchTerm) ||
      obj.name.toLowerCase().includes(searchTerm));
  }
  renderResults(filtered);
  renderTopSuggestions(filtered);
}

// Scope settings
function saveScopeSettings() {
  const aperture = document.getElementById('aperture').value;
  const focalLength = document.getElementById('focal-length').value;
  const reducer = document.getElementById('reducer').value || 1;
  const sensor = document.getElementById('sensor').value;
  localStorage.setItem('scopeSettings', JSON.stringify({ aperture, focalLength, reducer, sensor }));
  document.getElementById('scope-confirm').textContent = "✅ Scope settings applied.";
  setTimeout(() => { document.getElementById('scope-confirm').textContent = ""; }, 3000);
}
function loadScopeSettings() {
  const saved = JSON.parse(localStorage.getItem('scopeSettings'));
  if (saved) {
    document.getElementById('aperture').value = saved.aperture || "";
    document.getElementById('focal-length').value = saved.focalLength || "";
    document.getElementById('reducer').value = saved.reducer || 1;
    document.getElementById('sensor').value = saved.sensor || "";
  }
}
function resetScopeSettings() {
  localStorage.removeItem('scopeSettings');
  document.getElementById('aperture').value = "";
  document.getElementById('focal-length').value = "";
  document.getElementById('reducer').value = "";
  document.getElementById('sensor').value = "";
  document.getElementById('scope-confirm').textContent = "🔄 Scope settings reset.";
  setTimeout(() => { document.getElementById('scope-confirm').textContent = ""; }, 3000);
}

// FOV Preview
function openFOVModal(image, id) {
  const canvas = document.getElementById('fov-canvas');
  const ctx = canvas.getContext('2d');
  const saved = JSON.parse(localStorage.getItem('scopeSettings'));
  const img = new Image();
  img.src = image;
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    if (saved && saved.focalLength && saved.sensor) {
      const parts = saved.sensor.toLowerCase().split('x');
      if (parts.length === 2) {
        const sensorW = parseFloat(parts[0]);
        const sensorH = parseFloat(parts[1]);
        const focal = parseFloat(saved.focalLength) * parseFloat(saved.reducer || 1);
        const fovX = (57.3 * sensorW) / focal;
        const fovY = (57.3 * sensorH) / focal;
        const scaleX = canvas.width * (fovX / 5);
        const scaleY = canvas.height * (fovY / 5);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          canvas.width / 2 - scaleX / 2,
          canvas.height / 2 - scaleY / 2,
          scaleX,
          scaleY
        );
        ctx.fillStyle = "yellow";
        ctx.font = "20px Arial";
        ctx.fillText(`${fovX.toFixed(2)}° × ${fovY.toFixed(2)}°`, 20, 30);
      }
    }
  };
  new bootstrap.Modal(document.getElementById('fovModal')).show();
}

// Top 5 Tonight
function renderTopSuggestions(list = allCatalogs) {
  const container = document.getElementById('top-suggestions');
  container.innerHTML = "";

  if (!navigator.geolocation) {
    container.innerHTML = "<p class='text-warning'>Location not available. Showing brightest only.</p>";
    list.sort((a, b) => a.mag - b.mag).slice(0, 5).forEach(obj => {
      container.innerHTML += `
        <div class="col-md-4">
          <div class="card bg-dark text-light h-100 border border-info">
            <img src="${obj.image}" class="thumb card-img-top" alt="${obj.name}"
                 onerror="this.src='images/placeholder.jpg';">
            <div class="card-body"><h6>${obj.id} – ${obj.name}</h6><p>${obj.type}<br>Mag: ${obj.mag}</p></div>
          </div>
        </div>`;
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    const now = new Date();

    let ranked = list.map(obj => {
      if (!obj.ra || !obj.dec) return { ...obj, alt: -90 };
      let alt = radecToAltAz(obj.ra, obj.dec, lat, lon, now);
      return { ...obj, alt };
    });

    ranked = ranked.filter(o => o.alt > 30);
    ranked.sort((a, b) => (a.mag - b.mag) || (b.alt - a.alt));

    ranked.slice(0, 5).forEach(obj => {
      container.innerHTML += `
        <div class="col-md-4">
          <div class="card bg-dark text-light h-100 border border-info">
            <img src="${obj.image}" class="thumb card-img-top" alt="${obj.name}"
                 onerror="this.src='images/placeholder.jpg';">
            <div class="card-body">
              <h6>${obj.id} – ${obj.name}</h6>
              <p>${obj.type}<br>Mag: ${obj.mag}<br>Alt: ${obj.alt.toFixed(1)}°</p>
            </div>
          </div>
        </div>`;
    });

    if (ranked.length === 0) {
      container.innerHTML = "<p class='text-muted'>No targets above 30° right now.</p>";
    }
  });
}

// APOD
async function loadAPOD() {
  const apodBox = document.getElementById('apod-box');
  apodBox.textContent = "Loading APOD...";
  try {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=WJVm2WSCEtWe2Reb4kqDOB69tp5fcy3Z86ZthcS3");
    const data = await res.json();
    apodBox.innerHTML = `<h5>${data.title}</h5>
      <img src="${data.url}" class="img-fluid mb-2" alt="APOD"><p>${data.explanation}</p>`;
  } catch (err) {
    console.error(err);
    apodBox.textContent = "Failed to load APOD.";
  }
}

// ISS
async function loadISS() {
  const issBox = document.getElementById('iss-box');
  issBox.textContent = "Loading ISS transits...";
  if (!navigator.geolocation) {
    issBox.textContent = "Geolocation not supported.";
    return;
  }
  navigator.geolocation.getCurrentPosition(async pos => {
    const lat = pos.coords.latitude.toFixed(2);
    const lon = pos.coords.longitude.toFixed(2);
    const alt = 0;
    const apiKey = "YOUR_N2YO_KEY";
    try {
      const url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/25544/${lat}/${lon}/${alt}/2/300/&apiKey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.passes || data.passes.length === 0) {
        issBox.textContent = "No ISS transits in the next 48h.";
        return;
      }
      issBox.innerHTML = data.passes.map(pass => `
