# 🌌 AstroTarget – Changelog

All notable changes to **AstroTarget** will be documented here.  
This project follows **semantic versioning**:  
`MAJOR.MINOR.PATCH` → (Breaking / Features / Fixes)

---

## [1.0.0] – 2025-08-28
✨ Initial Release (Stable v1.0)

### Added
- Messier Catalog (M1–M110) with local images
- Caldwell Catalog (C1–C109) with local images
- Bright NGC Catalog (Top 100, curated unique list)
- Target Planner with filters (altitude, magnitude, catalog)
- Object cards with:
  - Name, Type, Mag, Size
  - Local thumbnail image (lazy-loaded, fallback support)
- Search box across catalogs
- Settings page with confirmation toast
- Astronomy Picture of the Day (APOD) integration
- ISS Transit Planner integration
- GPS Clock display
- Light Pollution Index (placeholder)
- Offline support via Service Worker
- Version number in footer
- Documentation (`/docs/README.md`)

---

## [0.9.0-beta] – 2025-08
🧪 Development builds

- Catalog parsing (Messier, Caldwell, Bright NGC)
- Initial filtering logic
- Prototype UI and result cards
- Early offline caching tests

---

## Planned (Next Versions)
- [ ] Solar System objects (planets, comets, asteroids, ISS tracking)
- [ ] Pro Mode (advanced filters, FOV-matched previews)
- [ ] Improved Light Pollution index (API-based)
- [ ] Full-resolution image viewer
- [ ] User settings persistence (saved preferences)
