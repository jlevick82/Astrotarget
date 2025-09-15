# Astro Gallery — GitHub Upload Build

Single-file web app that loads astrophotography images straight from your GitHub repo (Raw URLs) and caches them for offline use.

## How to Use

1. Upload the contents of this folder to a GitHub repo (main branch works).  
2. Enable **GitHub Pages** for the repo (Settings → Pages → Source: Deploy from branch → `main` / `/root`).  
3. Visit your site, paste your **GitHub Raw base URL** into the field at the top, e.g.:

```
https://raw.githubusercontent.com/<user>/<repo>/<branch>/images/full/
```

4. Choose a catalog and range, then **Load**. The app tries these filename patterns:
   - Messier: `m1.jpg … m110.jpg`
   - Caldwell: `c1.jpg … c109.jpg`
   - NGC (future): `ngc1.jpg … ngc9999.jpg`

It will fall back to `-thumb.jpg` / `.png` / `.webp` if the first attempt is missing, and show a 'No image yet' badge otherwise.

## Caching Behavior

- Images you open are cached via a Service Worker for **offline** viewing.  
- Click **Clear Cache** to wipe local caches.  
- A small status line shows approximate cached item count.

## Dev Notes

- No build step; purely static assets suitable for GitHub Pages.  
- You can set a default base in `config.js` (left blank by default).
