function drawUnitHalo(x, y, r, accent){
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 1.25);
  g.addColorStop(0, 'rgba(235,240,250,0.28)');
  g.addColorStop(0.45, hexAlpha(accent || '#c9a227', 0.28));
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = accent || '#c9a227';
  ctx.globalAlpha = 0.7;
  ctx.lineWidth = Math.max(2, tile * 0.055);
  ctx.beginPath();
  ctx.arc(x, y, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}
function hexAlpha(hex, a){
  const h = (hex || '#c9a227').replace('#','');
  if(h.length !== 6) return `rgba(201,162,39,${a})`;
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
  return `rgba(${r},${g},${b},${a})`;
}

function draw(){
  const W = cssW || (tile * COLS);
  const H = cssH || (tile * ROWS);
  if(groundDirty || !groundLayer) rebuildGroundLayer();

  ctx.setTransform(viewDpr, 0, 0, viewDpr, 0, 0);
  ctx.fillStyle = MARK_PALETTE.nightMid;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  if(shakeIntensity > 0 && !reducedMotionOn()){
    const capped = Math.min(shakeIntensity, 6);
    ctx.translate((Math.random() - 0.5) * capped, (Math.random() - 0.5) * capped);
  }

  if(groundLayer){
    ctx.drawImage(groundLayer, 0, 0, W, H);
  }

  if(window.JgaArt){
    JgaArt.ensure(tile, viewDpr);
    JgaArt.drawTor(ctx, spawn.col * tile + tile / 2, spawn.row * tile + tile / 2, tile);
    if(castleData){
      const cx = (castleData.col + castleData.w / 2) * tile;
      const cy = (castleData.row + castleData.h / 2) * tile;
      JgaArt.drawFeste(ctx, cx, cy, tile);
    } else {
      JgaArt.drawFeste(ctx, goal.col * tile + tile / 2, goal.row * tile + tile / 2, tile);
    }
  }

  if(ghost.active && placing){
    const x = ghost.col * tile, y = ghost.row * tile;
    ctx.fillStyle = ghost.valid ? 'rgba(62,207,142,0.32)' : 'rgba(239,90,90,0.32)';
    roundRect(ctx, x + 2, y + 2, tile - 4, tile - 4, 7);
    ctx.fill();
    ctx.strokeStyle = ghost.valid ? 'rgba(120,240,180,0.85)' : 'rgba(255,140,140,0.85)';
    ctx.lineWidth = 2;
    roundRect(ctx, x + 2, y + 2, tile - 4, tile - 4, 7);
    ctx.stroke();
  }

  if(ghost.active){
    const rangeVal = (TOWER_DATA[factionSel.value] && TOWER_DATA[factionSel.value][towerSel.value])
      ? TOWER_DATA[factionSel.value][towerSel.value].base.range : 0;
    const gx = ghost.col * tile + tile / 2;
    const gy = ghost.row * tile + tile / 2;
    ctx.fillStyle = 'rgba(61,155,143,0.14)';
    ctx.beginPath(); ctx.arc(gx, gy, rangeVal * tile, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(61,155,143,0.65)';
    ctx.lineWidth = 1.5; ctx.setLineDash([6, 4]);
    ctx.beginPath(); ctx.arc(gx, gy, rangeVal * tile, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }
  if(!placing && hoverTower){
    const radius = (hoverTower.attrs && hoverTower.attrs.range ? hoverTower.attrs.range : 0) * tile;
    const cx = hoverTower.col * tile + tile / 2;
    const cy = hoverTower.row * tile + tile / 2;
    ctx.fillStyle = 'rgba(201,162,39,0.12)';
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(201,162,39,0.65)';
    ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]);
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
  }

  towers.forEach(t => {
    const cx = t.col * tile + tile / 2;
    const cy = t.row * tile + tile / 2;
    drawUnitHalo(cx, cy, tile * 0.42, FACTION_COLORS[t.faction] || '#c9a227');
    if(window.JgaArt){
      JgaArt.drawTower(ctx, t.isHero ? 'hero' : t.type, t.faction, cx, cy, tile);
    }
    if(t.isHero){
      ctx.strokeStyle = '#c9a227';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.arc(cx, cy, tile * 0.42, 0, Math.PI * 2); ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = FACTION_COLORS[t.faction] || '#8a94a6';
    ctx.beginPath();
    ctx.arc(cx + tile * 0.28, cy - tile * 0.28, tile * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = MARK_PALETTE.hudInk;
    ctx.font = `bold ${Math.round(tile * 0.22)}px "Segoe UI", system-ui, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(String(t.lvl), cx + tile * 0.28, cy - tile * 0.28);
  });

  enemies.forEach(e => {
    const kind = e.isBoss ? 'boss' : (e.isFlying ? 'flyer' : 'grunt');
    drawUnitHalo(e.x, e.y, tile * (e.isBoss ? 0.5 : 0.36), '#d04545');
    if(window.JgaArt) JgaArt.drawEnemy(ctx, kind, e.x, e.y, tile);
    if(e._flash && e._flash > 0){
      ctx.save();
      ctx.globalAlpha = Math.min(1, e._flash);
      ctx.strokeStyle = MARK_PALETTE.hitFlash;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(e.x, e.y, tile * (e.isBoss ? 0.48 : 0.36), 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    const maxHp = e.maxHp || enemyHP;
    if(e.hp < maxHp - 0.01){
      const barW = tile * 0.55, barH = 4;
      const bx = e.x - barW / 2;
      const by = e.y - tile * (e.isBoss ? 0.62 : 0.5);
      const ratio = Math.max(0, Math.min(1, e.hp / maxHp));
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      roundRect(ctx, bx, by, barW, barH, 2); ctx.fill();
      ctx.fillStyle = ratio > 0.35 ? '#3ecf8e' : '#c23b3b';
      roundRect(ctx, bx, by, barW * ratio, barH, 2); ctx.fill();
    }
    drawStatusPips(e);
  });

  summons.forEach(s => {
    if(window.JgaArt) JgaArt.drawEnemy(ctx, 'grunt', s.x, s.y, tile * 0.85);
  });

  bullets.forEach(b => {
    const isArt = b.type === 'artillery';
    if(!reducedMotionOn()){
      ctx.strokeStyle = isArt ? 'rgba(230,57,70,0.35)' : 'rgba(61,155,143,0.35)';
      ctx.lineWidth = isArt ? 3 : 2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
    }
    ctx.fillStyle = isArt ? '#ffd166' : '#5eead4';
    ctx.beginPath();
    ctx.arc(b.x2, b.y2, isArt ? 3.5 : 2.5, 0, Math.PI * 2);
    ctx.fill();
    if(b._muzzle && !reducedMotionOn()){
      ctx.fillStyle = 'rgba(255,220,140,0.7)';
      ctx.beginPath();
      ctx.arc(b.x1, b.y1, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  });

  fxSparks.forEach(s => {
    const a = 1 - s.age / s.life;
    ctx.globalAlpha = a;
    ctx.fillStyle = s.color;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  for(let i = 0; i < effects.length; i++){
    const eff = effects[i];
    const progress = eff.age / eff.life;
    if(progress >= 1) continue;
    ctx.globalAlpha = 1 - progress;
    if(eff.kind === 'impact'){
      ctx.strokeStyle = '#ffd166';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(eff.x, eff.y, tile * 0.15 + progress * tile * 0.25, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.fillStyle = '#ff8a65';
      ctx.beginPath();
      ctx.arc(eff.x, eff.y - progress * tile * 0.4, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawParticles();
  drawFloatNums();
  drawBattlefieldAtmosphere(W, H);
  ctx.restore();
}

function roundRect(ctx, x, y, w, h, r){
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function resize(){
  const wrap = document.getElementById('game-wrap');
  viewDpr = Math.min(window.devicePixelRatio || 1, 2);
  tile = Math.floor(wrap.clientWidth / COLS);
  if(tile < 8) tile = 8;
  cssW = tile * COLS;
  cssH = tile * ROWS;
  cvs.style.width = cssW + 'px';
  cvs.style.height = cssH + 'px';
  cvs.width = Math.round(cssW * viewDpr);
  cvs.height = Math.round(cssH * viewDpr);
  ctx.setTransform(viewDpr, 0, 0, viewDpr, 0, 0);
  if(window.JgaArt){ JgaArt.setDpr(viewDpr); JgaArt.ensure(tile, viewDpr); }
  markGroundDirty();
}

const _origGenerate = null;
