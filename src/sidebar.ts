import type { Pin, Selection, ZoneProperties } from './types';
import { CATEGORY_LABEL, RATING_LABEL } from './types';

export interface SidebarHandle {
  update: (selection: Selection) => void;
  reset: () => void;
  setUserDistance: (info: { distanceMeters: number; toName: string } | null) => void;
}

const CITY_FACTS = [
  "CDMX sits on a drained lakebed — the whole city is sinking unevenly, some buildings up to 40 cm a year",
  "At 2,240 m elevation, jet lag is doubled by altitude — go easy on alcohol and water heavily for the first 48 hours",
  "It's the largest Spanish-speaking city in the world by population — about 22 million in the metro area",
  "The Aztec capital Tenochtitlan, founded in 1325, was one of the largest cities in the world before the Spanish razed it in 1521",
  "Mexico City has more museums than any other city in the world after London — 150+ at last count",
  "The Metro is one of the cheapest in the world: a flat 5-peso fare goes anywhere on the network",
];

const EMPTY_HTML = `
  <div class="sidebar-empty">
    <p class="sidebar-kicker">Field Notes</p>
    <h2 class="sidebar-title">Tap a zone or pin</h2>
    <p class="sidebar-blurb">
      Pick any colored area or labelled spot on the map and details land here —
      what it's like, when to go, and the small things worth knowing.
    </p>
    <div class="empty-hint">
      <strong>Home base</strong><br/>
      Roma Norte is starred. The map opens centered on it.
    </div>
    <p class="sidebar-facts-label">Did you know?</p>
    <ul class="sidebar-facts">
      ${CITY_FACTS.map((f) => `<li>${f}</li>`).join('')}
    </ul>
  </div>
`;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function tipsList(tips: string[]): string {
  return `
    <p class="sidebar-tips-label">Field notes</p>
    <ul class="sidebar-tips">
      ${tips.map((t) => `<li>${escapeHtml(t)}</li>`).join('')}
    </ul>
  `;
}

function factsList(facts: string[] | undefined): string {
  if (!facts || facts.length === 0) return '';
  return `
    <p class="sidebar-facts-label">Did you know?</p>
    <ul class="sidebar-facts">
      ${facts.map((f) => `<li>${escapeHtml(f)}</li>`).join('')}
    </ul>
  `;
}

function renderZone(props: ZoneProperties, distanceTag: string): string {
  const homeBadge = props.home ? `<span class="tag tag--home">★ Home base</span>` : '';
  return `
    <p class="sidebar-kicker">${props.home ? 'Roma Norte · home' : 'Neighborhood'}</p>
    <h2 class="sidebar-title">
      ${props.home ? '<span class="home-glyph">★</span>' : ''}${escapeHtml(props.name)}
    </h2>
    <div class="tag-row">
      <span class="tag tag--${props.rating}">${RATING_LABEL[props.rating]}</span>
      ${homeBadge}
      ${distanceTag}
    </div>
    <p class="sidebar-blurb">${escapeHtml(props.blurb)}</p>
    ${tipsList(props.tips)}
  `;
}

function renderPin(pin: Pin, distanceTag: string): string {
  return `
    <p class="sidebar-kicker">${escapeHtml(pin.zone)}</p>
    <h2 class="sidebar-title">${escapeHtml(pin.name)}</h2>
    <div class="tag-row">
      <span class="tag tag--cat">${CATEGORY_LABEL[pin.category]}</span>
      ${distanceTag}
    </div>
    <p class="sidebar-blurb">${escapeHtml(pin.blurb)}</p>
    ${tipsList(pin.tips)}
    ${factsList(pin.facts)}
  `;
}

function formatDistance(meters: number): string {
  if (meters < 950) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(meters < 9500 ? 1 : 0)} km`;
}

export function createSidebar(container: HTMLElement): SidebarHandle {
  let current: Selection | null = null;
  let lastDistance: { distanceMeters: number; toName: string } | null = null;

  function distanceTagFor(name: string): string {
    if (!lastDistance) return '';
    if (lastDistance.toName !== name) return '';
    return `<span class="tag tag--distance">↘ ${formatDistance(
      lastDistance.distanceMeters
    )} from you</span>`;
  }

  function render() {
    if (!current) {
      container.innerHTML = EMPTY_HTML;
      return;
    }
    if (current.kind === 'zone') {
      container.innerHTML = renderZone(current.data, distanceTagFor(current.data.name));
    } else {
      container.innerHTML = renderPin(current.data, distanceTagFor(current.data.name));
    }
    // Scroll the sidebar back to the top whenever content changes.
    container.scrollTop = 0;
  }

  render();

  return {
    update(selection: Selection) {
      current = selection;
      render();
    },
    reset() {
      current = null;
      render();
    },
    setUserDistance(info) {
      lastDistance = info;
      render();
    }
  };
}
