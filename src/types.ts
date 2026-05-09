export type Rating = 'safe' | 'moderate' | 'daytrip' | 'avoid';

export type PinCategory =
  | 'eat'
  | 'drink'
  | 'culture'
  | 'landmark'
  | 'park'
  | 'market'
  | 'view';

export interface ZoneProperties {
  id: string;
  name: string;
  rating: Rating;
  home?: boolean;
  blurb: string;
  tips: string[];
}

export interface ZoneFeature {
  type: 'Feature';
  properties: ZoneProperties;
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
}

export interface ZoneCollection {
  type: 'FeatureCollection';
  features: ZoneFeature[];
}

export interface Pin {
  id: string;
  name: string;
  category: PinCategory;
  zone: string;
  coords: [number, number];
  blurb: string;
  tips: string[];
  facts?: string[];
}

export type Selection =
  | { kind: 'zone'; data: ZoneProperties }
  | { kind: 'pin'; data: Pin };

export type SelectionHandler = (selection: Selection) => void;

export const RATING_LABEL: Record<Rating, string> = {
  safe: 'Safe / walk freely',
  moderate: 'Moderate — day yes, Uber after dark',
  daytrip: 'Day trip',
  avoid: 'Avoid'
};

export const CATEGORY_LABEL: Record<PinCategory, string> = {
  eat: 'Eat',
  drink: 'Drink',
  culture: 'Culture',
  landmark: 'Landmark',
  park: 'Park',
  market: 'Market',
  view: 'View'
};

export const CATEGORY_GLYPH: Record<PinCategory, string> = {
  eat: '◆',
  drink: '◉',
  culture: '✦',
  landmark: '▲',
  park: '❋',
  market: '◈',
  view: '◬'
};
