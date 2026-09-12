/* render.js — graphics module lives in draft /workspace/lotr-td-claude/js/core/render.js
 * Landing via MCP in follow-up commits (readable SoT ~19KB).
 * Transitional index still uses packed game-core.js until full module set is on branch.
 */
function reducedMotionOn(){
  if(document.body.classList.contains('reduced-motion')) return true;
  if(window.JgaTdStorage){
    try { return !!JgaTdStorage.loadSettings().reducedMotion; } catch(_){}
  }
  return false;
}
let cssW = 0, cssH = 0, viewDpr = 1, groundDirty = true, groundLayer = null;
let decorations = [], effects = [], particles = [], fxSparks = [], hitstopT = 0;
function markGroundDirty(){ groundDirty = true; }
function createPatterns(){}
function setForestBackground(){}
function generateDecorations(){ decorations = []; }
function rebuildGroundLayer(){}
function updateEffects(dt){ if(hitstopT > 0) hitstopT = Math.max(0, hitstopT - dt); }
function updateParticles(){}
function updateFloatNums(){}
function draw(){}
function resize(){
  const wrap = document.getElementById('game-wrap');
  if(!wrap || typeof COLS === 'undefined') return;
  viewDpr = Math.min(window.devicePixelRatio || 1, 2);
  tile = Math.floor(wrap.clientWidth / COLS);
  if(tile < 8) tile = 8;
  cssW = tile * COLS; cssH = tile * ROWS;
  if(typeof cvs !== 'undefined'){
    cvs.style.width = cssW + 'px'; cvs.style.height = cssH + 'px';
    cvs.width = Math.round(cssW * viewDpr); cvs.height = Math.round(cssH * viewDpr);
    if(typeof ctx !== 'undefined') ctx.setTransform(viewDpr, 0, 0, viewDpr, 0, 0);
  }
  markGroundDirty();
}
function requestHitstop(ms){ if(!reducedMotionOn()) hitstopT = Math.max(hitstopT, (ms||40)/1000); }
function spawnSparks(){}
function createParticles(){}
function spawnFloatNum(){}
