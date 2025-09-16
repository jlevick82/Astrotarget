
# Astrotarget (v18)

- Root splash with progress/debug, session-only redirect to Go-No-Go.
- Go-No-Go dashboard with Install / Compact / Night, weather, scoring, Top 5, and Catalog card (collapsed).
- Gallery for external images (configurable base path).
- Service workers: `gng-app-v8`, `astro-gallery-v9`.
- Version flag: `window.GNG_VERSION='v18'`.

## Deploy
1. Upload all files/folders to your GitHub Pages repo (case-sensitive path `Astrotarget/`).
2. Hard reload once; if stale, unregister old service workers and reload.
3. In console: `window.GNG_VERSION` should be `"v18"`.
