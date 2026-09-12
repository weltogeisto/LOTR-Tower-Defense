/* Render — DPR, terrain place, spline path, silhouette units */
const GRASS_SIZE = 64;
let patternGrass, patternPath, patternObstacle;
let decorations = [];
let effects = [];
let particles = [];
let groundLayer = null;
let groundDirty = true;
let cssW = 0, cssH = 0;
let viewDpr = 1;
let hitstopT = 0;
let fxSparks = [];

function reducedMotionOn(){
  if(document.body.classList.contains('reduced-motion')) return true;
  if(window.JgaTdStorage){
    try { return !!JgaTdStorage.loadSettings().reducedMotion; } catch(_){}
  }
  return false;
}

function hash2(x, y){
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function valueNoise(x, y){
  const x0 = Math.floor(x), y0 = Math.floor(y);
  const fx = x - x0, fy = y - y0;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2(x0, y0), b = hash2(x0 + 1, y0);
  const c = hash2(x0, y0 + 1), d = hash2(x0 + 1, y0 + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}
function fbm(x, y){
  let v = 0, a = 0.5, f = 1;
  for(let i = 0; i < 3; i++){
    v += a * valueNoise(x * f, y * f);
    a *= 0.5; f *= 2;
  }
  return v;
}

function createPatterns(){
  const gCanvas = document.createElement('canvas');
  gCanvas.width = GRASS_SIZE; gCanvas.height = GRASS_SIZE;
  const gctx = gCanvas.getContext('2d');
  gctx.fillStyle = MARK_PALETTE.grassDark;
  gctx.fillRect(0, 0, GRASS_SIZE, GRASS_SIZE);
  patternGrass = ctx.createPattern(gCanvas, 'repeat');

  const pCanvas = document.createElement('canvas');
  pCanvas.width = GRASS_SIZE; pCanvas.height = GRASS_SIZE;
  const pctx = pCanvas.getContext('2d');
  pctx.fillStyle = MARK_PALETTE.pathCore;
  pctx.fillRect(0, 0, GRASS_SIZE, GRASS_SIZE);
  patternPath = ctx.createPattern(pCanvas, 'repeat');

  const oCanvas = document.createElement('canvas');
  oCanvas.width = GRASS_SIZE; oCanvas.height = GRASS_SIZE;
  const octx = oCanvas.getContext('2d');
  octx.fillStyle = MARK_PALETTE.stoneDark;
  octx.fillRect(0, 0, GRASS_SIZE, GRASS_SIZE);
  patternObstacle = ctx.createPattern(oCanvas, 'repeat');
}

function setForestBackground(){
  try {
    document.body.style.backgroundImage = '';
    document.documentElement.style.setProperty('--battlefield-mist', MARK_PALETTE.mist);
  } catch(_){}
}

function spawnFloatNum(x, y, amount, crit){
  if(reducedMotionOn()) return;
  if(floatNums.length > 40) floatNums.shift();
  floatNums.push({
    x: x + (Math.random() * 10 - 5),
    y: y - 8,
    text: (crit ? '✧' : '') + Math.max(1, Math.round(amount)),
    life: 0.85, maxLife: 0.85, crit: !!crit,
    vy: -28 - Math.random() * 18
  });
}
function updateFloatNums(dt){
  for(let i = floatNums.length - 1; i >= 0; i--){
    const f = floatNums[i];
    f.life -= dt; f.y += f.vy * dt; f.vy *= 0.96;
    if(f.life <= 0) floatNums.splice(i, 1);
  }
}
function drawFloatNums(){
  floatNums.forEach(f => {
    const a = Math.max(0, f.life / f.maxLife);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `bold ${Math.round(tile * (f.crit ? 0.42 : 0.34))}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx.fillStyle = f.crit ? MARK_PALETTE.dmgCrit : MARK_PALETTE.dmgNorm;
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillText(f.text, f.x, f.y);
    ctx.restore();
  });
}

function lerp(a, b, t){ return a + (b - a) * t; }
function pathPointsFromCells(path){
  if(!path || path.length < 2) return [];
  // Simplify micro stair-steps (two opposite turns one cell apart) into diagonals
  const cells = path.map(c => ({ row: c.row, col: c.col }));
  const simp = [cells[0]];
  for(let i = 1; i < cells.length - 1; i++){
    const a = simp[simp.length - 1], b = cells[i], c = cells[i + 1];
    const elbow = (a.row === b.row && b.col === c.col) || (a.col === b.col && b.row === c.row);
    const short = Math.abs(a.row - b.row) + Math.abs(a.col - b.col) <= 1
              && Math.abs(b.row - c.row) + Math.abs(b.col - c.col) <= 1;
    if(elbow && short && i + 1 < cells.length - 0){
      simp.push({ row: (a.row + c.row) / 2, col: (a.col + c.col) / 2, _soft: true });
      i++;
      continue;
    }
    simp.push(b);
  }
  simp.push(cells[cells.length - 1]);
  const dedup = [simp[0]];
  for(let i = 1; i < simp.length; i++){
    const p = simp[i], q = dedup[dedup.length - 1];
    if(Math.abs(p.row - q.row) < 0.01 && Math.abs(p.col - q.col) < 0.01) continue;
    dedup.push(p);
  }
  const raw = dedup.map(c => ({ x: c.col * tile + tile / 2, y: c.row * tile + tile / 2, soft: !!c._soft }));
  if(raw.length < 3) return raw;
  const out = [raw[0]];
  for(let i = 1; i < raw.length - 1; i++){
    const a = raw[i - 1], b = raw[i], c = raw[i + 1];
    const abx = b.x - a.x, aby = b.y - a.y;
    const bcx = c.x - b.x, bcy = c.y - b.y;
    const cross = abx * bcy - aby * bcx;
    const colinear = Math.abs(cross) < 0.001;
    if(colinear){ out.push(b); continue; }
    const cut = Math.min(
      tile * (b.soft ? 1.05 : 0.95),
      Math.hypot(abx, aby) * 0.72,
      Math.hypot(bcx, bcy) * 0.72
    );
    const lenIn = Math.hypot(abx, aby) || 1;
    const lenOut = Math.hypot(bcx, bcy) || 1;
    const pIn  = { x: b.x - (abx / lenIn) * cut, y: b.y - (aby / lenIn) * cut };
    const pOut = { x: b.x + (bcx / lenOut) * cut, y: b.y + (bcy / lenOut) * cut };
    out.push(pIn);
    const steps = b.soft ? 14 : 12;
    for(let s = 1; s < steps; s++){
      const tt = s / steps;
      const ox = (1-tt)*(1-tt)*pIn.x + 2*(1-tt)*tt*b.x + tt*tt*pOut.x;
      const oy = (1-tt)*(1-tt)*pIn.y + 2*(1-tt)*tt*b.y + tt*tt*pOut.y;
      out.push({ x: ox, y: oy });
    }
    out.push(pOut);
  }
  out.push(raw[raw.length - 1]);
  return out;
}
function strokeSmoothPath(g, pts, width, color, alpha){
  if(pts.length < 2) return;
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(pts[0].x, pts[0].y);
  for(let i = 1; i < pts.length; i++){
    g.lineTo(pts[i].x, pts[i].y);
  }
  g.stroke();
  g.restore();
}

function rebuildGroundLayer(){
  if(!cssW || !cssH) return;
  const dpr = viewDpr;
  const c = document.createElement('canvas');
  c.width = Math.round(cssW * dpr);
  c.height = Math.round(cssH * dpr);
  const g = c.getContext('2d');
  g.setTransform(dpr, 0, 0, dpr, 0, 0);

  const gx = goal.col * tile + tile / 2;
  const gy = goal.row * tile + tile / 2;

  for(let r = 0; r < ROWS; r++){
    for(let ccol = 0; ccol < COLS; ccol++){
      const x = ccol * tile, y = r * tile;
      const n = fbm(ccol * 0.35, r * 0.35);
      const cx = x + tile / 2, cy = y + tile / 2;
      const distGoal = Math.hypot(cx - gx, cy - gy) / (Math.hypot(cssW, cssH) * 0.55);
      const edge = Math.max(
        Math.abs(ccol - (COLS - 1) / 2) / (COLS / 2),
        Math.abs(r - (ROWS - 1) / 2) / (ROWS / 2)
      );
      let shade = 0.55 + n * 0.35;
      shade = lerp(shade, shade * 0.75, Math.min(1, edge * 1.1));
      const warm = Math.max(0, 1 - distGoal);
      const rd = Math.floor(22 + shade * 22 + warm * 24);
      const grn = Math.floor(36 + shade * 32 + warm * 12);
      const bl = Math.floor(24 + shade * 16);
      g.fillStyle = `rgb(${rd},${grn},${bl})`;
      g.fillRect(x, y, tile + 1, tile + 1);
      const inCastle = castleData && ccol >= castleData.col && ccol < castleData.col + castleData.w
        && r >= castleData.row && r < castleData.row + castleData.h;
      if(obstacles[r][ccol] && !inCastle){
        g.fillStyle = MARK_PALETTE.stoneDark;
        g.globalAlpha = 0.7;
        g.beginPath();
        g.moveTo(cx - tile*0.28, cy + tile*0.2);
        g.lineTo(cx - tile*0.15, cy - tile*0.18);
        g.lineTo(cx + tile*0.22, cy - tile*0.12);
        g.lineTo(cx + tile*0.28, cy + tile*0.22);
        g.closePath();
        g.fill();
        g.globalAlpha = 1;
      }
    }
  }

  const light = g.createRadialGradient(gx, gy, tile * 0.5, gx, gy, tile * 8);
  light.addColorStop(0, 'rgba(201,162,39,0.16)');
  light.addColorStop(0.45, 'rgba(201,162,39,0.05)');
  light.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = light;
  g.fillRect(0, 0, cssW, cssH);

  const path = findPath();
  const pts = pathPointsFromCells(path);
  strokeSmoothPath(g, pts, tile * 1.05, 'rgba(12,8,4,0.45)', 1);
  strokeSmoothPath(g, pts, tile * 0.82, MARK_PALETTE.pathCore, 1);
  strokeSmoothPath(g, pts, tile * 0.58, '#4a3a24', 0.9);
  strokeSmoothPath(g, pts, tile * 0.22, '#6e5734', 0.75);
  strokeSmoothPath(g, pts, tile * 0.08, 'rgba(201,162,39,0.35)', 1);

  decorations.forEach(dec => {
    const cx = dec.col * tile + tile / 2;
    const cy = dec.row * tile + tile / 2;
    if(window.JgaArt){
      JgaArt.setDpr(dpr);
      JgaArt.ensure(tile, dpr);
      JgaArt.drawProp(g, dec.kind || 'rock', cx, cy, tile);
    }
  });

  groundLayer = c;
  groundDirty = false;
}
