export const APP_HTML = `
  <header class="page-header">
    <div>
      <p class="kicker">A field guide · Volume 01</p>
      <h1>
        Mexico City<span class="accent">,</span><br/>
        a <span class="accent">walking</span> map.
      </h1>
    </div>
    <div class="meta">
      <strong>Stay</strong> Roma Norte<br/>
      <strong>Season</strong> Late spring<br/>
      <strong>Edition</strong> Personal copy
    </div>
  </header>

  <section class="legend" aria-label="Map legend">
    <span class="legend-item"><span class="legend-swatch legend-swatch--safe"></span>Walk freely</span>
    <span class="legend-item"><span class="legend-swatch legend-swatch--moderate"></span>Day yes · Uber after dark</span>
    <span class="legend-item"><span class="legend-swatch legend-swatch--daytrip"></span>Day trip</span>
    <span class="legend-item"><span class="legend-swatch legend-swatch--avoid"></span>Avoid</span>
    <span class="legend-item"><span class="legend-star">★</span>Home base</span>
  </section>

  <main class="grid">
    <div class="map-frame">
      <div id="map" role="region" aria-label="Map of Mexico City"></div>
      <button id="locate-btn" class="locate-btn" type="button" aria-label="Find my location">
        <span class="dot"></span>
        <span class="locate-label">Find me</span>
      </button>
    </div>
    <aside id="sidebar" class="sidebar" aria-live="polite"></aside>
  </main>

  <footer class="page-footer">
    <p>Hand-drawn boundaries · ratings reflect a single visitor's read</p>
    <p class="colophon">Set in Fraunces &amp; JetBrains Mono. Tiles by CARTO &amp; OpenStreetMap.</p>
  </footer>
`;
