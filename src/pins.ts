import L from 'leaflet';
import type { Pin, SelectionHandler } from './types';
import { CATEGORY_GLYPH } from './types';

interface PinLayerHandle {
  layer: L.LayerGroup;
  selectById: (id: string) => void;
  clearSelection: () => void;
}

export async function loadPins(baseUrl: string): Promise<Pin[]> {
  const url = `${baseUrl}data/pins.json`;
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to load pins: ${res.status}`);
  return (await res.json()) as Pin[];
}

function pinIcon(pin: Pin): L.DivIcon {
  const glyph = CATEGORY_GLYPH[pin.category];
  return L.divIcon({
    className: '', // reset default
    html: `<div class="pin pin--${pin.category}" data-pin-id="${pin.id}"><span class="pin-glyph">${glyph}</span></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function homeMarker(coords: [number, number]): L.Marker {
  const icon = L.divIcon({
    className: '',
    html: '<div class="home-marker"><span class="star">★</span></div>',
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
  return L.marker(coords, {
    icon,
    interactive: false,
    keyboard: false,
    zIndexOffset: -100
  });
}

export function createPinLayer(
  pins: Pin[],
  onSelect: SelectionHandler
): PinLayerHandle {
  const idToMarker = new Map<string, L.Marker>();
  let selectedId: string | null = null;

  function applySelectionClass(id: string | null) {
    document.querySelectorAll('.pin.pin--selected').forEach((el) => {
      el.classList.remove('pin--selected');
    });
    if (id) {
      const el = document.querySelector(`.pin[data-pin-id="${CSS.escape(id)}"]`);
      el?.classList.add('pin--selected');
    }
  }

  const markers = pins.map((pin) => {
    const marker = L.marker(pin.coords, {
      icon: pinIcon(pin),
      title: pin.name,
      riseOnHover: true,
      keyboard: false
    });
    marker.on('click', (e) => {
      L.DomEvent.stopPropagation(e);
      selectedId = pin.id;
      applySelectionClass(pin.id);
      onSelect({ kind: 'pin', data: pin });
    });
    marker.bindTooltip(pin.name, {
      direction: 'top',
      offset: [0, -10],
      className: 'pin-tooltip',
      opacity: 0.95
    });
    idToMarker.set(pin.id, marker);
    return marker;
  });

  // Home base star — anchored at Roma Norte's central plaza.
  const home = homeMarker([19.4216, -99.1614]);

  const layer = L.layerGroup([home, ...markers]);

  // Re-apply selection class whenever Leaflet rebuilds the marker DOM
  // (panning offscreen + back can detach nodes).
  layer.on('add', () => {
    requestAnimationFrame(() => applySelectionClass(selectedId));
  });

  return {
    layer,
    selectById(id: string) {
      const marker = idToMarker.get(id);
      if (!marker) return;
      selectedId = id;
      applySelectionClass(id);
      // Bring the matching pin into the foreground.
      marker.setZIndexOffset(1000);
    },
    clearSelection() {
      selectedId = null;
      applySelectionClass(null);
    }
  };
}
