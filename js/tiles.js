/**
 * Icon tiles for Banner / Turm / Karte — mirrors hidden <select> values.
 */
(function () {
  const FACTIONS = [
    { value: 'Gondor', label: 'Gondor', tip: 'Schild & Disziplin', swatch: '#6b7c93' },
    { value: 'Rohan', label: 'Rohan', tip: 'Reiter der Mark', swatch: '#c9a227' },
    { value: 'Isengard', label: 'Isengard', tip: 'Industrie & Furcht', swatch: '#7a8a6a' },
    { value: 'Mordor', label: 'Mordor', tip: 'Rohe Gewalt', swatch: '#a33b3b' }
  ];
  const TOWERS = [
    { value: 'artillery', label: 'Artillerie', tip: 'Splash-Schaden', costKey: 'artillery' },
    { value: 'slow', label: 'Frost', tip: 'Verlangsamt', costKey: 'slow' },
    { value: 'rapid', label: 'Schnell', tip: 'Hohe Kadenz', costKey: 'rapid' },
    { value: 'sniper', label: 'Scharf', tip: 'Lange Reichweite', costKey: 'sniper' },
    { value: 'hero', label: 'Held', tip: 'Einzigartig', costKey: 'hero' },
    { value: 'antiAir', label: 'Luft', tip: 'Gegen Flieger', costKey: 'antiAir' }
  ];
  const MAPS = [
    { value: 'open', label: 'Feld', tip: 'Offenes Feld' },
    { value: 'corridors', label: 'Korridore', tip: 'Zwillingskorridore' },
    { value: 'islands', label: 'Inseln', tip: 'Inseln' },
    { value: 'bent', label: 'Pfad', tip: 'Gewundener Pfad' },
    { value: 'gondolin', label: 'Feste', tip: 'Gondolin-Feste' }
  ];

  function costFor(towerType) {
    try {
      const fac = document.getElementById('faction').value;
      if (typeof TOWER_DATA !== "undefined" && TOWER_DATA[fac] && TOWER_DATA[fac][towerType]) {
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
      btn.innerHTML =
        `<span class="tile-swatch" style="background:${it.swatch || 'var(--accent)'}"></span>` +
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
