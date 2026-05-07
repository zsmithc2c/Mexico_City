import 'leaflet/dist/leaflet.css';
import './styles.css';

import L from 'leaflet';
import { registerSW } from 'virtual:pwa-register';

import { APP_HTML } from './layout';
import { createMap } from './map';
import { createSidebar } from './sidebar';
import { createGeolocate } from './geolocate';
import { createPinLayer, loadPins } from './pins';
import { createZoneLayer, loadZones } from './zones';
import type { Pin, Selection, ZoneProperties } from './types';

const BASE = import.meta.env.BASE_URL || '/';

async function bootstrap() {
  const app = document.querySelector<HTMLDivElement>('#app');
  if (!app) throw new Error('Missing #app root');
  app.innerHTML = APP_HTML;

  const mapEl = document.getElementById('map')!;
  const sidebarEl = document.getElementById('sidebar')!;
  const locateBtn = document.getElementById('locate-btn') as HTMLButtonElement;

  const sidebar = createSidebar(sidebarEl);
  const map = createMap(mapEl);

  // Forward declarations so layers can reference each other in onSelect.
  let zoneLayer: ReturnType<typeof createZoneLayer> | null = null;
  let pinLayer: ReturnType<typeof createPinLayer> | null = null;
  let lastSelection: Selection | null = null;

  const onSelect = (sel: Selection) => {
    lastSelection = sel;
    if (sel.kind === 'zone') {
      pinLayer?.clearSelection();
      zoneLayer?.selectByName(sel.data.name);
    } else {
      zoneLayer?.clearSelection();
      pinLayer?.selectById(sel.data.id);
    }
    sidebar.update(sel);
    refreshDistance();
  };

  // Load data in parallel.
  const [zones, pins] = await Promise.all([loadZones(BASE), loadPins(BASE)]);

  zoneLayer = createZoneLayer(zones, onSelect);
  pinLayer = createPinLayer(pins, onSelect);
  zoneLayer.layer.addTo(map);
  pinLayer.layer.addTo(map);

  // Click on empty map = clear selection.
  map.on('click', () => {
    zoneLayer?.clearSelection();
    pinLayer?.clearSelection();
    lastSelection = null;
    sidebar.reset();
  });

  // Geolocation
  const geo = createGeolocate({ map, button: locateBtn });
  geo.onPosition((pos) => {
    if (!pos) {
      sidebar.setUserDistance(null);
      return;
    }
    refreshDistance();
  });

  function refreshDistance() {
    const pos = geo.getPosition();
    if (!pos || !lastSelection) {
      sidebar.setUserDistance(null);
      return;
    }
    const here = L.latLng(pos.coords.latitude, pos.coords.longitude);
    let target: L.LatLng;
    let name: string;
    if (lastSelection.kind === 'pin') {
      const pin = lastSelection.data as Pin;
      target = L.latLng(pin.coords[0], pin.coords[1]);
      name = pin.name;
    } else {
      // For zones, use the polygon centroid (geographic mean of vertices).
      const zone = lastSelection.data as ZoneProperties;
      const ring = zones.features.find((f) => f.properties.id === zone.id)
        ?.geometry.coordinates[0];
      if (!ring) {
        sidebar.setUserDistance(null);
        return;
      }
      // Drop the duplicated closing point.
      const pts = ring.slice(0, -1);
      const sumLng = pts.reduce((s, p) => s + p[0], 0);
      const sumLat = pts.reduce((s, p) => s + p[1], 0);
      target = L.latLng(sumLat / pts.length, sumLng / pts.length);
      name = zone.name;
    }
    sidebar.setUserDistance({ distanceMeters: here.distanceTo(target), toName: name });
  }

  // PWA service worker
  registerSW({
    onNeedRefresh() {
      // Fresh content available — silently apply on next load.
    },
    onOfflineReady() {
      // Optionally surface a toast in a future iteration.
    }
  });
}

bootstrap().catch((err) => {
  console.error('CDMX map failed to bootstrap:', err);
  const app = document.querySelector<HTMLDivElement>('#app');
  if (app) {
    app.innerHTML = `
      <div style="padding:48px;font-family:Fraunces,serif;color:#211a14">
        <h1 style="font-style:italic">Something jammed.</h1>
        <p>The map didn't load. Reload the page; if it persists, check the browser console.</p>
      </div>
    `;
  }
});
