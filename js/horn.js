/**
 * Horn juice — short WebAudio fanfare for epic moments + quiet mode.
 */
(function (global) {
  let ctx = null;
  let settings = { volume: 0.7, audioEnabled: true, quietHorn: false, reducedMotion: false };

  function ensureCtx() {
    if (!ctx) {
      const AC = global.AudioContext || global.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});
    return ctx;
  }

  function applySettings(s) {
    settings = Object.assign({}, settings, s || {});
  }

  function tone(freq, t0, dur, type, gainPeak) {
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type || 'sawtooth';
    osc.frequency.setValueAtTime(freq, t0);
    const vol = (settings.volume || 0.7) * (gainPeak || 0.15);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  function blast(kind) {
    if (!settings.audioEnabled) return;
    if (settings.quietHorn && (kind === 'horn' || kind === 'wave' || kind === 'boss')) return;
    const c = ensureCtx();
    if (!c) return;
    const now = c.currentTime;
    if (kind === 'horn' || kind === 'victory') {
      tone(196, now, 0.35, 'sawtooth', 0.12);
      tone(294, now + 0.12, 0.4, 'triangle', 0.14);
      tone(392, now + 0.28, 0.55, 'sawtooth', 0.16);
      flash();
    } else if (kind === 'wave') {
      tone(220, now, 0.18, 'square', 0.08);
      tone(330, now + 0.1, 0.22, 'triangle', 0.1);
      flash(true);
    } else if (kind === 'boss') {
      tone(110, now, 0.4, 'sawtooth', 0.18);
      tone(165, now + 0.15, 0.35, 'square', 0.12);
      flash();
    } else if (kind === 'rankup') {
      tone(262, now, 0.2, 'triangle', 0.1);
      tone(330, now + 0.15, 0.25, 'triangle', 0.12);
      tone(392, now + 0.3, 0.35, 'triangle', 0.14);
      flash(true);
    } else if (kind === 'place') {
      tone(440, now, 0.08, 'sine', 0.06);
    } else if (kind === 'kill') {
      tone(180, now, 0.06, 'square', 0.04);
    }
  }

  function flash(soft) {
    if (settings.reducedMotion) return;
    const el = document.getElementById('hornFlash');
    if (!el) return;
    el.classList.add('blast');
    if (soft) el.style.opacity = '0.45';
    setTimeout(() => {
      el.classList.remove('blast');
      el.style.opacity = '';
    }, soft ? 180 : 320);
  }

  global.JgaHorn = { blast, applySettings, ensureCtx, flash };
})(typeof window !== 'undefined' ? window : globalThis);
