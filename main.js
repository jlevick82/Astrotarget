let allCatalogs = [...messierCatalog, ...caldwellCatalog, ...brightNGCCatalog];

// Results
function renderResults(objects) {
  const results = document.getElementById('results');
  results.innerHTML = '';
  if (objects.length === 0) {
    results.innerHTML = `<p class="text-center text-muted">No objects match your filters.</p>`;
    return;
  }
  objects.forEach(obj => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card bg-secondary text-light h-100">
        <img src="${obj.image}" class="thumb card-img-top" alt="${obj.name}"
             loading="lazy" onerror="this.src='images/placeholder.jpg';">
        <div class="card-body">
          <h5 class="card-title">${obj.id} – ${obj.name}</h5>
          <p class="card-text">${obj.type}<br>Mag: ${obj.mag} | Size: ${obj.size}</p>
          <button class="btn btn-outline-light btn-sm" onclick="openFOVModal('${obj.image}', '${obj.id}')">🔭 FOV Preview</button>
        </div>
      </div>`;
    results.appendChild(col);
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
  const altLimit = parseFloat(document.getElementById('altitude-filter').value);
  if (!isNaN(altLimit)) console.warn("Altitude filter placeholder – sky math coming v1.1+");
  const searchTerm = document.getElementById('search-box').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(obj =>
      obj.id.toLowerCase().includes(searchTerm) ||
      obj.name.toLowerCase().includes(searchTerm));
  }
  renderResults(filtered);
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
        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        ctx.strokeRect(
          canvas.width / 2 - (fovX * 10),
          canvas.height / 2 - (fovY * 10),
          fovX * 20,
          fovY * 20
        );
        ctx.fillStyle = "yellow";
        ctx.font = "20px Arial";
        ctx.fillText(`${fovX.toFixed(2)}° × ${fovY.toFixed(2)}°`, 20, 30);
      }
    }
  };
  new bootstrap.Modal(document.getElementById('fovModal')).show();
}

// Top Suggestions
function renderTopSuggestions() {
  const container = document.getElementById('top-suggestions');
  container.innerHTML = "";
  let ranked = [...allCatalogs];
  ranked.sort((a, b) => a.mag - b.mag);
  let top = ranked.slice(0, 6);
  top.forEach(obj => {
    const col = document.createElement('div');
    col.className = 'col-md-4';
    col.innerHTML = `
      <div class="card bg-dark text-light h-100 border border-info">
        <img src="${obj.image}" class="thumb card-img-top" alt="${obj.name}" onerror="this.src='images/placeholder.jpg';">
        <div class="card-body">
          <h6>${obj.id} – ${obj.name}</h6>
          <p>${obj.type}<br>Mag: ${obj.mag}</p>
        </div>
      </div>`;
    container.appendChild(col);
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
      <img src="${data.url}" class="img-fluid mb-2" alt="APOD">
      <p>${data.explanation}</p>`;
  } catch (err) {
    console.error(err);
    apodBox.textContent = "Failed to load APOD.";
  }
}

// ISS (N2YO API)
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
    const apiKey = "DEMO_KEY"; // replace with your N2YO key
    try {
      const url = `https://api.n2yo.com/rest/v1/satellite/visualpasses/25544/${lat}/${lon}/${alt}/2/300/&apiKey=${apiKey}`;
      const res = await fetch(url);
      const data = await res.json();
      if (!data.passes || data.passes.length === 0) {
        issBox.textContent = "No ISS transits in the next 48h.";
        return;
      }
      issBox.innerHTML = data.passes.map(pass => `
        <div class="card bg-secondary text-light p-2 mb-2">
          <strong>${new Date(pass.startUTC * 1000).toUTCString()}</strong><br>
          Duration: ${pass.duration} sec<br>
          Max Elevation: ${pass.maxEl}°<br>
          Mag: ${pass.mag}
        </div>`).join("");
    } catch (err) {
      console.error(err);
      issBox.textContent = "Failed to load ISS data.";
    }
  }, () => { issBox.textContent = "Location permission denied."; });
}

// Init
document.getElementById('catalog-filter').addEventListener('change', applyFilters);
document.getElementById('magnitude-filter').addEventListener('input', applyFilters);
document.getElementById('altitude-filter').addEventListener('input', applyFilters);
document.getElementById('search-box').addEventListener('input', applyFilters);
document.addEventListener('DOMContentLoaded', () => {
  loadScopeSettings();
  applyFilters();
  renderTopSuggestions();
  loadAPOD();
  loadISS();
});
