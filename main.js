// ===========================
// AstroTarget v1.0 Main Script
// ===========================

// Merge catalogs
let allCatalogs = [...messierCatalog, ...caldwellCatalog, ...brightNGCCatalog];

// ===========================
// Render Results
// ===========================
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
          <p class="card-text">${obj.type}<br>
            Mag: ${obj.mag} | Size: ${obj.size}
          </p>
          <button class="btn btn-outline-light btn-sm" onclick="openFOVModal('${obj.image}')">🔭 FOV Preview</button>
        </div>
      </div>
    `;
    results.appendChild(col);
  });
}

// ===========================
// Filters
// ===========================
function applyFilters() {
  let filtered = [...allCatalogs];

  // Catalog filter
  const catalogFilter = document.getElementById('catalog-filter').value;
  if (catalogFilter !== 'all') {
    filtered = filtered.filter(obj =>
      obj.id.toLowerCase().startsWith(catalogFilter[0]) // m, c, n
    );
  }

  // Magnitude filter
  const magLimit = parseFloat(document.getElementById('magnitude-filter').value);
  if (!isNaN(magLimit)) {
    filtered = filtered.filter(obj => obj.mag <= magLimit);
  }

  // Altitude filter placeholder
  const altLimit = parseFloat(document.getElementById('altitude-filter').value);
  if (!isNaN(altLimit)) {
    console.warn("Altitude filter placeholder – needs real sky calc v1.1+");
  }

  // Search filter
  const searchTerm = document.getElementById('search-box').value.toLowerCase();
  if (searchTerm) {
    filtered = filtered.filter(obj =>
      obj.id.toLowerCase().includes(searchTerm) ||
      obj.name.toLowerCase().includes(searchTerm)
    );
  }

  renderResults(filtered);
}

// ===========================
// FOV Modal
// ===========================
function openFOVModal(image) {
  document.getElementById('fov-image').src = image;
  const modal = new bootstrap.Modal(document.getElementById('fovModal'));
  modal.show();
}

// ===========================
// APOD (NASA API)
// ===========================
async function loadAPOD() {
  const apodBox = document.getElementById('apod-box');
  apodBox.textContent = "Loading APOD...";

  try {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY");
    const data = await res.json();
    apodBox.innerHTML = `
      <h5>${data.title}</h5>
      <img src="${data.url}" class="img-fluid mb-2" alt="APOD">
      <p>${data.explanation}</p>
    `;
  } catch (err) {
    console.error(err);
    apodBox.textContent = "Failed to load APOD.";
  }
}

// ===========================
// ISS Passes (N2YO API)
// ===========================
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
    const alt = 0; // assume sea level for now
    const apiKey = "DEMO_KEY"; // 🔑 replace with your N2YO API key

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
        </div>
      `).join("");
    } catch (err) {
      console.error(err);
      issBox.textContent = "Failed to load ISS data.";
    }
  }, () => {
    issBox.textContent = "Location permission denied.";
  });
}

// ===========================
// Event Listeners
// ===========================
document.getElementById('catalog-filter').addEventListener('change', applyFilters);
document.getElementById('magnitude-filter').addEventListener('input', applyFilters);
document.getElementById('altitude-filter').addEventListener('input', applyFilters);
document.getElementById('search-box').addEventListener('input', applyFilters);

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  applyFilters();   // Catalogs tab
  loadAPOD();       // APOD tab
  loadISS();        // ISS tab
});
