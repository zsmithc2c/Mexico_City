# CDMX — A Field Guide

An editorial visitor's map of Mexico City. Color-coded zones (safe / day-only /
day-trip / avoid), 18 hand-picked landmarks, sticky detail sidebar, and
"find me" geolocation. Installable as a PWA with offline tile caching for
when you're roaming on weak data.

## Stack

- **Vite + TypeScript** — single-page app, no framework.
- **Leaflet** with **CartoDB Positron** tiles, desaturated for the zine look.
- **Fraunces + JetBrains Mono** display + label fonts.
- **vite-plugin-pwa** — service worker pre-caches app shell, runtime-caches
  tiles and Google Fonts.
- **GitHub Pages** for deploy (via Actions on push to `main`).

## Run locally

```bash
npm install
npm run dev          # dev server with HMR
npm run build        # production build into ./dist
npm run preview      # serve ./dist locally
npm run typecheck    # tsc --noEmit
```

Geolocation requires HTTPS or `localhost`. The dev server is served on
`localhost`, which is treated as secure by browsers — geolocation works there.

## Project layout

```
src/
  main.ts        # bootstrap + cross-module wiring
  layout.ts      # static page chrome (header, legend, footer)
  map.ts         # Leaflet base + tiles + bounds
  zones.ts      # GeoJSON layer + select state
  pins.ts        # DivIcon marker layer + select state
  sidebar.ts     # detail panel renderer
  geolocate.ts   # watchPosition + user marker
  types.ts       # shared types + ratings/category labels
  styles.css     # all CSS, vintage zine aesthetic
  grain.svg      # paper noise overlay
public/
  icon.svg, icon-maskable.svg
  data/zones.geojson  # 12 hand-traced colonia polygons
  data/pins.json      # 18 landmarks
```

## Editing content

- **Zones** live in `public/data/zones.geojson`. Each feature carries
  `name`, `rating` (`safe`|`moderate`|`daytrip`|`avoid`), optional `home`
  flag, `blurb`, and `tips[]`.
- **Pins** live in `public/data/pins.json`. Each carries `name`, `category`,
  `zone`, `coords` (`[lat, lng]`), `blurb`, and `tips[]`.

Both are loaded at runtime — no rebuild needed for content edits during
`npm run dev`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds with
`VITE_BASE=/<repo-name>/` and publishes `dist/` to GitHub Pages.

To deploy elsewhere, set `VITE_BASE` to the public path (e.g. `/` for a root
domain) before building.
