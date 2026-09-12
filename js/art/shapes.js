/* Silhouette art — high-contrast outlines on dark grass, no emoji */
(function (global) {
  const FACTION_ACCENTS = {
    Gondor: '#8a9bb0', Rohan: '#e0bf4a', Isengard: '#9aab88', Mordor: '#d04545'
  };
  const BT = '#2a3548', BT_H = '#4a5a70', BE = '#3a1a1a', BE_H = '#6a3030';
  const OUT = '#05080c', RIM = 'rgba(230,236,245,0.72)';

  function shadow(ctx, s) {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.42, s * 0.36, s * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  function halo(ctx, s, a) {
    ctx.save();
    ctx.strokeStyle = a || 'rgba(232,197,71,0.35)';
    ctx.lineWidth = Math.max(1.2, s * 0.04);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  function fillStroke(ctx, s, fill, accent) {
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2.2, s * 0.09);
    ctx.strokeStyle = OUT;
    ctx.stroke();
    ctx.lineWidth = Math.max(1.1, s * 0.045);
    ctx.strokeStyle = RIM;
    ctx.stroke();
    if (accent) {
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.85;
      ctx.lineWidth = Math.max(1.4, s * 0.055);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }
  function rectBody(ctx, s, x, y, w, h, fill, accent) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    fillStroke(ctx, s, fill, accent);
  }

  function towerArtillery(ctx, size, t) {
    const s = size; shadow(ctx, s); halo(ctx, s, t);
    rectBody(ctx, s, -s * 0.28, -s * 0.1, s * 0.56, s * 0.48, BT, t);
    ctx.beginPath();
    ctx.moveTo(-s * 0.32, -s * 0.1);
    ctx.lineTo(0, -s * 0.48);
    ctx.lineTo(s * 0.32, -s * 0.1);
    ctx.closePath();
    fillStroke(ctx, s, BT_H, t);
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(2.4, s * 0.09);
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.28);
    ctx.lineTo(s * 0.4, -s * 0.35);
    ctx.stroke();
    ctx.strokeStyle = RIM;
    ctx.lineWidth = Math.max(1.2, s * 0.04);
    ctx.stroke();
    ctx.fillStyle = t || '#e0bf4a';
    ctx.beginPath();
    ctx.arc(s * 0.38, -s * 0.35, s * 0.08, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.stroke();
  }
  function towerSlow(ctx, size, t) {
    const s = size; shadow(ctx, s); halo(ctx, s, t);
    rectBody(ctx, s, -s * 0.22, -s * 0.05, s * 0.44, s * 0.42, BT, t);
    ctx.beginPath();
    ctx.arc(0, -s * 0.22, s * 0.28, Math.PI, 0);
    ctx.lineTo(s * 0.28, -s * 0.05);
    ctx.lineTo(-s * 0.28, -s * 0.05);
    ctx.closePath();
    fillStroke(ctx, s, '#1a2a20', t);
    ctx.strokeStyle = t || '#3d9b8f';
    ctx.lineWidth = Math.max(2, s * 0.07);
    ctx.beginPath();
    ctx.arc(0, -s * 0.22, s * 0.18, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  function towerRapid(ctx, size, t) {
    const s = size; shadow(ctx, s); halo(ctx, s, t);
    rectBody(ctx, s, -s * 0.2, -s * 0.15, s * 0.4, s * 0.5, BT, t);
    for (let i = -1; i <= 1; i++) {
      rectBody(ctx, s, i * s * 0.14 - s * 0.06, -s * 0.42, s * 0.12, s * 0.28, BT_H, t);
    }
    ctx.fillStyle = t || '#e0bf4a';
    ctx.fillRect(-s * 0.06, -s * 0.48, s * 0.12, s * 0.1);
  }
  function towerSniper(ctx, size, t) {
    const s = size; shadow(ctx, s); halo(ctx, s, t);
    ctx.beginPath();
    ctx.moveTo(-s * 0.18, s * 0.38);
    ctx.lineTo(-s * 0.12, -s * 0.35);
    ctx.lineTo(s * 0.12, -s * 0.35);
    ctx.lineTo(s * 0.18, s * 0.38);
    ctx.closePath();
    fillStroke(ctx, s, BT, t);
    ctx.strokeStyle = t || '#b8c5d6';
    ctx.lineWidth = Math.max(2.4, s * 0.08);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.35);
    ctx.lineTo(0, -s * 0.55);
    ctx.stroke();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.2, s * 0.04);
    ctx.stroke();
  }
  function towerAntiAir(ctx, size, t) {
    const s = size; shadow(ctx, s); halo(ctx, s, t);
    ctx.beginPath();
    ctx.arc(0, s * 0.05, s * 0.3, 0, Math.PI * 2);
    fillStroke(ctx, s, BT, t);
    ctx.strokeStyle = t || '#8a9bb0';
    ctx.lineWidth = Math.max(2.4, s * 0.09);
    ctx.beginPath();
    ctx.moveTo(-s * 0.35, -s * 0.15);
    ctx.lineTo(s * 0.35, -s * 0.35);
    ctx.moveTo(-s * 0.1, s * 0.05);
    ctx.lineTo(s * 0.4, -s * 0.4);
    ctx.stroke();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.3, s * 0.045);
    ctx.stroke();
  }
  function towerHero(ctx, size, t) {
    const s = size; shadow(ctx, s); halo(ctx, s, t);
    rectBody(ctx, s, -s * 0.26, -s * 0.05, s * 0.52, s * 0.42, BT, t);
    ctx.beginPath();
    ctx.moveTo(-s * 0.3, -s * 0.05);
    ctx.lineTo(-s * 0.3, -s * 0.4);
    ctx.lineTo(-s * 0.05, -s * 0.28);
    ctx.lineTo(s * 0.05, -s * 0.28);
    ctx.lineTo(s * 0.3, -s * 0.4);
    ctx.lineTo(s * 0.3, -s * 0.05);
    ctx.closePath();
    fillStroke(ctx, s, BT_H, t);
    ctx.fillStyle = t || '#e0bf4a';
    ctx.fillRect(s * 0.08, -s * 0.55, s * 0.04, s * 0.35);
    ctx.beginPath();
    ctx.moveTo(s * 0.12, -s * 0.55);
    ctx.lineTo(s * 0.38, -s * 0.48);
    ctx.lineTo(s * 0.12, -s * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.stroke();
  }

  const TOWERS = {
    artillery: towerArtillery, slow: towerSlow, rapid: towerRapid,
    sniper: towerSniper, antiAir: towerAntiAir, hero: towerHero
  };

  function enemyGrunt(ctx, size, accent) {
    const s = size; shadow(ctx, s); halo(ctx, s, accent);
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, s * 0.35);
    ctx.lineTo(-s * 0.32, -s * 0.05);
    ctx.lineTo(-s * 0.12, -s * 0.35);
    ctx.lineTo(s * 0.12, -s * 0.35);
    ctx.lineTo(s * 0.32, -s * 0.05);
    ctx.lineTo(s * 0.28, s * 0.35);
    ctx.closePath();
    fillStroke(ctx, s, BE, accent);
    ctx.fillStyle = accent || '#d04545';
    ctx.beginPath();
    ctx.arc(0, -s * 0.18, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.stroke();
  }
  function enemyBoss(ctx, size, accent) {
    const s = size; shadow(ctx, s); halo(ctx, s, accent);
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.38);
    ctx.lineTo(-s * 0.45, -s * 0.05);
    ctx.lineTo(-s * 0.2, -s * 0.45);
    ctx.lineTo(s * 0.2, -s * 0.45);
    ctx.lineTo(s * 0.45, -s * 0.05);
    ctx.lineTo(s * 0.4, s * 0.38);
    ctx.closePath();
    fillStroke(ctx, s, BE_H, accent);
    ctx.fillStyle = accent || '#d04545';
    ctx.beginPath();
    ctx.moveTo(-s * 0.15, -s * 0.5);
    ctx.lineTo(0, -s * 0.7);
    ctx.lineTo(s * 0.15, -s * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.8, s * 0.06);
    ctx.stroke();
  }
  function enemyFlyer(ctx, size, accent) {
    const s = size;
    ctx.fillStyle = 'rgba(0,0,0,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, s * 0.4, s * 0.3, s * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
    halo(ctx, s, accent);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.22, s * 0.14, 0, 0, Math.PI * 2);
    fillStroke(ctx, s, BT, accent);
    ctx.fillStyle = accent || '#8a9bb0';
    ctx.beginPath();
    ctx.moveTo(-s * 0.22, 0);
    ctx.lineTo(-s * 0.55, -s * 0.2);
    ctx.lineTo(-s * 0.2, s * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(s * 0.22, 0);
    ctx.lineTo(s * 0.55, -s * 0.2);
    ctx.lineTo(s * 0.2, s * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  function propRock(ctx, size) {
    const s = size; shadow(ctx, s);
    ctx.beginPath();
    ctx.moveTo(-s * 0.32, s * 0.2);
    ctx.lineTo(-s * 0.2, -s * 0.15);
    ctx.lineTo(s * 0.1, -s * 0.22);
    ctx.lineTo(s * 0.35, s * 0.05);
    ctx.lineTo(s * 0.22, s * 0.25);
    ctx.closePath();
    fillStroke(ctx, s, BT, null);
  }
  function propTree(ctx, size) {
    const s = size; shadow(ctx, s);
    ctx.fillStyle = '#12100a';
    ctx.fillRect(-s * 0.05, 0, s * 0.1, s * 0.3);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.45);
    ctx.lineTo(s * 0.28, s * 0.05);
    ctx.lineTo(-s * 0.28, s * 0.05);
    ctx.closePath();
    fillStroke(ctx, s, '#142218', null);
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.55);
    ctx.lineTo(s * 0.18, -s * 0.1);
    ctx.lineTo(-s * 0.18, -s * 0.1);
    ctx.closePath();
    fillStroke(ctx, s, '#1c3024', null);
  }
  function propRuin(ctx, size) {
    const s = size; shadow(ctx, s);
    rectBody(ctx, s, -s * 0.28, -s * 0.1, s * 0.2, s * 0.4, BT, null);
    rectBody(ctx, s, s * 0.05, 0, s * 0.18, s * 0.3, BT, null);
    rectBody(ctx, s, -s * 0.28, -s * 0.18, s * 0.52, s * 0.1, BT_H, null);
  }

  function landmarkTor(ctx, size) {
    const s = size;
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(4, s * 0.14);
    ctx.lineCap = 'square';
    ctx.beginPath();
    ctx.moveTo(-s * 0.4, s * 0.35);
    ctx.lineTo(-s * 0.4, -s * 0.15);
    ctx.quadraticCurveTo(-s * 0.4, -s * 0.5, 0, -s * 0.55);
    ctx.stroke();
    ctx.strokeStyle = RIM;
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.stroke();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(4, s * 0.14);
    ctx.beginPath();
    ctx.moveTo(s * 0.4, s * 0.35);
    ctx.lineTo(s * 0.4, -s * 0.05);
    ctx.lineTo(s * 0.22, -s * 0.2);
    ctx.stroke();
    const g = ctx.createRadialGradient(0, s * 0.2, 0, 0, s * 0.2, s * 0.7);
    g.addColorStop(0, 'rgba(61,155,143,0.5)');
    g.addColorStop(1, 'rgba(61,155,143,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, s * 0.25, s * 0.55, s * 0.22, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  function landmarkFeste(ctx, size) {
    const s = size; shadow(ctx, s);
    rectBody(ctx, s, -s * 0.45, -s * 0.15, s * 0.9, s * 0.55, BT, '#e0bf4a');
    rectBody(ctx, s, -s * 0.5, -s * 0.45, s * 0.28, s * 0.85, BT_H, '#e0bf4a');
    rectBody(ctx, s, s * 0.22, -s * 0.4, s * 0.28, s * 0.8, BT_H, '#e0bf4a');
    for (let i = 0; i < 5; i++) {
      rectBody(ctx, s, -s * 0.45 + i * s * 0.2, -s * 0.28, s * 0.1, s * 0.14, BT, null);
    }
    ctx.fillStyle = '#070b10';
    ctx.beginPath();
    ctx.moveTo(-s * 0.12, s * 0.4);
    ctx.lineTo(-s * 0.12, s * 0.05);
    ctx.quadraticCurveTo(0, -s * 0.08, s * 0.12, s * 0.05);
    ctx.lineTo(s * 0.12, s * 0.4);
    ctx.fill();
    const g = ctx.createRadialGradient(0, s * 0.15, 0, 0, s * 0.15, s * 0.7);
    g.addColorStop(0, 'rgba(201,162,39,0.55)');
    g.addColorStop(1, 'rgba(201,162,39,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, s * 0.1, s * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0bf4a';
    ctx.fillRect(s * 0.3, -s * 0.65, s * 0.05, s * 0.35);
    ctx.beginPath();
    ctx.moveTo(s * 0.35, -s * 0.65);
    ctx.lineTo(s * 0.55, -s * 0.55);
    ctx.lineTo(s * 0.35, -s * 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.stroke();
  }

  const PROPS = { rock: propRock, tree: propTree, ruin: propRuin };
  const ENEMIES = { grunt: enemyGrunt, boss: enemyBoss, flyer: enemyFlyer };
  const cache = { towers: {}, enemies: {}, props: {}, tor: null, feste: null, tile: 0, dpr: 1 };

  function bake(drawFn, cssSize, dpr, accent) {
    const px = Math.max(8, Math.round(cssSize * dpr));
    const c = document.createElement('canvas');
    c.width = px; c.height = px;
    const g = c.getContext('2d');
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.translate(cssSize / 2, cssSize / 2);
    drawFn(g, cssSize * 0.92, accent);
    return c;
  }
  function ensure(tile, dpr) {
    dpr = Math.min(dpr || 1, 2);
    if (cache.tile === tile && cache.dpr === dpr && cache.tor) return cache;
    cache.tile = tile; cache.dpr = dpr;
    cache.towers = {}; cache.enemies = {}; cache.props = {};
    const towerSize = tile * 0.95;
    Object.keys(TOWERS).forEach((k) => {
      cache.towers[k] = {};
      Object.keys(FACTION_ACCENTS).forEach((f) => {
        cache.towers[k][f] = bake(TOWERS[k], towerSize, dpr, FACTION_ACCENTS[f]);
      });
      cache.towers[k]._ = bake(TOWERS[k], towerSize, dpr, '#e0bf4a');
    });
    const enemySize = tile * 0.72;
    const bossSize = tile * 0.95;
    cache.enemies.grunt = bake(ENEMIES.grunt, enemySize, dpr, '#d04545');
    cache.enemies.boss = bake(ENEMIES.boss, bossSize, dpr, '#d04545');
    cache.enemies.flyer = bake(ENEMIES.flyer, enemySize, dpr, '#8a9bb0');
    const propSize = tile * 0.4;
    Object.keys(PROPS).forEach((k) => { cache.props[k] = bake(PROPS[k], propSize, dpr); });
    cache.tor = bake(landmarkTor, tile * 1.35, dpr);
    cache.feste = bake(landmarkFeste, tile * 2.2, dpr);
    return cache;
  }
  function drawCached(ctx, canvas, x, y, cssSize) {
    if (!canvas) return;
    ctx.drawImage(canvas, x - cssSize / 2, y - cssSize / 2, cssSize, cssSize);
  }

  global.JgaArt = {
    FACTION_ACCENTS, ensure,
    drawTower(ctx, type, faction, x, y, tile) {
      const c = ensure(tile, cache.dpr);
      const pack = c.towers[type] || c.towers.artillery;
      drawCached(ctx, (pack && (pack[faction] || pack._)) || null, x, y, tile * 0.95);
    },
    drawEnemy(ctx, kind, x, y, tile) {
      const c = ensure(tile, cache.dpr);
      const key = kind === 'boss' ? 'boss' : kind === 'flyer' ? 'flyer' : 'grunt';
      drawCached(ctx, c.enemies[key], x, y, key === 'boss' ? tile * 0.95 : tile * 0.72);
    },
    drawProp(ctx, kind, x, y, tile) {
      const c = ensure(tile, cache.dpr);
      drawCached(ctx, c.props[kind] || c.props.rock, x, y, tile * 0.4);
    },
    drawTor(ctx, x, y, tile) { drawCached(ctx, ensure(tile, cache.dpr).tor, x, y, tile * 1.35); },
    drawFeste(ctx, x, y, tile) { drawCached(ctx, ensure(tile, cache.dpr).feste, x, y, tile * 2.2); },
    setDpr(dpr) { cache.dpr = Math.min(dpr || 1, 2); cache.tile = 0; }
  };
})(window);
