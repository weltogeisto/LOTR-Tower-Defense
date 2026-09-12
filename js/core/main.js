/* Readable core module — Reiter der Riddermark TD (fan homage) */
function update(dt){
  if(typeof hitstopT === 'number' && hitstopT > 0){
    hitstopT = Math.max(0, hitstopT - dt);
    updateEffects(dt);
    updateFloatNums(dt);
    updateParticles(dt);
    ambientT += dt;
    return;
  }
  // Scale delta time by the current gameSpeed so that movement,
  // spawning and other time-based mechanics speed up or slow down
  // accordingly.  When gameSpeed is zero, dt becomes zero and the
  // game effectively pauses.
  dt *= gameSpeed;
  spawnTimer += dt * 1000;
  if(spawnTimer >= spawnMs){
    spawnTimer -= spawnMs;
    // spawn multiple enemies based on wave number: +1 enemy every 5 waves
    const count = 1 + Math.floor((wave - 1) / 5);
    for(let i=0; i<count; i++){
      spawnEnemy();
    }
    // From wave 2 onwards, introduce flying enemies.  Spawn one flying
    // enemy per spawn cycle so that players must adjust their tower
    // composition to counter them.
    if(wave >= 2){
      spawnFlyingEnemy();
    }
  }
  updateEnemies(dt);
  updateTowers(dt);
  updateBullets(dt);
  // Advance summoned creatures so they move and apply damage before
  // rendering.  Summons are updated between bullets and effects so they
  // can interact with both enemies and the visual system.
  updateSummons(dt);
  // Advance and remove timed effects (explosions/hits)
  updateEffects(dt);
  // Update particle system
  updateParticles(dt);
  updateFloatNums(dt);
  ambientT += dt;
  // Decay screen shake
  shakeIntensity *= shakeDecay;
  if(shakeIntensity < 0.1) shakeIntensity = 0;
}

// Drawing
let lastTime = 0;
function loop(timestamp){
  if(!lastTime) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  // Performance-safe: clamp huge frames (tab switch) and respect bridge pause
  if(dt > 0.05) dt = 0.05;
  if(lives > 0 && !gamePausedByBridge){
    update(dt);
    draw();
  } else if(lives > 0){
    draw();
  }
  requestAnimationFrame(loop);
}

// Map templates
function init(){
  resize();
  initAudio();
  createPatterns();
  setForestBackground();
  updatePlaceButton();
  applyExternalSettings();
  ui();
  loadTemplate(mapSel.value);
  renderRotesBuch();
  requestAnimationFrame(loop);

  document.getElementById('restartBtn').addEventListener('click', () => {
    resetGame();
    loadTemplate(mapSel.value);
    armWaves();
    msg('Neuer Ausritt gestartet!');
  });
  document.getElementById('restartBtn2').addEventListener('click', () => {
    resetGame();
    loadTemplate(mapSel.value);
    armWaves();
    msg('Neuer Ausritt gestartet!');
  });

  document.getElementById('audioToggle').addEventListener('click', () => {
    setAudioEnabled(!audioEnabled, true);
    msg(audioEnabled ? 'Klang aktiv' : 'Stille der Mark');
  });

  startWaveBtn.addEventListener('click', () => {
    if(!runStarted){
      resetGame();
      loadTemplate(mapSel.value);
    }
    armWaves();
    startNextWave();
  });

  // Do not auto-start waves until the Reiter begins from the start screen
  if(window.JgaTdBridge){
    JgaTdBridge.setHandlers({
      onCommand(cmd){
        if(cmd === 'pause') setBridgePause(true);
        else if(cmd === 'resume') setBridgePause(false);
        else if(cmd === 'start'){
          resetGame();
          loadTemplate(mapSel.value);
          armWaves();
        }
        else if(cmd === 'mute'){
          setAudioEnabled(false, true);
          msg('Stille der Mark');
        }
        else if(cmd === 'unmute'){
          setAudioEnabled(true, true);
          msg('Klang aktiv');
        }
        else if(cmd === 'getState' && window.JgaTdBridge){
          JgaTdBridge.emit('score', window.JgaTdGame.getSnapshot());
        }
      }
    });
    JgaTdBridge.emit('ready', {
      version: 'jga-td-2.0-visual',
      title: 'Reiter der Riddermark — Turmverteidigung'
    });
  }

  // Expose arm for start screen
  window.JgaTdGame.armWaves = armWaves;
  window.JgaTdGame.beginRun = function(){
    resetGame();
    loadTemplate(mapSel.value);
    armWaves();
    setTimeout(() => {
      if(lives > 0 && !gameOver) spawnBoss();
    }, 10000);
  };
}


window.addEventListener('resize', () => { resize(); });
init();
try { window.dispatchEvent(new CustomEvent('jga-td-game-ready')); } catch(_){}
