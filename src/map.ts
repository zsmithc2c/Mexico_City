import L from 'leaflet';

// CDMX bounding box — wide enough to include Xochimilco in the south
// and Polanco/Soumaya in the north-west.
const CDMX_BOUNDS = L.latLngBounds(
  L.latLng(19.20, -99.30),
  L.latLng(19.50, -98.95)
);

const CDMX_CENTER: L.LatLngTuple = [19.4180, -99.1620]; // Roma Norte-ish

export function createMap(container: HTMLElement): L.Map {
  const map = L.map(container, {
    center: CDMX_CENTER,
    zoom: 13,
    minZoom: 11,
    maxZoom: 18,
    maxBounds: CDMX_BOUNDS,
    maxBoundsViscosity: 0.9,
    zoomControl: true,
    attributionControl: true,
    preferCanvas: false
  });

  // CartoDB Positron — muted, label-light base layer.
  L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
      crossOrigin: true
    }
  ).addTo(map);

  return map;
}

export { CDMX_BOUNDS, CDMX_CENTER };
