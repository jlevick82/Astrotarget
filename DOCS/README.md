# 🌌 AstroTarget – Knowledge Base & Project Guide

AstroTarget is a lightweight, offline-capable astronomy planning app that helps astrophotographers and observers find the best targets for the night, based on user location, telescope specs, and current sky conditions.

---

## 📂 1. App Setup

**Core Files**
- `index.html` – main app logic & UI
- `messier.js` – Messier catalog (M1–M110)
- `caldwell.js` – Caldwell catalog (C1–C109)
- `brightngc.js` – Top 100 Bright NGC catalog (unique, no Messier/Caldwell overlap)
- `service-worker.js` – offline caching & version control

**Images**
- `/images/m#.jpg` → Messier thumbnails
- `/images/c#.jpg` → Caldwell thumbnails
- `/images/ngc####.jpg` → Bright NGC thumbnails

---

## 🌠 2. Catalog Data

- **Messier**: 110 entries, local images (M1–M110).
- **Caldwell**: 109 entries, local images (C1–C109).
- **Bright NGC**: ~100 curated entries, only bright/large targets not in Messier or Caldwell.

---

## 🔧 3. Features

- 🔎 **Target Planner** – filters objects by:
  - GPS location
  - Telescope specs (aperture, focal length, FOV)
  - Magnitude, altitude

- 🔍 **Search Box** – works across current or all catalogs

- 📸 **Images**
  - Local thumbnails (`/images/`)
  - Optional offline caching
  - Toggle for FOV-matched previews (Pro mode)

- 📡 **ISS Transit Planner** – embedded tool

- 🌌 **APOD Integration** – NASA Astronomy Picture of the Day

- 🕒 **GPS Clock** – astronomical local time display

- 🌃 **Light Pollution Index** – based on user GPS

- ⚙️ **Settings Page**
  - Telescope/FOV settings
  - Filter toggles
  - Dev limiter (optional)

- 🔄 **Versioning**
  - `changelog.md` tracks updates
  - Service worker enforces version refresh

---

## ⚡ 4. Performance Optimizations

- Lazy-load images (`<img loading="lazy">`)
- Use compressed thumbnails (200–400px wide)
- Pre-filter objects before altitude/magnitude calculation
- Optional "Dev Mode" limiter (render 20–30 objects only)
- Potential **Web Worker** for heavy math

---

## 🖼 5. Resources – Images & Data

**Messier**
- [2MASS Messier Gallery (Public Domain)](https://www.ipac.caltech.edu/2mass/gallery/messiercat.html)

**Caldwell**
- [NASA Hubble Caldwell Catalog](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-caldwell-catalog/)

**Bright NGC**
- [ESO Public Image Archive](https://www.eso.org/public/images/)
- [SDSS Image Gallery](https://www.sdss4.org/science/image-gallery/)
- Amateur astronomy society observing lists

---

## 🚀 6. Next Steps

1. Gather **compressed image packs**:
   - Messier from 2MASS
   - Caldwell from Hubble archive
   - Bright NGC from ESO/SDSS

2. Upload into `/images/`

3. Verify:
   - `messier.js`, `caldwell.js`, `brightngc.js` point to correct image paths
   - Images load and cache properly

4. Test:
   - Lazy loading
   - Offline mode
   - Search & filters

5. Release **AstroTarget v1.0**
   - Messier + Bright NGC fully supported
   - Caldwell optional (user images)

6. Future Upgrades
   - Add Solar System objects
   - Pro mode (advanced filters, FOV previews, larger catalogs)

---

## 📌 Notes

- Messier, Caldwell, and Bright NGC all use **local image filenames** to avoid hotlinking failures.
- Images are **thumbnails only**; full-res can be added via link-out or optional cache.
- All catalogs are **J2000 coordinates**.
