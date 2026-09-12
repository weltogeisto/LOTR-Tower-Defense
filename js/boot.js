/**
 * Start screen, settings, Siegelrune identity — wires JGA meta into the game.
 */
(function () {
  const startOverlay = document.getElementById('startOverlay');
  const settingsOverlay = document.getElementById('settingsOverlay');
  const playBtn = document.getElementById('playBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const saveSettingsBtn = document.getElementById('saveSettingsBtn');
  const siegelInput = document.getElementById('siegelrune');
  const nameInput = document.getElementById('gefaehrteName');
  const riderPick = document.getElementById('riderPick');
  const riderIdEl = document.getElementById('riderIdPreview');
  const buildId = document.getElementById('buildId');

  if (buildId) buildId.textContent = 'jga-td-sota-visual-2026-09';

  function refreshMetaHud() {
    if (!window.JgaTdStorage) return;
    const meta = JgaTdStorage.loadMeta();
    const rank = JgaTdStorage.rankForRuhm(meta.totalRuhm);
    const next = JgaTdStorage.nextRank(meta.totalRuhm);
    const elRune = document.getElementById('metaSiegel');
    const elName = document.getElementById('metaName');
    const elRuhm = document.getElementById('metaRuhm');
    const elRank = document.getElementById('metaRank');
    const elRider = document.getElementById('metaRider');
    if (elRune) elRune.textContent = meta.siegelrune || '—';
    if (elName) elName.textContent = meta.gefaehrte || 'Unbekannter Reiter';
    if (elRuhm) elRuhm.textContent = String(meta.totalRuhm || 0);
    if (elRank) elRank.textContent = rank.name + (next.id !== rank.id ? ` → ${next.name}` : '');
    if (elRider) elRider.textContent = meta.riderId || '—';
    if (window.JgaTdGame && JgaTdGame.renderRotesBuch) JgaTdGame.renderRotesBuch();
  }

  function syncFormFromStorage() {
    const meta = JgaTdStorage.loadMeta();
    const s = JgaTdStorage.loadSettings();
    if (siegelInput) siegelInput.value = meta.siegelrune || '';
    if (nameInput) nameInput.value = meta.gefaehrte || '';
    if (riderPick) riderPick.value = meta.riderFlavour || 'jan-banner';
    updateRiderPreview();
    const vol = document.getElementById('setVolume');
    const quiet = document.getElementById('setQuietHorn');
    const motion = document.getElementById('setReducedMotion');
    const audio = document.getElementById('setAudio');
    if (vol) vol.value = String(Math.round((s.volume || 0.7) * 100));
    if (quiet) quiet.checked = !!s.quietHorn;
    if (motion) motion.checked = !!s.reducedMotion;
    if (audio) audio.checked = s.audioEnabled !== false;
    document.body.classList.toggle('reduced-motion', !!s.reducedMotion);
    if (window.JgaHorn) JgaHorn.applySettings(s);
  }

  function updateRiderPreview() {
    if (!window.JgaTdStorage) return;
    const rune = (siegelInput && siegelInput.value) || '';
    const name = (nameInput && nameInput.value) || '';
    const id = JgaTdStorage.makeRiderId(rune, name);
    if (riderIdEl) riderIdEl.textContent = id;
    return id;
  }

  function persistIdentity() {
    const runeRaw = (siegelInput && siegelInput.value) || '';
    const name = (nameInput && nameInput.value) || '';
    const flavour = riderPick ? riderPick.value : 'jan-banner';
    // Activate real localStorage save slot keyed by Siegelrune
    let meta;
    if (typeof JgaTdStorage.selectSiegel === 'function') {
      meta = JgaTdStorage.selectSiegel(runeRaw, {
        gefaehrte: name.trim().slice(0, 32),
        riderFlavour: flavour
      });
    } else {
      meta = JgaTdStorage.loadMeta();
      meta.siegelrune = runeRaw.trim().slice(0, 24);
      meta.gefaehrte = name.trim().slice(0, 32);
      meta.riderFlavour = flavour;
    }
    meta.gefaehrte = (meta.gefaehrte || '').trim().slice(0, 32);
    meta.riderFlavour = flavour;
    meta.riderId = JgaTdStorage.makeRiderId(meta.siegelrune || runeRaw, meta.gefaehrte || name);
    if (!meta.gefaehrte && meta.riderFlavour === 'jan-banner') {
      meta.gefaehrte = 'Bannerträger für Jan';
      meta.riderId = JgaTdStorage.makeRiderId(meta.siegelrune || runeRaw, meta.gefaehrte);
    }
    JgaTdStorage.saveMeta(meta);
    if (riderIdEl) riderIdEl.textContent = meta.riderId;
    refreshMetaHud();
    return meta;
  }

  function beginPlay() {
    if (!window.JgaTdGame || !JgaTdGame.beginRun) {
      const msg = document.getElementById('msg');
      if (msg) msg.textContent = 'Noch einen Atemzug — das Schlachtfeld lädt…';
      window.addEventListener('jga-td-game-ready', beginPlay, { once: true });
      return;
    }
    if (window.JgaHorn) JgaHorn.ensureCtx();
    persistIdentity();
    if (startOverlay) {
      startOverlay.classList.remove('active');
      startOverlay.setAttribute('aria-hidden', 'true');
    }
    JgaTdGame.beginRun();
    if (window.JgaHorn) JgaHorn.blast('horn');
  }

  function openSettings() {
    syncFormFromStorage();
    if (settingsOverlay) {
      settingsOverlay.classList.add('active');
      settingsOverlay.setAttribute('aria-hidden', 'false');
    }
  }

  function closeSettings() {
    if (settingsOverlay) {
      settingsOverlay.classList.remove('active');
      settingsOverlay.setAttribute('aria-hidden', 'true');
    }
  }

  function saveSettings() {
    const s = JgaTdStorage.loadSettings();
    s.volume = (parseInt(document.getElementById('setVolume').value, 10) || 70) / 100;
    s.quietHorn = document.getElementById('setQuietHorn').checked;
    s.reducedMotion = document.getElementById('setReducedMotion').checked;
    s.audioEnabled = document.getElementById('setAudio').checked;
    JgaTdStorage.saveSettings(s);
    document.body.classList.toggle('reduced-motion', !!s.reducedMotion);
    if (window.JgaHorn) JgaHorn.applySettings(s);
    if (window.JgaTdGame && JgaTdGame.applyExternalSettings) JgaTdGame.applyExternalSettings();
    persistIdentity();
    closeSettings();
  }

  if (siegelInput) {
    siegelInput.addEventListener('input', updateRiderPreview);
    siegelInput.addEventListener('change', () => {
      const rune = (siegelInput.value || '').trim();
      if (!window.JgaTdStorage) return;
      // Switch to this Siegelrune save slot (creates empty slot if new)
      const meta = JgaTdStorage.selectSiegel(rune);
      if (nameInput) nameInput.value = meta.gefaehrte || '';
      if (riderPick && meta.riderFlavour) riderPick.value = meta.riderFlavour;
      updateRiderPreview();
      refreshMetaHud();
    });
  }
  if (nameInput) nameInput.addEventListener('input', updateRiderPreview);
  if (playBtn) playBtn.addEventListener('click', beginPlay);
  if (openSettingsBtn) openSettingsBtn.addEventListener('click', openSettings);
  const hudSettings = document.getElementById('hudSettingsBtn');
  if (hudSettings) hudSettings.addEventListener('click', openSettings);
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', closeSettings);
  if (saveSettingsBtn) saveSettingsBtn.addEventListener('click', saveSettings);

  // Default faction Rohan for Riddermark vibe
  const faction = document.getElementById('faction');
  if (faction) {
    const meta = JgaTdStorage.loadMeta();
    if (meta.lastFaction) faction.value = meta.lastFaction;
    else faction.value = 'Rohan';
  }

  syncFormFromStorage();
  refreshMetaHud();

  // Keep start overlay visible on load
  if (startOverlay) {
    startOverlay.classList.add('active');
    startOverlay.setAttribute('aria-hidden', 'false');
  }
})();
