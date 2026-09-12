/**
 * Assembles plain readable canvas core from js/core/chunk*.js.txt
 * (source-of-truth fragments — not gzip/base64). Also accepts monolithic
 * js/game-core.source.js when present.
 */
(function () {
  function fail(err) {
    console.error('[JgaTd] game-core load failed', err);
    var msg = document.getElementById('msg');
    if (msg) msg.textContent = 'Spielkern konnte nicht geladen werden.';
    var play = document.getElementById('playBtn');
    if (play) { play.disabled = true; play.textContent = 'Laden fehlgeschlagen'; }
  }
  var play = document.getElementById('playBtn');
  if (play) { play.disabled = true; play.textContent = 'Schlachtfeld wird bereitet…'; }

  function run(code) {
    var s = document.createElement('script');
    s.text = code;
    document.head.appendChild(s);
    window.dispatchEvent(new CustomEvent('jga-td-game-ready'));
    if (play) { play.disabled = false; play.textContent = '🐎 In den Kampf'; }
  }

  function loadChunks() {
    var paths = [
      'js/core/chunk0.js.txt',
      'js/core/chunk1.js.txt',
      'js/core/chunk2.js.txt'
    ];
    return Promise.all(paths.map(function (p) {
      return fetch(p, { cache: 'no-cache' }).then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + p);
        return r.text();
      });
    })).then(function (parts) { run(parts.join('')); });
  }

  // Prefer monolithic readable source when available; fall back to chunks.
  fetch('js/game-core.source.js', { cache: 'no-cache' })
    .then(function (r) {
      if (!r.ok) throw new Error('no monolith');
      return r.text();
    })
    .then(run)
    .catch(function () {
      return loadChunks();
    })
    .catch(fail);
})();
