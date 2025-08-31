// === AstroTarget v1.0 Main Logic ===

// Combine catalogs (ensure each file defines messierCatalog, caldwellCatalog, brightNGCCatalog)
const catalogs = {
  Messier: typeof messierCatalog !== "undefined" ? messierCatalog : [],
  Caldwell: typeof caldwellCatalog !== "undefined" ? caldwellCatalog : [],
  BrightNGC: typeof brightNGCCatalog !== "undefined" ? brightNGCCatalog : []
};

let selectedCatalog = "Messier";
let currentResults = [];
let currentIndex = 0;
let debugEnabled = false;
let minAltitude = 20;

// Scope defaults (restored from localStorage if set)
let scope = JSON.parse(localStorage.getItem("scope")) || {
  focalLength: 400,
  sensorWidth: 11,
  sensorHeight: 11
};

// === Debug Logger ===
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

// === Timestamp ===
function updateTimestamp() {
  const now = new Date();
  document.getElementById("lastUpdated").innerText =
    "Last updated: " + now.toLocaleString();
}

// === Spinner + Empty State ===
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

// === Render Results ===
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
    card.style.position = "relative";
    let imgSrc =
      obj.image && obj.image.length > 0
        ? obj.image
        : "images/full/placeholder.jpg";

    // FOV calculation (basic, degrees per side)
    let fovX = (57.3 * scope.sensorWidth / scope.focalLength).toFixed(2);
    let fovY = (57.3 * scope.sensorHeight / scope.focalLength).toFixed(2);

    card.innerHTML = `
      <img src="${imgSrc}" alt="${obj.name}" onerror="this.src='images/full/placeholder.jpg'">
      <h3>${obj.id} — ${obj.name}</h3>
      <p><strong>Type:</strong> ${obj.type}</p>
      <p><strong>Mag:</strong> ${obj.mag}</p>
      <p><strong>Size:</strong> ${obj.size}</p>
      <p><strong>Scope FOV:</strong> ${fovX}° × ${fovY}°</p>
      <p>${obj.desc}</p>
    `;

    if (obj.topPick) card.classList.add("top-pick");
    card.addEventListener("click", () => openModal(i, results));
    container.appendChild(card);
  });
}

// === Modal ===
function openModal(index, results) {
  currentIndex = index;
  let obj = results[index];
  let imgSrc =
    obj.image && obj.image.length > 0
      ? obj.image
      : "images/full/placeholder.jpg";

  document.getElementById("modalImage").src = imgSrc;
  document.getElementById("modalTitle").innerText = `${obj.id} — ${obj.name}`;
  document.getElementById("modalType").innerText = `Type: ${obj.type}`;
  document.getElementById("modalMag").innerText = `Magnitude: ${obj.mag}`;
  document.getElementById("modalSize").innerText = `Size: ${obj.size}`;
  document.getElementById("modalDesc").innerText = obj.desc;

  document.getElementById("objectModal").style.display = "flex";
}
function showNext() {
  currentIndex = (currentIndex + 1) % currentResults.length;
  openModal(currentIndex, currentResults);
}
function showPrev() {
  currentIndex =
    (currentIndex - 1 + currentResults.length) % currentResults.length;
  openModal(currentIndex, currentResults);
}

// === Catalog Handling ===
function setCatalog(name) {
  selectedCatalog = name;
  document.getElementById("catalogName").innerText = name;
  showSpinner();
  setTimeout(() => {
    if (name === "All") {
      let combined = [];
      Object.values(catalogs).forEach(
        cat => (combined = combined.concat(cat))
      );
      renderResults(combined);
      updateTimestamp();
      trackUsage("All Catalogs");
      return;
    }
    renderResults(catalogs[name]);
    updateTimestamp();
    trackUsage("Catalog Switch");
  }, 300);
}

// === Search ===
function searchObjects(query) {
  showSpinner();
  let q = query.toLowerCase();
  let results = [];
  Object.keys(catalogs).forEach(cat => {
    results = results.concat(
      catalogs[cat].filter(
        obj =>
          obj.id.toLowerCase().includes(q) ||
          obj.name.toLowerCase().includes(q)
      )
    );
  });
  setTimeout(() => {
    renderResults(results);
    updateTimestamp();
    trackUsage("Search");
  }, 300);
}

// === Top 5 Tonight ===
function top5Tonight() {
  showSpinner();
  getUserLocation((lat, lon) => {
    let now = new Date();
    let visible = [];
    let all =
      selectedCatalog === "All"
        ? [].concat(...Object.values(catalogs))
        : catalogs[selectedCatalog];

    if (lat === 0 && lon === 0) {
      logDebug("⚠️ Using default location (0°,0°). Results may be inaccurate.");
      document.getElementById("results").innerHTML =
        `<p>⚠️ Using default location (0°,0°). Results may be inaccurate.</p>`;
    }

    try {
      all.forEach(obj => {
        let pos = raDecToAltAz(obj.ra, obj.dec, lat, lon, now);
        if (pos.alt > minAltitude) visible.push({ ...obj, alt: pos.alt });
      });
      visible.sort((a, b) => b.alt - a.alt);
      setTimeout(() => {
        renderResults(
          visible.slice(0, 5).map(o => ({ ...o, topPick: true }))
        );
        updateTimestamp();
        trackUsage("Top 5 Tonight");
      }, 500);
    } catch (err) {
      logDebug("❌ Error calculating Top 5 Tonight: " + err.message);
      document.getElementById("results").innerHTML =
        `<p>⚠️ Unable to calculate Top 5 Tonight. Try again later.</p>`;
    }
  });
}

// === GPS + Clock ===
function getUserLocation(callback) {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => callback(pos.coords.latitude, pos.coords.longitude),
      err => {
        logDebug("❌ Geolocation error: " + err.message);
        document.getElementById("gpsLocation").innerText =
          "📍 Location unavailable (using default 0°, 0°)";
        callback(0, 0);
      }
    );
  } else {
    logDebug("❌ Geolocation not supported by this browser.");
    document.getElementById("gpsLocation").innerText =
      "📍 GPS not supported (using default 0°, 0°)";
    callback(0, 0);
  }
}
function updateClock(lat, lon) {
  const now = new Date();
  document.getElementById("utcTime").innerText =
    now.toUTCString().split(" ")[4];
  document.getElementById("localTime").innerText = now.toLocaleTimeString();
  if (lat && lon && (lat !== 0 || lon !== 0)) {
    document.getElementById(
      "gpsLocation"
    ).innerText = `📍 Location: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
  } else {
    document.getElementById("gpsLocation").innerText =
      "📍 Location unavailable (using default 0°, 0°)";
  }
}

// === Scope Settings ===
function updateScope() {
  const f = parseFloat(document.getElementById("scopeFocal").value);
  const w = parseFloat(document.getElementById("sensorWidth").value);
  const h = parseFloat(document.getElementById("sensorHeight").value);
  if (!isNaN(f) && !isNaN(w) && !isNaN(h)) {
    scope = { focalLength: f, sensorWidth: w, sensorHeight: h };
    localStorage.setItem("scope", JSON.stringify(scope));
    alert("🔭 Scope settings updated!");
  }
}

// === APOD Fetch ===
async function fetchAPOD() {
  logDebug("🌌 Fetching APOD...");
  const apodSection = document.getElementById("apodSection");
  const apodContent = document.getElementById("apodContent");
  apodSection.classList.remove("hidden");
  apodContent.innerHTML = "<p>Loading APOD...</p>";

  try {
    const res = await fetch(
      "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY"
    );
    if (!res.ok) throw new Error("APOD fetch failed: " + res.status);
    const data = await res.json();

    apodContent.innerHTML = `
      <h3>${data.title}</h3>
      <p>${data.date}</p>
      ${data.media_type === "image"
        ? `<img src="${data.url}" alt="${data.title}" style="max-width:100%;border-radius:6px;">`
        : `<iframe src="${data.url}" width="100%" height="400"></iframe>`}
      <p>${data.explanation}</p>
      <p><em>© ${data.copyright || "NASA"}</em></p>
    `;
    trackUsage("APOD");
  } catch (err) {
    logDebug("❌ APOD error: " + err.message);
    apodContent.innerHTML =
      "<p>⚠️ Failed to load APOD. Please try again later.</p>";
  }
}

// === Usage Tracking ===
function trackUsage(feature) {
  let stats = JSON.parse(localStorage.getItem("usageStats")) || {};
  stats[feature] = (stats[feature] || 0) + 1;
  localStorage.setItem("usageStats", JSON.stringify(stats));
  logDebug(`📊 Usage tracked: ${feature}`);
}

// === Init ===
document.addEventListener("DOMContentLoaded", () => {
  // Catalog switch
  document
    .getElementById("catalogSelect")
    .addEventListener("change", e => setCatalog(e.target.value));
  // Search
  document
    .getElementById("searchBox")
    .addEventListener("input", e => searchObjects(e.target.value));
  // Top 5
  document
    .getElementById("topTonightBtn")
    .addEventListener("click", top5Tonight);
  // APOD
  document
    .getElementById("apodBtn")
    .addEventListener("click", fetchAPOD);

  // Modal controls
  const modal = document.getElementById("objectModal");
  const closeBtn = document.querySelector(".close-btn");
  const leftBtn = document.querySelector(".left-btn");
  const rightBtn = document.querySelector(".right-btn");
  const fullscreenBtn = document.querySelector(".fullscreen-btn");
  const modalImage = document.getElementById("modalImage");

  closeBtn.onclick = () => (modal.style.display = "none");
  leftBtn.onclick = () => showPrev();
  rightBtn.onclick = () => showNext();
  fullscreenBtn.onclick = () => {
    if (modalImage.requestFullscreen) modalImage.requestFullscreen();
    else if (modalImage.webkitRequestFullscreen)
      modalImage.webkitRequestFullscreen();
  };
  window.onclick = e => {
    if (e.target === modal) modal.style.display = "none";
  };

  // Keyboard nav
  window.addEventListener("keydown", e => {
    if (modal.style.display === "flex") {
      if (e.key === "ArrowRight") showNext();
      else if (e.key === "ArrowLeft") showPrev();
      else if (e.key === "Escape") modal.style.display = "none";
    }
  });
  // Swipe nav
  let touchStartX = 0,
    touchEndX = 0;
  modal.addEventListener(
    "touchstart",
    e => (touchStartX = e.changedTouches[0].screenX)
  );
  modal.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    if (Math.abs(touchEndX - touchStartX) > 50) {
      touchEndX > touchStartX ? showPrev() : showNext();
    }
  });

  // GPS Clock
  setInterval(() => {
    if (window.userLat && window.userLon)
      updateClock(window.userLat, window.userLon);
    else updateClock();
  }, 1000);
  getUserLocation((lat, lon) => {
    window.userLat = lat;
    window.userLon = lon;
    updateClock(lat, lon);
  });
  document
    .getElementById("syncBtn")
    .addEventListener("click", () =>
      getUserLocation((lat, lon) => {
        window.userLat = lat;
        window.userLon = lon;
        updateClock(lat, lon);
        alert("✅ Location synced successfully.");
      })
    );

  // Toggle advanced settings
  const toggleSettingsBtn = document.getElementById("toggleSettingsBtn");
  const advancedSettings = document.getElementById("advancedSettings");
  toggleSettingsBtn.addEventListener("click", () => {
    advancedSettings.classList.toggle("hidden");
    toggleSettingsBtn.innerText = advancedSettings.classList.contains("hidden")
      ? "Show Advanced Settings ▼"
      : "Hide Advanced Settings ▲";
  });

  // Cache toggle
  const cacheToggle = document.getElementById("cacheToggle");
  const cacheStatus = document.getElementById("cacheStatus");
  const clearCacheBtn = document.getElementById("clearCacheBtn");
  function updateCacheStatus() {
    if (cacheToggle.checked) {
      cacheStatus.innerText = "✅ Images cached for offline use";
      cacheStatus.className = "status-text cached";
      clearCacheBtn.classList.remove("hidden");
    } else {
      cacheStatus.innerText =
        "🌐 Online-only mode (images load when needed)";
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

  // Red Light Mode
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

  // Debug panel
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

  // Init first catalog
  setCatalog("Messier");
});
