/* Readable core module — Reiter der Riddermark TD (fan homage) */
function updateScoreBoard(){
  const scoreEl = document.getElementById('score');
  if(scoreEl){
    scoreEl.innerHTML = `Ruhm: <span class="accent">${score}</span> · Lauf: <span class="accent">${ruhmRun}</span> · Best: ${highScore}`;
  }
  const ruhmEl = document.getElementById('metaRuhm');
  const rankEl = document.getElementById('metaRank');
  if(window.JgaTdStorage){
    const meta = JgaTdStorage.loadMeta();
    const rank = JgaTdStorage.rankForRuhm(meta.totalRuhm);
    if(ruhmEl) ruhmEl.textContent = String(meta.totalRuhm);
    if(rankEl) rankEl.textContent = rank.name;
  }
  if(window.JgaTdBridge && runStarted){
    JgaTdBridge.emit('score', { score, ruhmRun, lives, gold, wave });
  }
}

function renderRotesBuch(){
  const ul = document.getElementById('buchList');
  if(!ul || !window.JgaTdStorage) return;
  const list = JgaTdStorage.loadBuch();
  ul.innerHTML = list.slice(0, 12).map(e => {
    const d = new Date(e.t);
    const ts = d.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'});
    return `<li><span class="accent">${ts}</span> — ${e.text}</li>`;
  }).join('') || '<li>Noch keine Heldentaten im Roten Buch…</li>';
}

function finalizeRun(victory){
  const bonus = victory ? Math.floor(wave * 2 + score * 0.5) : Math.floor(score * 0.35 + wave);
  const earned = Math.max(ruhmRun, bonus);
  ruhmRun = earned;
  let totalRuhm = earned;
  let rank = { name: 'Späher' };
  if(window.JgaTdStorage){
    const result = JgaTdStorage.awardRuhm(earned);
    totalRuhm = result.meta.totalRuhm;
    rank = result.after;
    const meta = result.meta;
    meta.bestScore = Math.max(meta.bestScore || 0, score);
    meta.bestWave = Math.max(meta.bestWave || 0, wave);
    JgaTdStorage.saveMeta(meta);
    highScore = meta.bestScore;
    const verb = victory ? 'Sieg' : 'Niederlage';
    JgaTdStorage.pushBuch(`${verb} — Welle ${wave}, +${earned} Ruhm → ${rank.name}`);
    renderRotesBuch();
    if(result.rankedUp){
      msg(`Rangaufstieg: ${result.before.name} → ${result.after.name}!`);
      if(window.JgaHorn) JgaHorn.blast('rankup');
    }
    updateScoreBoard();
  }
  if(window.JgaTdBridge){
    JgaTdBridge.emit('end', {
      victory: !!victory,
      wave, score,
      ruhmEarned: earned,
      totalRuhm,
      rank: rank.name,
      enemiesKilled: totalEnemiesKilled,
      towersBuilt: totalTowersBuilt
    });
  }
  runStarted = false;
}

function syncAudioUi(){
  const at = document.getElementById('audioToggle');
  if(at) at.textContent = audioEnabled ? '🔊' : '🔇';
  const setAudio = document.getElementById('setAudio');
  if(setAudio) setAudio.checked = !!audioEnabled;
}

function setAudioEnabled(enabled, persist){
  audioEnabled = !!enabled;
  if(persist !== false && window.JgaTdStorage){
    const s = JgaTdStorage.loadSettings();
    s.audioEnabled = audioEnabled;
    JgaTdStorage.saveSettings(s);
    if(window.JgaHorn) JgaHorn.applySettings(s);
  } else if(window.JgaHorn){
    JgaHorn.applySettings({ audioEnabled });
  }
  syncAudioUi();
}

function applyExternalSettings(){
  if(!window.JgaTdStorage) return;
  const s = JgaTdStorage.loadSettings();
  audioEnabled = s.audioEnabled !== false;
  syncAudioUi();
  document.body.classList.toggle('reduced-motion', !!s.reducedMotion);
  if(window.JgaHorn) JgaHorn.applySettings(s);
}

function setBridgePause(paused){
  gamePausedByBridge = !!paused;
  const po = document.getElementById('pauseOverlay');
  if(po){
    po.classList.toggle('active', !!paused);
    po.setAttribute('aria-hidden', paused ? 'false' : 'true');
  }
  if(paused){
    const stopBtn = document.getElementById('speedStop');
    if(stopBtn) stopBtn.click();
  } else {
    const s1 = document.getElementById('speed1');
    if(s1) s1.click();
  }
  if(window.JgaTdBridge) JgaTdBridge.emit('pause', { paused: !!paused });
}

window.JgaTdGame = {
  resetGame: () => { resetGame(); loadTemplate(mapSel.value); },
  pause: () => setBridgePause(true),
  resume: () => setBridgePause(false),
  getSnapshot: () => ({ wave, score, ruhmRun, lives, gold, gameOver }),
  applyExternalSettings,
  setAudioEnabled,
  renderRotesBuch
};

function resetGame(){
  gold = 200;
  lives = 20;
  wave = 1;
  score = 0;
  ruhmRun = 0;
  runStarted = true;
  enemyHP = 5;
  spawnMs = 2000;
  spawnTimer = 0;
  totalEnemiesKilled = 0;
  totalTowersBuilt = 0;
  gameOver = false;
  gamePausedByBridge = false;
  towers = [];
  enemies = [];
  bullets = [];
  summons = [];
  effects = [];
  particles = [];
  heroToMove = null;
  movingHeroMode = false;
  document.getElementById('gameOverOverlay').classList.remove('active');
  document.getElementById('victoryOverlay').classList.remove('active');
  const po = document.getElementById('pauseOverlay');
  if(po) po.classList.remove('active');
  ui();
  if(window.JgaTdStorage){
    const meta = JgaTdStorage.loadMeta();
    meta.runs = (meta.runs || 0) + 1;
    meta.lastFaction = factionSel.value;
    JgaTdStorage.saveMeta(meta);
    JgaTdStorage.pushBuch(`Ausritt #${meta.runs} — Banner: ${factionSel.value}`);
    renderRotesBuch();
  }
  if(window.JgaTdBridge){
    const meta = window.JgaTdStorage ? JgaTdStorage.loadMeta() : {};
    JgaTdBridge.emit('start', {
      runId: Date.now(),
      gefaehrte: meta.gefaehrte || '',
      siegelrune: meta.siegelrune || '',
      riderId: meta.riderId || '',
      faction: factionSel.value
    });
  }
  if(window.JgaHorn) JgaHorn.blast('horn');
}

function showGameOver() {
  if(gameOver) return;
  gameOver = true;
  playSound('gameOver');
  if(window.JgaHorn) JgaHorn.blast('boss');
  finalizeRun(false);
  document.getElementById('finalWave').textContent = String(wave);
  document.getElementById('finalScore').textContent = String(score);
  document.getElementById('enemiesKilled').textContent = String(totalEnemiesKilled);
  document.getElementById('towersBuilt').textContent = String(totalTowersBuilt);
  document.getElementById('bestScore').textContent = String(highScore);
  const er = document.getElementById('earnedRuhm');
  if(er) er.textContent = String(ruhmRun);
  document.getElementById('gameOverOverlay').classList.add('active');
  msg('Die Mark fällt — doch das Rote Buch erinnert.');
}

function showVictory() {
  if(gameOver) return;
  gameOver = true;
  playSound('victory');
  if(window.JgaHorn) JgaHorn.blast('victory');
  finalizeRun(true);
  document.getElementById('victoryWave').textContent = String(VICTORY_WAVE);
  document.getElementById('victoryScore').textContent = String(score);
  document.getElementById('victoryBest').textContent = String(highScore);
  const er = document.getElementById('victoryRuhm');
  if(er) er.textContent = String(ruhmRun);
  document.getElementById('victoryOverlay').classList.add('active');
  msg('Sieg der Reiter — Horn und Banner wehen!');
}

function ui(){
  goldEl.textContent = `Schätze: ${Math.floor(gold)}`;
  livesEl.textContent= `Leben: ${lives}`;
  waveEl.textContent = `Welle: ${wave}`;
  updatePlaceButton();
  updateHeroInfo();
  const iconEl = document.getElementById('factionIcon');
  if(iconEl) iconEl.textContent = FACTION_EMOJIS[factionSel.value] || '';
  updateScoreBoard();
  updateWavePreview();
}

function updateHeroInfo(){
  const infoEl = document.getElementById('heroInfo');
  const heroTower = towers.find(t => t.isHero);
  if(heroTower){
    const lvl = heroTower.lvl || 1;
    const kills = heroTower.heroKills || 0;
    infoEl.textContent = `Held – Rang ${lvl} | Siege ${kills}`;
  } else {
    infoEl.textContent = '';
  }
}
