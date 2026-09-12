/**
 * Assembles plain readable canvas core from js/core/pXX.js.txt (no gzip/base64).
 * Prefers monolithic js/game-core.source.js when present.
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

  function get(path) {
    return fetch(path, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + path);
      return r.text();
    });
  }

  function loadParts() {
    var paths = [];
    for (var i = 0; i < 12; i++) {
      paths.push('js/core/p' + String(i).padStart(2, '0') + '.js.txt');
    }
    return Promise.all(paths.map(get)).then(function (parts) { run(parts.join('')); });
  }

  get('js/game-core.source.js').then(run).catch(function () {
    return loadParts();
  }).catch(fail);
})();
