/* Readable core module — Reiter der Riddermark TD (fan homage) */
function updateWavePreview(){
  const waveEl = document.getElementById('waveEnemies');
  if(!waveEl) return;

  const nextWave = wave + 1;
  const enemyCount = 1 + Math.floor(wave / 5);
  const hasFlying = wave >= 1;
  const hasBoss = true;

  let bits = [];
  bits.push(`${enemyCount} Krieger`);
  if(hasFlying) bits.push('Flieger');
  if(hasBoss) bits.push('Boss');
  waveEl.textContent = bits.join(' · ');
}

// Helpers for 2D array

/**
 * Reset core game state back to its starting values.  This function
 * reinstates resources, lives, wave counters and clears all
 * towers, enemies, projectiles and summons.  It is invoked when
 * changing maps so that the player starts each new template on an
 * even footing rather than continuing from a lost game.  Calling
 * resetGame() does not set up a new interval or duplicate event
 * listeners; it simply reinitialises variables and refreshes the UI.
 */

function loadTemplate(name){
  obstacles = make2D(false);
  // Reset towers, enemies and bullets when switching maps
  towers = [];
  enemies = [];
  bullets = [];
  // Clear any castle data unless the selected map redefines it
  castleData = null;
  if(name === 'corridors'){
    // create narrow corridors with central plaza
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        if(r===2||r===ROWS-3) continue;
        obstacles[r][c] = true;
      }
    }
    for(let r=3;r<ROWS-3;r++){
      for(let c=3;c<COLS-3;c++) obstacles[r][c]=false;
    }
    for(let c=5;c<COLS-5;c+=4){ obstacles[3][c]=true; obstacles[ROWS-4][c]=true; }
  } else if(name === 'islands'){
    const coords = [[2,3],[2,4],[2,5],[4,8],[4,9],[5,8],[7,4],[7,5],[6,11],[7,11]];
    coords.forEach(([r,c]) => obstacles[r][c] = true);
  } else if(name === 'bent'){
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        obstacles[r][c] = false;
      }
    }
    const sr = spawn.row;
    const c1 = Math.floor(COLS / 4);
    const r2 = sr + Math.floor(ROWS / 4);
    const c3 = Math.floor(COLS * 3 / 4);
    for(let c=0; c<COLS; c++) obstacles[sr][c] = true;
    for(let c=0; c<=c1; c++) obstacles[sr][c] = false;
    for(let c=c3; c<COLS; c++) obstacles[sr][c] = false;
    for(let r=0; r<ROWS; r++) obstacles[r][c1] = true;
    for(let r=sr; r<=r2; r++) obstacles[r][c1] = false;
    for(let c=0; c<COLS; c++) obstacles[r2][c] = true;
    for(let c=c1; c<=c3; c++) obstacles[r2][c] = false;
    for(let r=0; r<ROWS; r++) obstacles[r][c3] = true;
    for(let r=sr; r<=r2; r++) obstacles[r][c3] = false;
  } else if(name === 'gondolin'){
    for(let r=0;r<ROWS;r++){
      for(let c=0;c<COLS;c++){
        obstacles[r][c] = false;
      }
    }
    const cw = Math.min(4, COLS - 2);
    const ch = Math.min(4, ROWS - 2);
    const startRow = Math.floor((ROWS - ch) / 2);
    const startCol = Math.floor((COLS - cw) / 2);
    for(let r=startRow; r<startRow + ch; r++){
      for(let c=startCol; c<startCol + cw; c++){
        obstacles[r][c] = true;
      }
    }
    castleData = { row: startRow, col: startCol, w: cw, h: ch };
  }
  obstacles[spawn.row][spawn.col] = false;
  obstacles[goal.row][goal.col] = false;
  recomputeBlocked();
  enemies = [];
  generateDecorations();
  if(typeof markGroundDirty === 'function') markGroundDirty();
  ui();
}

function startNextWave(){
  if(lives <= 0 || gameOver) return;
  wave++;
  if(wave >= VICTORY_WAVE) {
    showVictory();
    return;
  }
  enemyHP += 1 + Math.floor(wave / 10);
  spawnMs = Math.max(550, spawnMs - 90);
  if(wave % 5 === 0){
    gold += 25 + wave;
    msg(`Schatzkammer: +${25+wave} für Welle ${wave}`);
  }
  ui();
  playSound('wave');
  if(window.JgaHorn) JgaHorn.blast(wave % 10 === 0 ? 'horn' : 'wave');
  spawnBoss();
  towers.forEach(t => { if(t.isHero) t.summonAvailable = true; });
  if(window.JgaTdStorage && wave % 5 === 0){
    JgaTdStorage.pushBuch(`Welle ${wave} — die Hörner der Mark erschallen`);
    renderRotesBuch();
  }
  if(window.JgaTdBridge){
    JgaTdBridge.emit('wave', { wave, score, ruhmRun, lives, gold });
  }
}

function startWaveInterval(){
  if(waveIntervalId) clearInterval(waveIntervalId);
  waveIntervalId = setInterval(() => {
    startNextWave();
  }, WAVE_INTERVAL_MS);
}

function armWaves(){
  if(wavesArmed) return;
  wavesArmed = true;
  startWaveInterval();
}
