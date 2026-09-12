/**
 * JGA local persistence — Ruhm, Ränge, Siegelrune, settings, Rotes Buch
 * Fan homage to Fellowship OS („Reiter der Riddermark“). Local only.
 */
(function (global) {
  const KEYS = {
    meta: 'jgaTdMeta_v1',
    settings: 'jgaTdSettings_v1',
    buch: 'jgaTdRotesBuch_v1',
    legacyScore: 'maulHighScore'
  };

  const RAENGE = [
    { id: 'spaeher', name: 'Späher', minRuhm: 0 },
    { id: 'laeufer', name: 'Läufer', minRuhm: 25 },
    { id: 'wachtposten', name: 'Wachtposten', minRuhm: 60 },
    { id: 'schildwache', name: 'Schildwache', minRuhm: 120 },
    { id: 'bannertraeger', name: 'Bannerträger', minRuhm: 200 },
    { id: 'reitender', name: 'Reitender', minRuhm: 320 },
    { id: 'hornblaeser', name: 'Hornbläser', minRuhm: 480 },
    { id: 'marschall', name: 'Marschall', minRuhm: 700 },
    { id: 'thane', name: 'Thane', minRuhm: 1000 },
    { id: 'hauptmann', name: 'Hauptmann', minRuhm: 1400 },
    { id: 'feldherr', name: 'Feldherr', minRuhm: 1900 },
    { id: 'herold', name: 'Herold der Mark', minRuhm: 2600 },
    { id: 'marschall_mark', name: 'Marschall der Mark', minRuhm: 3500 },
    { id: 'kriegsfuerst', name: 'Kriegsfürst', minRuhm: 4800 }
  ];

  const DEFAULT_SETTINGS = {
    volume: 0.7,
    audioEnabled: true,
    quietHorn: false,
    reducedMotion: false,
    touchHints: true
  };

  const DEFAULT_META = {
    siegelrune: '',
    gefaehrte: '',
    riderId: '',
    totalRuhm: 0,
    bestScore: 0,
    bestWave: 0,
    runs: 0,
    lastFaction: 'Rohan'
  };

  function safeParse(raw, fallback) {
    try {
      return raw ? JSON.parse(raw) : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function loadMeta() {
    const meta = Object.assign({}, DEFAULT_META, safeParse(localStorage.getItem(KEYS.meta), {}));
    if (!meta.bestScore) {
      const legacy = parseInt(localStorage.getItem(KEYS.legacyScore) || '0', 10);
      if (legacy > 0) meta.bestScore = legacy;
    }
    return meta;
  }

  function saveMeta(meta) {
    try {
      localStorage.setItem(KEYS.meta, JSON.stringify(meta));
      localStorage.setItem(KEYS.legacyScore, String(meta.bestScore || 0));
    } catch (_) { /* private mode */ }
  }

  function loadSettings() {
    return Object.assign({}, DEFAULT_SETTINGS, safeParse(localStorage.getItem(KEYS.settings), {}));
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(KEYS.settings, JSON.stringify(settings));
    } catch (_) {}
  }

  function rankForRuhm(ruhm) {
    let current = RAENGE[0];
    for (const r of RAENGE) {
      if (ruhm >= r.minRuhm) current = r;
    }
    return current;
  }

  function nextRank(ruhm) {
    const cur = rankForRuhm(ruhm);
    const idx = RAENGE.findIndex((r) => r.id === cur.id);
    return RAENGE[Math.min(idx + 1, RAENGE.length - 1)];
  }

  function makeRiderId(siegelrune, gefaehrte) {
    const base = (siegelrune || gefaehrte || 'REITER').toUpperCase().replace(/[^A-Z0-9ÄÖÜ]/g, '');
    const short = (base.slice(0, 4) || 'MARK') + '-' + Math.abs(hashCode(base || 'MARK')).toString(36).slice(0, 4).toUpperCase();
    return short;
  }

  function hashCode(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0;
    return h;
  }

  function loadBuch() {
    const list = safeParse(localStorage.getItem(KEYS.buch), []);
    return Array.isArray(list) ? list : [];
  }

  function pushBuch(entry, max = 24) {
    const list = loadBuch();
    list.unshift({
      t: Date.now(),
      text: entry
    });
    while (list.length > max) list.pop();
    try {
      localStorage.setItem(KEYS.buch, JSON.stringify(list));
    } catch (_) {}
    return list;
  }

  function awardRuhm(amount) {
    const meta = loadMeta();
    const before = rankForRuhm(meta.totalRuhm);
    meta.totalRuhm = Math.max(0, (meta.totalRuhm || 0) + amount);
    const after = rankForRuhm(meta.totalRuhm);
    saveMeta(meta);
    return { meta, before, after, rankedUp: before.id !== after.id };
  }

  global.JgaTdStorage = {
    KEYS,
    RAENGE,
    DEFAULT_SETTINGS,
    DEFAULT_META,
    loadMeta,
    saveMeta,
    loadSettings,
    saveSettings,
    rankForRuhm,
    nextRank,
    makeRiderId,
    loadBuch,
    pushBuch,
    awardRuhm
  };
})(typeof window !== 'undefined' ? window : globalThis);
