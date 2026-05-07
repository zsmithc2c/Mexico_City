import L from 'leaflet';
import type {
  Rating,
  SelectionHandler,
  ZoneCollection,
  ZoneFeature,
  ZoneProperties
} from './types';

const RATING_FILL: Record<Rating, string> = {
  safe: '#4f8a6a',
  moderate: '#d39a3a',
  daytrip: '#7a4a6e',
  avoid: '#b8553a'
};

const RATING_STROKE: Record<Rating, string> = {
  safe: '#355f49',
  moderate: '#9c6f1f',
  daytrip: '#563249',
  avoid: '#8a3a23'
};

interface ZoneLayerHandle {
  layer: L.GeoJSON;
  selectByName: (name: string) => void;
  clearSelection: () => void;
}

export async function loadZones(baseUrl: string): Promise<ZoneCollection> {
  const url = `${baseUrl}data/zones.geojson`;
  const res = await fetch(url, { cache: 'force-cache' });
  if (!res.ok) throw new Error(`Failed to load zones: ${res.status}`);
  return (await res.json()) as ZoneCollection;
}

export function createZoneLayer(
  data: ZoneCollection,
  onSelect: SelectionHandler
): ZoneLayerHandle {
  let selectedLayer: L.Path | null = null;

  function styleFor(props: ZoneProperties, selected: boolean): L.PathOptions {
    const fill = RATING_FILL[props.rating];
    const stroke = RATING_STROKE[props.rating];
    return {
      color: stroke,
      weight: selected ? 3 : props.home ? 2.5 : 1.5,
      opacity: 0.9,
      fillColor: fill,
      fillOpacity: selected ? 0.55 : props.home ? 0.42 : 0.32,
      dashArray: props.rating === 'avoid' ? '5,4' : undefined,
      lineJoin: 'round'
    };
  }

  function setSelected(layer: L.Path, props: ZoneProperties) {
    if (selectedLayer && selectedLayer !== layer) {
      const prevProps = (selectedLayer as unknown as { feature?: ZoneFeature })
        .feature?.properties;
      if (prevProps) {
        selectedLayer.setStyle(styleFor(prevProps, false));
      }
    }
    selectedLayer = layer;
    layer.setStyle(styleFor(props, true));
    layer.bringToFront();
  }

  function clearSelection() {
    if (selectedLayer) {
      const props = (selectedLayer as unknown as { feature?: ZoneFeature })
        .feature?.properties;
      if (props) selectedLayer.setStyle(styleFor(props, false));
      selectedLayer = null;
    }
  }

  const nameToLayer = new Map<string, L.Path>();

  const layer = L.geoJSON(data as unknown as GeoJSON.FeatureCollection, {
    style: (feature) => {
      const props = (feature as ZoneFeature).properties;
      return styleFor(props, false);
    },
    onEachFeature: (feature, lyr) => {
      const props = (feature as ZoneFeature).properties;
      nameToLayer.set(props.name, lyr as L.Path);

      lyr.on('mouseover', () => {
        if (lyr === selectedLayer) return;
        (lyr as L.Path).setStyle({
          fillOpacity: props.home ? 0.55 : 0.45
        });
      });
      lyr.on('mouseout', () => {
        if (lyr === selectedLayer) return;
        (lyr as L.Path).setStyle(styleFor(props, false));
      });
      lyr.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelected(lyr as L.Path, props);
        onSelect({ kind: 'zone', data: props });
      });

      lyr.bindTooltip(props.name, {
        direction: 'center',
        className: 'zone-tooltip',
        permanent: false,
        sticky: true,
        opacity: 0.92
      });
    }
  });

  return {
    layer,
    selectByName(name: string) {
      const lyr = nameToLayer.get(name);
      if (!lyr) return;
      const props = (lyr as unknown as { feature?: ZoneFeature }).feature?.properties;
      if (props) setSelected(lyr, props);
    },
    clearSelection
  };
}
