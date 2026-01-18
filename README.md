# Ramallah Heritage (Visitor-First)

Interactive, visitor-friendly heritage map for **Ramallah** with:
- Curated **tours**
- A clean **map explorer**
- Building pages with **images**, optional **YouTube**, and optional **3D** (Sketchfab/GLB)

## Run locally
Because the app loads JSON via `fetch`, you must run a local server:

### Python
```bash
python -m http.server 8000
```
Open: `http://localhost:8000`

### VS Code
Use the **Live Server** extension.

## Deploy (GitHub Pages)
1) Push this folder to a GitHub repository  
2) Repository → **Settings** → **Pages**
3) Select your branch (e.g. `main`) and `/root`
4) Your site will be available at the provided URL

## Data
- `data/buildings.json` — list of buildings
- `data/tours.json` — curated tours

### Add a building
1) Add images in `assets/img/`
2) Add a new object in `data/buildings.json` with at least:
   - `id`, `name_ar`, `lat`, `lng`, `type_ar`, `period_ar`, `images`

### Add YouTube
Put links into:
```json
"youtube": ["https://www.youtube.com/watch?v=VIDEO_ID"]
```

### Add 3D
Sketchfab:
```json
"model3d": {"type":"sketchfab","url":"https://sketchfab.com/models/XXXX/embed"}
```

GLB:
```json
"model3d": {"type":"glb","url":"assets/models/model.glb"}
```

## Notes
The current dataset is a **curated starter set** (10 sites). Expand gradually without overwhelming visitors.


## Visitor features (v2)
- 📍 Locate Me (uses browser GPS)
- 🧭 Sort by nearest (when location is available)
- ⭐ Favorites (saved in localStorage)
- 📌 Copy GPS + Open in Google Maps + Directions from my location
- 🔗 Share building page


## Pages
- `tours.html` Tours
- `map.html` Map explorer
- `building.html` Building page
- `passport.html` Visitor passport (visited + favorites + export)

## Offline / PWA
This project includes a Service Worker (`sw.js`) and a Web App Manifest (`manifest.json`) for offline caching and installation.

## صور (Licensing)

هذا المشروع يتضمن صورًا من Wikimedia Commons تحت رخص **Creative Commons** (مثل CC BY / CC BY‑SA).  
راجع حقل `sources` داخل `data/buildings.json` لكل صورة لمعرفة المصدر والرخصة واسم المصوّر.

> ملاحظة: إذا أضفت صورًا أخرى من خارج ويكيميديا، تأكّد أنها **مسموح استخدامها** وأنك تضيف نسب (Attribution) واضح.


## v5 final pack
- Onboarding + Guide page
- Virtual tour button per building (Street View default)
- Visitor/Researcher mode toggle
- Ambient city sound (no music)
- Reflection stop in every tour
- Incomplete map toggle (coming soon)
- Optional before/after slider support
