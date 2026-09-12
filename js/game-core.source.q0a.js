/* Reiter der Riddermark TD — SOTA dark cinematic core (fan homage, JGA-OS ready)
 * Unpacked readable source — night battlefield art direction, not light toy TD.
 */
(() => {

  const cvs = document.getElementById('canvas');
  const ctx = cvs.getContext('2d');
  const goldEl = document.getElementById('gold');
  const livesEl = document.getElementById('lives');
  const waveEl = document.getElementById('wave');
  const msgEl = document.getElementById('msg');
  const placeBtn = document.getElementById('placeBtn');
  const sellBtn = document.getElementById('sellBtn');
  const factionSel = document.getElementById('faction');
  const towerSel = document.getElementById('towerType');
  const mapSel = document.getElementById('map');
  const pauseOverlay = document.getElementById('pauseOverlay');

  // Grid settings
  // Increase the overall dimensions of the battlefield to provide more space
  // for towers and to accommodate longer, more tactical paths.  Doubling
  // both the columns and rows from the original design gives us a 28×20
  // arena.  The tile size will auto‑scale based on the container width
  // so the game still fits nicely on any screen.
  const COLS = 28;
  const ROWS = 20;
  let tile = 40;
  // The spawn and goal rows are anchored to the vertical midpoint of the
  // enlarged grid so the central corridor remains symmetric.
  const spawn = { col: 0, row: Math.floor(ROWS/2) };
  const goal  = { col: COLS-1, row: Math.floor(ROWS/2) };

  // Base game state
  let gold = 200;
  let lives = 20;
  let wave = 1;
  let enemyHP = 5;
  let spawnMs = 2000;
  let spawnTimer = 0;
  const WAVE_INTERVAL_MS = 20000;
  let waveIntervalId = null;

  // Score tracking: current run and persistent high score using localStorage
  let score = 0;
  let highScore = (window.JgaTdStorage && JgaTdStorage.loadMeta().bestScore) || parseInt(localStorage.getItem('maulHighScore')) || 0;
  let ruhmRun = 0;
  let runStarted = false;
  let particlesCap = 180;
  let gamePausedByBridge = false;

  // Statistics tracking
  let totalEnemiesKilled = 0;
  let totalTowersBuilt = 0;
  let gameOver = false;

  // Victory condition: survive to wave 50
  const VICTORY_WAVE = 50;

  // Audio system using Web Audio API
  let audioCtx = null;
  let audioEnabled = true;

  function initAudio() {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e) {
      console.warn('Web Audio API not supported');
      audioEnabled = false;
    }
  }

  function playSound(type) {
    if(!audioEnabled || !audioCtx) return;
    if(audioCtx.state === 'suspended') audioCtx.resume();

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    switch(type) {
      case 'shoot':
        osc.type = 'square';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
        break;
      case 'explosion':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
        break;
      case 'place':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.setValueAtTime(600, now + 0.05);
        osc.frequency.setValueAtTime(800, now + 0.1);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'sell':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
        break;
      case 'upgrade':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.setValueAtTime(450, now + 0.1);
        osc.frequency.setValueAtTime(600, now + 0.2);
        osc.frequency.setValueAtTime(900, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      case 'enemyDeath':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
        break;
      case 'bossDeath':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
        break;
      case 'wave':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(550, now + 0.15);
        osc.frequency.setValueAtTime(660, now + 0.3);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.45);
        break;
      case 'gameOver':
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
        osc.frequency.exponentialRampToValueAtTime(50, now + 1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1);
        osc.start(now);
        osc.stop(now + 1);
        break;
      case 'victory':
        // Fanfare
        const osc2 = audioCtx.createOscillator();
        const osc3 = audioCtx.createOscillator();
        const gain2 = audioCtx.createGain();
        const gain3 = audioCtx.createGain();
        osc2.connect(gain2); gain2.connect(audioCtx.destination);
        osc3.connect(gain3); gain3.connect(audioCtx.destination);

        osc.type = osc2.type = osc3.type = 'sine';
        osc.frequency.setValueAtTime(523, now); // C5
        osc2.frequency.setValueAtTime(659, now + 0.2); // E5
        osc3.frequency.setValueAtTime(784, now + 0.4); // G5

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
        gain2.gain.setValueAtTime(0.15, now + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.01, now + 1);
        gain3.gain.setValueAtTime(0.15, now + 0.4);
        gain3.gain.exponentialRampToValueAtTime(0.01, now + 1.2);

        osc.start(now); osc.stop(now + 0.8);
        osc2.start(now + 0.2); osc2.stop(now + 1);
        osc3.start(now + 0.4); osc3.stop(now + 1.2);
        break;
    }
  }

  // Screen shake effect
  let shakeIntensity = 0;
  let shakeDecay = 0.9;

  function triggerShake(intensity) {
    shakeIntensity = Math.max(shakeIntensity, intensity);
  }

  let obstacles = make2D(false);
  let towers = [];
  let enemies = [];
  let bullets = [];

  // For path and building
  let blocked = make2D(false);
  let placing = false;
  let selling = false;

  // Data for the special central castle used in the Gondolin map.  When
  // present, this object holds the row, column, width and height of the
  // castle area so the draw routine can render an icon on top.  Null
  // indicates no castle on the current map.
  let castleData = null;

  // Game speed multiplier.  1× is normal speed.  Larger values accelerate
  // enemy movement, bullet travel and spawn timing.  A value of 0 pauses
  // most in-game actions.  Controlled via the Speed buttons in the UI.
  let gameSpeed = 1;

  // Placement ghost
  let ghost = {active:false, col:0, row:0, valid:false};

  // Tower currently hovered over for displaying its range; null when none
  let hoverTower = null;

  // Summoned creatures created by hero abilities.  These units travel along
  // the path and damage the first enemy they collide with before
  // disappearing.  Each entry contains position, path, index, speed,
  // damage, icon and a reference to the hero that summoned it so kills can
  // be attributed correctly.
  let summons = [];

  // Move‑hero mode state.  When the player toggles move mode, they must
  // select a hero and then a target square for relocation.  The
  // variables below track whether move mode is active and which hero is
  // currently selected for movement.
  let movingHeroMode = false;
  let heroToMove = null;

  // Tower cost display update
  function updatePlaceButton() {
    const faction = factionSel.value;
    const ttype = towerSel.value;
    const baseCost = TOWER_DATA[faction][ttype].baseCost;
    placeBtn.textContent = `Bauen (${baseCost})`;
  }

  // Tower definitions per faction
  // Each tower: baseCost, base stats (damage, range (tiles), cooldown (s), splash (tiles), slow {p,d}, dot {dps,d}, pierce (additional targets), critChance)
  // Upgrades: array with modifications (cost and adjustments)
  const TOWER_DATA = {
    // Detailed tower definitions per faction with real features
    Gondor: {
      artillery: {
        name: 'Eagle Nest',
        baseCost: 150,
        base: {
          damage: 50,
          range: 10,
          cooldown: 5,
          splash: 2,
          slow: {p: 0, d: 0},
          dot: {dps: 0, d: 0},
          pierce: 0,
          crit: 0,
          stun: 0,
          knockback: 0,
          fear: {p: 0, d: 0},
          aura: { dps: 0, range: 0 },
          weakness: { amp: 0, d: 0 },
          bonus: 0
        },
        upgrades: [
          // Level 2: +20 splash damage, adds minor stun (1s)
          { cost: 100, damage: 20, stun: 1 },
          // Level 3: +2 range, -1s cooldown
          { cost: 150, range: 2, cooldown: -1 },