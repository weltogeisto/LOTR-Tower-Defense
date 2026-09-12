/**
 * JGA local persistence — Ruhm, Ränge, Siegelrune slots, settings, Rotes Buch
 * Fan homage to Fellowship OS („Reiter der Riddermark“). Local only.
 *
 * Siegelrune is a real localStorage save slot: identity + progress are keyed by rune.
 */
(function (global) {
  const KEYS = {
    activeSiegel: 'jgaTdActiveSiegel_v1',
    slotPrefix: 'jgaTdSlot_v1_',
    buchPrefix: 'jgaTdBuch_v1_',
    settings: 'jgaTdSettings_v1',
    legacyMeta: 'jgaTdMeta_v1',
    legacyBuch: 'jgaTdRotesBuch_v1',
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
    riderFlavour: 'jan-banner',
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

  function normalizeSiegel(rune) {
    return String(rune || '')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9ÄÖÜ]/g, '')
      .slice(0, 24);
  }

  function slotStorageKey(rune) {
    const key = normalizeSiegel(rune) || 'DEFAULT';
    return KEYS.slotPrefix + key;
  }

  function buchStorageKey(rune) {
    const key = normalizeSiegel(rune) || 'DEFAULT';
    return KEYS.buchPrefix + key;
  }

  function getActiveSiegel() {
    try {
      const fromActive = normalizeSiegel(localStorage.getItem(KEYS.activeSiegel) || '');
      if (fromActive) return fromActive;
      const legacy = safeParse(localStorage.getItem(KEYS.legacyMeta), {});
      return normalizeSiegel(legacy.siegelrune || '');
    } catch (_) {
      return '';
    }
  }

  function setActiveSiegel(rune) {
    const key = normalizeSiegel(rune) || 'DEFAULT';
    try {
      localStorage.setItem(KEYS.activeSiegel, key);
    } catch (_) {}
    return key;
  }

  function migrateLegacyIntoSlot(slotKey) {
    const legacy = safeParse(localStorage.getItem(KEYS.legacyMeta), null);
    if (!legacy || typeof legacy !== 'object') return null;
    const legacyRune = normalizeSiegel(legacy.siegelrune || '');
    // Only migrate when legacy matches this slot, or slot is DEFAULT and legacy had no rune
    if (legacyRune && legacyRune !== slotKey) return null;
    if (!legacyRune && slotKey !== 'DEFAULT') return null;
    return Object.assign({}, DEFAULT_META, legacy, {
      siegelrune: slotKey === 'DEFAULT' ? (legacy.siegelrune || '') : slotKey
    });
  }

  function loadMeta(optRune) {
    const active = optRune != null ? (normalizeSiegel(optRune) || 'DEFAULT') : (getActiveSiegel() || 'DEFAULT');
    let meta = safeParse(localStorage.getItem(slotStorageKey(active)), null);
    if (!meta) {
      meta = migrateLegacyIntoSlot(active) || Object.assign({}, DEFAULT_META);
    }
    meta = Object.assign({}, DEFAULT_META, meta);
    if (!meta.siegelrune) meta.siegelrune = active === 'DEFAULT' ? '' : active;
    if (!meta.bestScore) {
      const legacy = parseInt(localStorage.getItem(KEYS.legacyScore) || '0', 10);
      if (legacy > 0 && active === (getActiveSiegel() || 'DEFAULT')) meta.bestScore = legacy;
    }
    return meta;
  }

  function saveMeta(meta) {
    try {
      const rune = normalizeSiegel(meta && meta.siegelrune) || getActiveSiegel() || 'DEFAULT';
      const toSave = Object.assign({}, DEFAULT_META, meta || {}, {
        siegelrune: rune === 'DEFAULT' ? (meta && meta.siegelrune) || '' : rune
      });
      setActiveSiegel(rune);
      localStorage.setItem(slotStorageKey(rune), JSON.stringify(toSave));
      // Keep legacy mirror for older readers / highscore
      localStorage.setItem(KEYS.legacyMeta, JSON.stringify(toSave));
      localStorage.setItem(KEYS.legacyScore, String(toSave.bestScore || 0));
    } catch (_) { /* private mode */ }
  }

  /** Activate a Siegelrune slot (creates empty progress if new). */
  function selectSiegel(siegelrune, extras) {
    const rune = normalizeSiegel(siegelrune) || 'DEFAULT';
    setActiveSiegel(rune);
    const meta = loadMeta(rune);
    if (extras && typeof extras === 'object') Object.assign(meta, extras);
    meta.siegelrune = rune === 'DEFAULT' ? (siegelrune || '').trim().slice(0, 24) : rune;
    saveMeta(meta);
    return meta;
  }

  function listSlots() {
    const out = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith(KEYS.slotPrefix)) continue;
        const rune = k.slice(KEYS.slotPrefix.length);
        const meta = loadMeta(rune);
        out.push({
          siegelrune: meta.siegelrune || rune,
          gefaehrte: meta.gefaehrte || '',
          totalRuhm: meta.totalRuhm || 0,
          bestScore: meta.bestScore || 0,
          runs: meta.runs || 0,
          riderId: meta.riderId || ''
        });
      }
    } catch (_) {}
    out.sort((a, b) => (b.totalRuhm || 0) - (a.totalRuhm || 0));
    return out;
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

  function loadBuch(optRune) {
    const active = optRune != null ? (normalizeSiegel(optRune) || 'DEFAULT') : (getActiveSiegel() || 'DEFAULT');
    let list = safeParse(localStorage.getItem(buchStorageKey(active)), null);
    if (!Array.isArray(list)) {
      // migrate legacy book once into active/default slot
      const legacy = safeParse(localStorage.getItem(KEYS.legacyBuch), []);
      list = Array.isArray(legacy) ? legacy : [];
    }
    return list;
  }

  function pushBuch(entry, max = 24) {
    const active = getActiveSiegel() || 'DEFAULT';
    const list = loadBuch(active);
    list.unshift({
      t: Date.now(),
      text: entry
    });
    while (list.length > max) list.pop();
    try {
      localStorage.setItem(buchStorageKey(active), JSON.stringify(list));
      localStorage.setItem(KEYS.legacyBuch, JSON.stringify(list));
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
    normalizeSiegel,
    getActiveSiegel,
    selectSiegel,
    listSlots,
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
