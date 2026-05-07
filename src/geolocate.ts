import L from 'leaflet';

export interface GeolocateHandle {
  destroy: () => void;
  getPosition: () => GeolocationPosition | null;
  onPosition: (cb: (pos: GeolocationPosition | null) => void) => void;
}

interface Options {
  map: L.Map;
  button: HTMLButtonElement;
}

function userIcon(): L.DivIcon {
  return L.divIcon({
    className: '',
    html: '<div class="user-dot"></div>',
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  });
}

export function createGeolocate({ map, button }: Options): GeolocateHandle {
  let watchId: number | null = null;
  let marker: L.Marker | null = null;
  let circle: L.Circle | null = null;
  let lastPos: GeolocationPosition | null = null;
  let firstFix = true;
  const subscribers = new Set<(pos: GeolocationPosition | null) => void>();

  function setState(state: 'idle' | 'active' | 'error', label?: string) {
    button.dataset.state = state === 'idle' ? '' : state;
    const labelEl = button.querySelector('.locate-label');
    if (labelEl && label) labelEl.textContent = label;
  }

  function notify(pos: GeolocationPosition | null) {
    lastPos = pos;
    subscribers.forEach((cb) => cb(pos));
  }

  function show(pos: GeolocationPosition) {
    const latlng = L.latLng(pos.coords.latitude, pos.coords.longitude);
    if (!marker) {
      marker = L.marker(latlng, {
        icon: userIcon(),
        interactive: false,
        keyboard: false,
        zIndexOffset: 800
      }).addTo(map);
    } else {
      marker.setLatLng(latlng);
    }
    if (!circle) {
      circle = L.circle(latlng, {
        radius: pos.coords.accuracy ?? 30,
        color: '#4f8a6a',
        fillColor: '#4f8a6a',
        fillOpacity: 0.08,
        weight: 1,
        opacity: 0.5,
        interactive: false
      }).addTo(map);
    } else {
      circle.setLatLng(latlng);
      circle.setRadius(pos.coords.accuracy ?? 30);
    }

    if (firstFix) {
      // Pan to user only on the first fix. Don't yank the map on every update.
      map.setView(latlng, Math.max(map.getZoom(), 14), { animate: true });
      firstFix = false;
    }
    setState('active', 'Following');
    notify(pos);
  }

  function start() {
    if (!('geolocation' in navigator)) {
      setState('error', 'Unavailable');
      return;
    }
    setState('active', 'Locating…');
    firstFix = true;

    navigator.geolocation.getCurrentPosition(
      (pos) => show(pos),
      () => setState('error', 'Denied'),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 5000 }
    );

    watchId = navigator.geolocation.watchPosition(
      (pos) => show(pos),
      () => setState('error', 'Lost signal'),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 4000 }
    );
  }

  function stop() {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (marker) {
      map.removeLayer(marker);
      marker = null;
    }
    if (circle) {
      map.removeLayer(circle);
      circle = null;
    }
    setState('idle', 'Find me');
    notify(null);
  }

  function toggle() {
    if (watchId !== null) stop();
    else start();
  }

  button.addEventListener('click', toggle);

  return {
    destroy() {
      button.removeEventListener('click', toggle);
      stop();
    },
    getPosition: () => lastPos,
    onPosition(cb) {
      subscribers.add(cb);
    }
  };
}
