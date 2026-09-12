/**
 * Inflate packed game core (gzip+base64 parts) — no external deps.
 * Pack regenerated with valid gzip CRC so DecompressionStream works.
 */
(function () {
  function fail(err) {
    console.error('[JgaTd] packed load failed', err);
    const msg = document.getElementById('msg');
    if (msg) msg.textContent = 'Spielkern konnte nicht geladen werden.';
    const play = document.getElementById('playBtn');
    if (play) { play.disabled = true; play.textContent = 'Laden fehlgeschlagen'; }
  }
  const play = document.getElementById('playBtn');
  if (play) { play.disabled = true; play.textContent = 'Schlachtfeld wird bereitet…'; }

  function b64ToUint8(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  async function inflateGzip(bytes) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('DecompressionStream missing');
    }
    const ds = new DecompressionStream('gzip');
    const stream = new Blob([bytes]).stream().pipeThrough(ds);
    const ab = await new Response(stream).arrayBuffer();
    return new TextDecoder().decode(ab);
  }

  async function boot() {
    const parts = window.__JGA_TD_GZ_B64_PARTS || [];
    if (!parts.length) throw new Error('missing packed parts');
    const bytes = b64ToUint8(parts.join(''));
    const code = await inflateGzip(bytes);
    const s = document.createElement('script');
    s.text = code;
    document.head.appendChild(s);
    window.dispatchEvent(new CustomEvent('jga-td-game-ready'));
    if (play) { play.disabled = false; play.textContent = '🐎 In den Kampf'; }
  }

  boot().catch(fail);
})();
