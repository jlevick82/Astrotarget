// ===========================
// AstroTarget v1.0 Main Script
// ===========================

// Combine catalogs
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
      obj.id.toLowerCase().startsWith(catalogFilter[0]) // m, c, ngc
    );
  }

  // Magnitude filter
  const magLimit = parseFloat(document.getElementById('magnitude-filter').value);
  if (!isNaN(magLimit)) {
    filtered = filtered.filter(obj => obj.mag <= magLimit);
  }

  // Altitude filter (placeholder, real calc v1.1+)
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
// Event Listeners
// ===========================
document.getElementById('catalog-filter').addEventListener('change', applyFilters);
document.getElementById('magnitude-filter').addEventListener('input', applyFilters);
document.getElementById('altitude-filter').addEventListener('input', applyFilters);
document.getElementById('search-box').addEventListener('input', applyFilters);

// ===========================
// Astronomy Picture of the Day
// ===========================
async function loadAPOD() {
  try {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY");
    const data = await res.json();
    document.getElementById('apod').innerHTML = `
      <h5>${data.title}</h5>
      <img src="${data.url}" class="img-fluid mb-2" alt="APOD">
      <p>${data.explanation}</p>
    `;
  } catch (err) {
    document.getElementById('apod').textContent = "Failed to load APOD.";
  }
}

// ===========================
// Init
// ===========================
document.addEventListener('DOMContentLoaded', () => {
  applyFilters(); // initial render
  loadAPOD();
});
