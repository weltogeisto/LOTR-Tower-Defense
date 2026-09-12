/**
 * Icon tiles for Banner / Turm / Karte — mirrors hidden <select> values.
 * Mini silhouette glyphs for small-viewport readability.
 */
(function () {
  const FACTIONS = [
    { value: 'Gondor', label: 'Gondor', tip: 'Schild & Disziplin', swatch: '#8a9bb0', glyph: 'shield' },
    { value: 'Rohan', label: 'Rohan', tip: 'Reiter der Mark', swatch: '#e0bf4a', glyph: 'horse' },
    { value: 'Isengard', label: 'Isengard', tip: 'Industrie & Furcht', swatch: '#9aab88', glyph: 'gear' },
    { value: 'Mordor', label: 'Mordor', tip: 'Rohe Gewalt', swatch: '#d04545', glyph: 'eye' }
  ];
  const TOWERS = [
    { value: 'artillery', label: 'Artillerie', tip: 'Splash-Schaden', costKey: 'artillery', glyph: 'ballista', swatch: '#5a6a80' },
    { value: 'slow', label: 'Frost', tip: 'Verlangsamt', costKey: 'slow', glyph: 'frost', swatch: '#3d9b8f' },
    { value: 'rapid', label: 'Schnell', tip: 'Hohe Kadenz', costKey: 'rapid', glyph: 'rapid', swatch: '#c9a227' },
    { value: 'sniper', label: 'Scharf', tip: 'Lange Reichweite', costKey: 'sniper', glyph: 'sniper', swatch: '#b8c5d6' },
    { value: 'hero', label: 'Held', tip: 'Einzigartig', costKey: 'hero', glyph: 'hero', swatch: '#e0bf4a' },
    { value: 'antiAir', label: 'Luft', tip: 'Gegen Flieger', costKey: 'antiAir', glyph: 'antiair', swatch: '#6b7c93' }
  ];
  const MAPS = [
    { value: 'open', label: 'Feld', tip: 'Offenes Feld', glyph: 'map', swatch: '#3ecf8e' },
    { value: 'corridors', label: 'Korridore', tip: 'Zwillingskorridore', glyph: 'map', swatch: '#6b7c93' },
    { value: 'islands', label: 'Inseln', tip: 'Inseln', glyph: 'map', swatch: '#3d9b8f' },
    { value: 'bent', label: 'Pfad', tip: 'Gewundener Pfad', glyph: 'map', swatch: '#c9a227' },
    { value: 'gondolin', label: 'Feste', tip: 'Gondolin-Feste', glyph: 'keep', swatch: '#e0bf4a' }
  ];

  const GLYPHS = {
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2 L20 6 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V6 Z"/><path fill="none" stroke="#0a1018" stroke-width="1.6" d="M12 2 L20 6 V12 C20 17 16 21 12 22 C8 21 4 17 4 12 V6 Z"/></svg>',
    horse: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 16 L7 10 L11 8 L14 5 L18 7 L20 11 L17 12 L15 16 L12 15 L9 18 Z"/><circle cx="16.5" cy="8.5" r="1.1" fill="#0a1018"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.2" fill="#0a1018"/><path fill="currentColor" d="M10 2 H14 L15 5 L18 4 L20 7 L18 9 L21 11 V13 L18 15 L20 17 L18 20 L15 19 L14 22 H10 L9 19 L6 20 L4 17 L6 15 L3 13 V11 L6 9 L4 7 L6 4 L9 5 Z"/></svg>',
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="9" ry="5.5" fill="currentColor"/><circle cx="12" cy="12" r="2.6" fill="#0a1018"/><circle cx="12" cy="12" r="1.1" fill="#e0bf4a"/></svg>',
    ballista: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="10" width="10" height="9" rx="1" fill="currentColor"/><path d="M6 10 L12 4 L18 10 Z" fill="currentColor"/><path stroke="#0a1018" stroke-width="2" d="M5 9 L19 7"/><circle cx="19" cy="7" r="1.6" fill="#e0bf4a"/></svg>',
    frost: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="11" width="8" height="8" fill="currentColor"/><path d="M6 11 A6 6 0 0 1 18 11 Z" fill="currentColor"/><path stroke="#5eead4" stroke-width="2" fill="none" d="M9 9 A4 3 0 0 0 15 9"/></svg>',
    rapid: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="10" width="8" height="10" fill="currentColor"/><rect x="5" y="4" width="4" height="8" fill="currentColor"/><rect x="10" y="3" width="4" height="9" fill="currentColor"/><rect x="15" y="4" width="4" height="8" fill="currentColor"/><rect x="10" y="1" width="4" height="3" fill="#e0bf4a"/></svg>',
    sniper: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9 20 L10 5 H14 L15 20 Z"/><path stroke="#b8c5d6" stroke-width="2" d="M12 5 V1"/></svg>',
    hero: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="10" width="12" height="10" fill="currentColor"/><path d="M5 10 V5 L10 8 H14 L19 5 V10 Z" fill="currentColor"/><rect x="14" y="2" width="2" height="8" fill="#e0bf4a"/><path d="M16 2 L21 4 L16 6 Z" fill="#e0bf4a"/></svg>',
    antiair: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="14" r="6" fill="currentColor"/><path stroke="#b8c5d6" stroke-width="2.2" d="M5 11 L18 6 M11 14 L20 5"/></svg>',
    map: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" d="M4 12 H9 Q12 8 15 12 T22 12"/></svg>',
    keep: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="9" fill="currentColor"/><rect x="4" y="5" width="5" height="14" fill="currentColor"/><rect x="15" y="6" width="5" height="13" fill="currentColor"/><rect x="14" y="2" width="1.5" height="6" fill="#e0bf4a"/><path d="M15.5 2 L19 3.5 L15.5 5 Z" fill="#e0bf4a"/></svg>'
  };

  function costFor(towerType) {
    try {
      const fac = document.getElementById('faction').value;
      if (typeof TOWER_DATA !== 'undefined' && TOWER_DATA[fac] && TOWER_DATA[fac][towerType]) {
        return TOWER_DATA[fac][towerType].baseCost;
      }
    } catch (_) {}
    return null;
  }

  function paint(row, items, selectId, opts) {
    const sel = document.getElementById(selectId);
    if (!row || !sel) return;
    row.innerHTML = '';
    items.forEach((it) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'icon-tile';
      btn.dataset.value = it.value;
      const cost = opts && opts.withCost ? costFor(it.value) : null;
      btn.title = it.tip + (cost != null ? ` · ${cost} Schätze` : '');
      btn.setAttribute('aria-pressed', sel.value === it.value ? 'true' : 'false');
      const glyph = GLYPHS[it.glyph] || GLYPHS.map;
      btn.innerHTML =
        `<span class="tile-swatch" style="--tile-accent:${it.swatch || 'var(--accent)'};color:${it.swatch || 'var(--accent)'}">${glyph}</span>` +
        `<span class="tile-label">${it.label}</span>` +
        (cost != null ? `<span class="tile-cost">${cost}</span>` : '');
      btn.addEventListener('click', () => {
        sel.value = it.value;
        sel.dispatchEvent(new Event('change', { bubbles: true }));
        sync();
      });
      row.appendChild(btn);
    });
  }

  function sync() {
    paint(document.getElementById('factionTiles'), FACTIONS, 'faction');
    paint(document.getElementById('towerTiles'), TOWERS, 'towerType', { withCost: true });
    paint(document.getElementById('mapTiles'), MAPS, 'map');
    document.querySelectorAll('.tile-row').forEach((row) => {
      const sid = row.dataset.for;
      const sel = document.getElementById(sid);
      if (!sel) return;
      row.querySelectorAll('.icon-tile').forEach((btn) => {
        btn.setAttribute('aria-pressed', btn.dataset.value === sel.value ? 'true' : 'false');
      });
    });
  }

  function boot() {
    sync();
    ['faction', 'towerType', 'map'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('change', sync);
    });
    window.addEventListener('jga-td-game-ready', sync);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
