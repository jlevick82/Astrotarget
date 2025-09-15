# 📂 AstroTarget v1.0 – File Map

This document lists all files in the project, their purpose, and current status.  
Keeps track of what’s included in v1.0 Core.

---

## ⚙️ Core Files
- **index.html** → Main app structure (navbar, filters, results grid, APOD, ISS, FOV modal).
- **style.css** → Dark theme, cards, thumbnails, modal, APOD styles.
- **main.js** → Catalog rendering, filters, search, FOV modal, APOD fetch.
- **service-worker.js** → Offline caching (HTML, CSS, JS, images, Bootstrap).
- **manifest.json** → (optional, for PWA install) → define app name, icon, theme color.

---

## 🌌 Catalogs
- **messier.js** → Full Messier catalog (M1 → M110), hi-res images only (`/images/full/mXX.jpg`).
- **caldwell.js** → Caldwell catalog (C1 → C109), hi-res images only (`/images/full/cXX.jpg`).
- **brightngc.js** → Brightest NGC subset (~100 objects), hi-res images only (`/images/full/ngc###.jpg`).

---

## 🖼 Images
- **/images/full/** → Hi-res images for all catalogs.
  - Naming convention:  
    - Messier → `m1.jpg` … `m110.jpg`  
    - Caldwell → `c1.jpg` … `c109.jpg`  
    - NGC → `ngc###.jpg`  
- **/images/placeholder.jpg** → Fallback if object image missing.

---

## 📑 Docs
- **Master Roadmap.md** → Full roadmap v1.0 → v2.0.
- **Risks & Challenges.md** → Key risks and mitigations.
- **Architecture.md** → High-level system flow (Mermaid diagram).
- **Docs Index.md** → Table of contents for all docs.
- **Where We Left Off.md** → Current progress + next steps.
- **v1.0 Checklist.md** → To-do list before release.

---

## ✅ Status Summary
- ✅ **index.html** → Updated to v1.0 spec.
- ✅ **main.js** → Core filters, search, APOD, FOV modal.
- ✅ **style.css** → Clean dark UI + cards.
- ✅ **service-worker.js** → Offline ready.
- ✅ **messier.js** → Complete.
- ⬜ **caldwell.js** → Pending full update.
- ⬜ **brightngc.js** → Pending full update.
- ⬜ **/images/full/** → Needs population with hi-res files.
- ✅ **Docs** → Roadmap, checklist, and planning in place.

---

# 🚀 Next Step
- Finish **Caldwell.js** + **BrightNGC.js** in the new format.
- Collect/upload hi-res images to `/images/full/`.
- Test all filters and offline mode.
- Tag release → **v1.0.0**.
