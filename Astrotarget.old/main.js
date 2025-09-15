// === AstroTarget v1.0 Main Logic ===
const VERSION = "v1.0";

// Combine catalogs
const catalogs = {
  Messier: typeof messierCatalog !== "undefined" ? messierCatalog : [],
  Caldwell: typeof caldwellCatalog !== "undefined" ? caldwellCatalog : [],
  BrightNGC: typeof brightNGCCatalog !== "undefined" ? brightNGCCatalog : []
};

let selectedCatalog = localStorage.getItem("lastCatalog") || "Messier";
let currentResults = [];
let currentIndex = 0;
let debugEnabled = false;
let minAltitude = 20;

// Scope defaults
let scope = JSON.parse(localStorage.getItem("scope")) || {
  focalLength: 400,
  sensorWidth: 11,
  sensorHeight: 11
};

// RA/Dec → Alt/Az
function raDecToAltAz(raHours, decDeg, latDeg, lonDeg, date) {
  let raDeg = raHours * 15;
  let latRad = (latDeg * Math.PI) / 180;
  let decRad = (decDeg * Math.PI) / 180;

  const JD = (date / 86400000) + 2440587.5;
  const d = JD - 2451545.0;
  let GMST = 280.46061837 + 360.98564736629 * d;
  let LST = (GMST + lonDeg) % 360;
  if (LST < 0) LST += 360;
  let H = (LST - raDeg) * (Math.PI / 180);

  let alt = Math.asin(
    Math.sin(latRad) * Math.sin(decRad) +
    Math.cos(latRad) * Math.cos(decRad) * Math.cos(H)
  );
  let az = Math.atan2(
    -Math.sin(H),
    Math.tan(decRad) * Math.cos(latRad) - Math.sin(latRad) * Math.cos(H)
  );
  return { alt: (alt * 180) / Math.PI, az: ((az * 180) / Math.PI + 360) % 360 };
}

// Debug
function logDebug(msg) {
  console.log(msg);
  if (debugEnabled) {
    const panel = document.getElementById("debugMessages");
    const line = document.createElement("div");
    line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    panel.appendChild(line);
    panel.scrollTop = panel.scrollHeight;
  }
}

// Timestamp
function updateTimestamp() {
  document.getElementById("lastUpdated").innerText =
    "Last updated: " + new Date().toLocaleString();
}

// Spinner
function showSpinner() {
  document.getElementById("loadingSpinner").classList.remove("hidden");
  document.getElementById("emptyState").classList.add("hidden");
  document.getElementById("results").innerHTML = "";
}
function hideSpinner() {
  document.getElementById("loadingSpinner").classList.add("hidden");
}
function showEmptyState() {
  hideSpinner();
  document.getElementById("emptyState").classList.remove("hidden");
}

// Render results
function renderResults(results) {
  hideSpinner();
  let container = document.getElementById("results");
  container.innerHTML = "";
  if (results.length === 0) {
    showEmptyState();
    return;
  }
  document.getElementById("emptyState").classList.add("hidden");
  currentResults = results;

  results.forEach((obj, i) => {
    let card = document.createElement("div");
    card.className = "result-card";
    let imgSrc = obj.image && obj.image.length > 0 ? obj.image : "images/full/placeholder.jpg";
    let fovX = (57.3 * scope.sensorWidth / scope.focalLength).toFixed(2);
    let fovY = (57.3 * scope.sensorHeight / scope.focalLength).toFixed(2);

    card.innerHTML = `
      <img src="${imgSrc}" alt="${obj.name}" onerror="this.src='images/full/placeholder.jpg'">
      <h3>${obj.id} — ${obj.name}</h3>
      <p><strong>Type:</strong> ${obj.type}</p>
      <p><strong>Mag:</strong> ${obj.mag}</p>
      <p><strong>Size:</strong> ${obj.size}</p>
      <p><strong>Scope FOV:</strong> ${fovX}° × ${fovY}°</p>
      <p>${obj.desc}</p>`;
    if (obj.topPick) card.classList.add("top-pick");
    card.addEventListener("click", () => openModal(i, results));
    container.appendChild(card);
  });
// Modal
function openModal(index, results) {
  currentIndex = index;
  let obj = results[index];
  let imgSrc = obj.image && obj.image.length > 0 ? obj.image : "images/full/placeholder.jpg";
  document.getElementById("modalImage").src = imgSrc;
  document.getElementById("modalTitle").innerText = `${obj.id} — ${obj.name}`;
  document.getElementById("modalType").innerText = `Type: ${obj.type}`;
  document.getElementById("modalMag").innerText = `Magnitude: ${obj.mag}`;
  document.getElementById("modalSize").innerText = `Size: ${obj.size}`;
  document.getElementById("modalDesc").innerText = obj.desc;
  document.getElementById("objectModal").style.display = "flex";
}
function showNext() { currentIndex = (currentIndex + 1) % currentResults.length; openModal(currentIndex, currentResults); }
function showPrev() { currentIndex = (currentIndex - 1 + currentResults.length) % currentResults.length; openModal(currentIndex, currentResults); }

// Catalogs
function setCatalog(name) {
  selectedCatalog = name;
  localStorage.setItem("lastCatalog", name);
  document.getElementById("catalogName").innerText = name;
  showSpinner();
  setTimeout(() => {
    let list = (name === "All") ? [].concat(...Object.values(catalogs)) : catalogs[name];
    renderResults(list);
    updateTimestamp();
    trackUsage(name);
  }, 300);
}

// Search
function searchObjects(query) {
  showSpinner();
  let q = query.toLowerCase();
  let results = [];
  Object.keys(catalogs).forEach(cat => {
    results = results.concat(catalogs[cat].filter(
      obj => obj.id.toLowerCase().includes(q) || obj.name.toLowerCase().includes(q)
    ));
  });
  setTimeout(() => { renderResults(results); updateTimestamp(); trackUsage("Search"); }, 300);
}

// Top 5 Tonight
function top5Tonight() {
  showSpinner();
  getUserLocation((lat, lon, alt) => {
    let now = new Date(), visible = [];
    let all = selectedCatalog === "All" ? [].concat(...Object.values(catalogs)) : catalogs[selectedCatalog];
    try {
      all.forEach(obj => {
        let pos = raDecToAltAz(obj.ra, obj.dec, lat, lon, now);
        if (pos.alt > minAltitude) visible.push({ ...obj, alt: pos.alt });
      });
      visible.sort((a, b) => b.alt - a.alt);
      renderResults(visible.slice(0, 5).map(o => ({ ...o, topPick: true })));
    } catch (err) {
      logDebug("❌ Top 5 error: " + err.message);
    }
    updateTimestamp();
  });
}

// GPS
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => callback(pos.coords.latitude, pos.coords.longitude, pos.coords.altitude),
      err => { logDebug("❌ GPS error: " + err.message); callback(0, 0, null); }
    );
  } else callback(0, 0, null);
}
function updateClock(lat, lon, alt = null) {
  let now = new Date();
  document.getElementById("utcTime").innerText = now.toUTCString().split(" ")[4];
  document.getElementById("localTime").innerText = now.toLocaleTimeString();
  document.getElementById("gpsLocation").innerText =
    (lat || lon) ? `📍 ${lat.toFixed(2)}°, ${lon.toFixed(2)}° (Elev: ${alt ? alt.toFixed(0) + "m" : "?"})`
                 : "📍 Location unavailable";
}

// APOD
async function fetchAPOD() {
  const apodContent = document.getElementById("apodContent");
  apodContent.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY");
    if (!res.ok) throw new Error("Fetch failed");
    const data = await res.json();
    apodContent.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.date}</p>
      ${data.media_type === "image"
        ? `<img src="${data.url}" alt="${data.title}" style="max-width:100%;border-radius:6px;">`
        : `<iframe src="${data.url}" width="100%" height="400"></iframe>`}
      <p>${data.explanation}</p>
      <p><em>© ${data.copyright || "NASA"}</em></p>`;
    trackUsage("APOD");
  } catch (err) {
    logDebug("❌ APOD error: " + err.message);
    apodContent.innerHTML =
      "<p>⚠️ APOD unavailable. Try again later or use your own API key.</p>";
  }
}

// Usage stats
function trackUsage(feature) {
  let stats = JSON.parse(localStorage.getItem("usageStats")) || {};
  stats[feature] = (stats[feature] || 0) + 1;
  localStorage.setItem("usageStats", JSON.stringify(stats));
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  // Version
  document.getElementById("appVersion").innerText = VERSION;
  document.getElementById("footerVersion").innerText = VERSION;

  // Catalog + Search
  document.getElementById("catalogSelect").value = selectedCatalog;
  document.getElementById("catalogSelect").addEventListener("change", e => setCatalog(e.target.value));
  document.getElementById("searchBox").addEventListener("input", e => searchObjects(e.target.value));
  document.getElementById("topTonightBtn").addEventListener("click", top5Tonight);
  document.getElementById("apodBtn").addEventListener("click", fetchAPOD);

  // Scope
  document.getElementById("scopeFocal").value = scope.focalLength;
  document.getElementById("sensorWidth").value = scope.sensorWidth;
  document.getElementById("sensorHeight").value = scope.sensorHeight;
  document.getElementById("saveScopeBtn").addEventListener("click", () => {
    const f = parseFloat(document.getElementById("scopeFocal").value);
    const w = parseFloat(document.getElementById("sensorWidth").value);
    const h = parseFloat(document.getElementById("sensorHeight").value);
    if (!isNaN(f) && !isNaN(w) && !isNaN(h)) {
      scope = { focalLength: f, sensorWidth: w, sensorHeight: h };
      localStorage.setItem("scope", JSON.stringify(scope));
      alert("🔭 Scope settings updated!");
    }
  });

  // GPS clock
  setInterval(() => updateClock(window.userLat, window.userLon, window.userAlt), 1000);
  getUserLocation((lat, lon, alt) => {
    window.userLat = lat; window.userLon = lon; window.userAlt = alt;
    updateClock(lat, lon, alt);
  });
  document.getElementById("syncBtn").addEventListener("click", () =>
    getUserLocation((lat, lon, alt) => {
      window.userLat = lat; window.userLon = lon; window.userAlt = alt;
      updateClock(lat, lon, alt);
      alert("✅ Location synced.");
    })
  );

  // Advanced settings
  const toggleSettingsBtn = document.getElementById("toggleSettingsBtn");
  const advancedSettings = document.getElementById("advancedSettings");
  toggleSettingsBtn.addEventListener("click", () => {
    advancedSettings.classList.toggle("hidden");
    toggleSettingsBtn.innerText = advancedSettings.classList.contains("hidden")
      ? "Show Advanced Settings ▼"
      : "Hide Advanced Settings ▲";
  });

  // Cache settings
  const cacheToggle = document.getElementById("cacheToggle");
  const cacheStatus = document.getElementById("cacheStatus");
  const clearCacheBtn = document.getElementById("clearCacheBtn");
  function updateCacheStatus() {
    if (cacheToggle.checked) {
      cacheStatus.innerText = "✅ Images cached for offline use";
      cacheStatus.className = "status-text cached";
      clearCacheBtn.classList.remove("hidden");
    } else {
      cacheStatus.innerText = "🌐 Online-only (images load when needed)";
      cacheStatus.className = "status-text online-only";
      clearCacheBtn.classList.add("hidden");
    }
  }
  cacheToggle.checked = localStorage.getItem("cacheImages") === "true";
  updateCacheStatus();
  cacheToggle.addEventListener("change", () => {
    localStorage.setItem("cacheImages", cacheToggle.checked);
    updateCacheStatus();
  });
  clearCacheBtn.addEventListener("click", async () => {
    if (confirm("Clear all cached images?")) {
      const names = await caches.keys();
      for (const n of names) await caches.delete(n);
      alert("🗑️ Cache cleared.");
    }
  });

  // Red mode
  const redModeToggle = document.getElementById("redModeToggle");
  let redModeEnabled = localStorage.getItem("redMode") === "true";
  if (redModeEnabled) document.body.classList.add("red-mode");
  redModeToggle.checked = redModeEnabled;
  redModeToggle.addEventListener("change", () => {
    if (redModeToggle.checked) {
      document.body.classList.add("red-mode");
      localStorage.setItem("redMode", "true");
    } else {
      document.body.classList.remove("red-mode");
      localStorage.setItem("redMode", "false");
    }
  });

  // Altitude slider
  const altSlider = document.getElementById("altSlider");
  const altValue = document.getElementById("altValue");
  minAltitude = localStorage.getItem("minAltitude") || 20;
  altSlider.value = minAltitude;
  altValue.innerText = `${minAltitude}°`;
  altSlider.addEventListener("input", () => {
    minAltitude = altSlider.value;
    altValue.innerText = `${minAltitude}°`;
    localStorage.setItem("minAltitude", minAltitude);
  });

  // Debug
  const debugToggle = document.getElementById("debugToggle");
  const debugPanel = document.getElementById("debugPanel");
  const clearDebugBtn = document.getElementById("clearDebugBtn");
  debugEnabled = localStorage.getItem("debugEnabled") === "true";
  debugToggle.checked = debugEnabled;
  if (debugEnabled) debugPanel.classList.remove("hidden");
  debugToggle.addEventListener("change", () => {
    debugEnabled = debugToggle.checked;
    localStorage.setItem("debugEnabled", debugEnabled);
    if (debugEnabled) {
      debugPanel.classList.remove("hidden");
      logDebug("✅ Debug enabled");
    } else {
      debugPanel.classList.add("hidden");
    }
  });
  clearDebugBtn.addEventListener("click", () => {
    document.getElementById("debugMessages").innerHTML = "";
    logDebug("🗑️ Debug log cleared");
  });

  // Init
  setCatalog(selectedCatalog);
});

}
