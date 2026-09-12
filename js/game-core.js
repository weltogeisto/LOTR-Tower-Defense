/**
 * Prefer plain monolith / r00..r20 / q-pieces; fallback: inflate SOTA packed b64 (SoT still plain fragments).
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

  function loadRPieces() {
    var paths = [];
    for (var i = 0; i < 21; i++) paths.push('js/core/r' + String(i).padStart(2, '0') + '.js.txt');
    return Promise.all(paths.map(get)).then(function (parts) { run(parts.join('')); });
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

  function inflatePacked() {
    var n = 5;
    var paths = [];
    for (var i = 0; i < n; i++) paths.push('js/packed-sota/b' + String(i).padStart(2, '0') + '.txt');
    return Promise.all(paths.map(get)).then(function (parts) {
      var b64 = parts.join('');
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      var ds = new DecompressionStream('gzip');
      var stream = new Blob([bytes]).stream().pipeThrough(ds);
      return new Response(stream).text().then(run);
    });
  }

  get('js/game-core.source.js')
    .then(run)
    .catch(function () { return loadRPieces(); })
    .catch(function () { return loadQuarterPieces(); })
    .catch(function () { return inflatePacked(); })
    .catch(fail);
})();
