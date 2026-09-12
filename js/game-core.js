/**
 * Loads plain readable canvas core (no gzip/base64 pack).
 * Tries: monolith → q0a..q3c → r00..rN → p00..p11
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

  function loadQuarterPieces() {
    var paths = [];
    for (var q = 0; q < 4; q++) {
      for (var j = 0; j < 3; j++) {
        paths.push('js/game-core.source.q' + q + String.fromCharCode(97 + j) + '.js');
      }
    }
    return Promise.all(paths.map(get)).then(function (parts) { run(parts.join('')); });
  }

  function loadRPieces() {
    var paths = [];
    for (var i = 0; i < 21; i++) {
      paths.push('js/core/r' + String(i).padStart(2, '0') + '.js.txt');
    }
    return Promise.all(paths.map(get)).then(function (parts) { run(parts.join('')); });
  }

  function loadParts() {
    var paths = [];
    for (var i = 0; i < 12; i++) {
      paths.push('js/core/p' + String(i).padStart(2, '0') + '.js.txt');
    }
    return Promise.all(paths.map(get)).then(function (parts) { run(parts.join('')); });
  }

  get('js/game-core.source.js')
    .then(run)
    .catch(function () { return loadQuarterPieces(); })
    .catch(function () { return loadRPieces(); })
    .catch(function () { return loadParts(); })
    .catch(fail);
})();
