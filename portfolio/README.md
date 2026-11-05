# Jannat Tuseef Butt — Portfolio

Static site: `index.html`, `style.css`, `script.js` + `images/`. GSAP 3.12.5 loads from the cdnjs CDN (internet needed).

## Run locally
VS Code → install **Live Server** → right-click `index.html` → **Open with Live Server**.

## Replace images (keep the same file names, or edit the `src` in index.html)
| File | Used for | Ideal size |
|---|---|---|
| `images/portrait.jpg` | Hero portrait | 4:5 portrait, ~1200×1500 |
| `images/desktop-screenshot.png` | Inside the monitor | Any ratio, but update `aspect-ratio` of `.monitor-screen` in style.css and the `width`/`height` in index.html to match |
| `images/mobile-portrait.png` | Phone, portrait | ratio 334:742 |
| `images/mobile-landscape.png` | Phone, landscape | ratio 742:334 (the same screen turned on its side) |

Higher-resolution screenshots (e.g. 2000px wide for desktop) will look sharper when the monitor zooms to full screen.

## Deploy
- **GitHub:** `git init && git add . && git commit -m "Portfolio" && git branch -M main && git remote add origin https://github.com/Jannat-333/<repo>.git && git push -u origin main`
- **Vercel:** Import the repo → Framework Preset **Other** → no build command, no output directory → Deploy.
