/**
 * Load order: plain monolith → r00..r20 → p00..p11 → inflate packed-sota (gzip b64 fallback).
 * Uncompressed fragments are the visual SoT; packed-sota must match that SoT.
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

  function loadJoined(prefix, count, pad, ext) {
    var paths = [];
    for (var i = 0; i < count; i++) {
      paths.push(prefix + String(i).padStart(pad, '0') + ext);
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
    .catch(function () { return loadJoined('js/core/r', 21, 2, '.js.txt'); })
    .catch(function () { return loadJoined('js/core/p', 12, 2, '.js.txt'); })
    .catch(function () { return inflatePacked(); })
    .catch(fail);
})();
