function markGroundDirty(){ groundDirty = true; }

function generateDecorations(){
  decorations = [];
  const p = findPath();
  const pathSet = new Set();
  if(p) p.forEach(cell => pathSet.add(`${cell.row}-${cell.col}`));
  const kinds = ['rock', 'rock', 'tree', 'tree', 'ruin'];
  const clusters = Math.max(4, Math.floor(ROWS * COLS * 0.035 * 0.3));
  let attempts = 0;
  while(decorations.length < clusters && attempts < 400){
    attempts++;
    const br = 1 + Math.floor(Math.random() * (ROWS - 2));
    const bc = 1 + Math.floor(Math.random() * (COLS - 2));
    if(bc > COLS * 0.25 && bc < COLS * 0.75 && br > ROWS * 0.3 && br < ROWS * 0.7) continue;
    const group = 1 + Math.floor(Math.random() * 3);
    const kind = kinds[Math.floor(Math.random() * kinds.length)];
    for(let g = 0; g < group; g++){
      const r = Math.max(0, Math.min(ROWS - 1, br + (g === 0 ? 0 : Math.floor(Math.random() * 3) - 1)));
      const c = Math.max(0, Math.min(COLS - 1, bc + (g === 0 ? 0 : Math.floor(Math.random() * 3) - 1)));
      if(obstacles[r][c]) continue;
      if((c === spawn.col && r === spawn.row) || (c === goal.col && r === goal.row)) continue;
      if(pathSet.has(`${r}-${c}`)) continue;
      if(decorations.some(d => d.row === r && d.col === c)) continue;
      decorations.push({ row: r, col: c, kind });
    }
  }
  markGroundDirty();
}

function updateEffects(dt){
  for(let i = effects.length - 1; i >= 0; i--){
    effects[i].age += dt;
    if(effects[i].age >= effects[i].life) effects.splice(i, 1);
  }
  for(let i = fxSparks.length - 1; i >= 0; i--){
    const s = fxSparks[i];
    s.age += dt;
    s.x += s.vx * dt;
    s.y += s.vy * dt;
    s.vy += 40 * dt;
    if(s.age >= s.life) fxSparks.splice(i, 1);
  }
  if(hitstopT > 0) hitstopT = Math.max(0, hitstopT - dt);
}

function requestHitstop(ms){
  if(reducedMotionOn()) return;
  hitstopT = Math.max(hitstopT, (ms || 40) / 1000);
}

function spawnSparks(x, y, n, color){
  if(reducedMotionOn()) return;
  for(let i = 0; i < n; i++){
    const a = Math.random() * Math.PI * 2;
    const sp = 40 + Math.random() * 80;
    fxSparks.push({
      x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 30,
      life: 0.25 + Math.random() * 0.25, age: 0,
      color: color || '#ffd166'
    });
  }
}

function createParticles(x, y, count, color, type){
  if(reducedMotionOn()){
    count = Math.min(count, 4);
  }
  const n = Math.min(count, particlesCap - particles.length);
  for(let i = 0; i < n; i++){
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 80,
      vy: (Math.random() - 0.5) * 80 - 20,
      life: type === 'ember' ? 0.7 : 0.45,
      age: 0,
      color: color || '#c9a227',
      type: type || 'spark',
      size: 1.5 + Math.random() * 2.5
    });
  }
}
function updateParticles(dt){
  for(let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.age += dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if(p.type === 'ember'){ p.vy -= 10 * dt; p.vx *= 0.98; }
    else { p.vy += 30 * dt; }
    if(p.age >= p.life) particles.splice(i, 1);
  }
}
function drawParticles(){
  particles.forEach(p => {
    const a = 1 - p.age / p.life;
    ctx.globalAlpha = Math.max(0, a);
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * (p.type === 'ember' ? a : 1), 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;
}

function drawBattlefieldAtmosphere(w, h){
  const g = ctx.createRadialGradient(w * 0.5, h * 0.45, Math.min(w, h) * 0.2, w * 0.5, h * 0.5, Math.max(w, h) * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.55, 'rgba(0,0,0,0.12)');
  g.addColorStop(1, MARK_PALETTE.vignette);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  if(!reducedMotionOn()){
    ctx.save();
    for(let i = 0; i < 14; i++){
      const px = ((i * 97 + ambientT * 12) % w);
      const py = ((i * 53 + ambientT * 7) % h);
      ctx.globalAlpha = 0.08 + 0.08 * Math.sin(ambientT * 1.5 + i);
      ctx.fillStyle = i % 3 === 0 ? '#e8c547' : '#b8c5d6';
      ctx.beginPath();
      ctx.arc(px, py, 1.1, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

function drawStatusPips(e){
  const indicatorY = e.y - tile * 0.72;
  let ox = -12;
  const pip = (color) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(e.x + ox, indicatorY, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ox += 9;
  };
  if(e.slowEffects && e.slowEffects.length) pip('#5eead4');
  if(e.dotEffects && e.dotEffects.length) pip('#ef5a5a');
  if(e.stunDur && e.stunDur > 0) pip('#e8c547');
  if(e.weaknessEffects && e.weaknessEffects.length) pip('#c084fc');
}
