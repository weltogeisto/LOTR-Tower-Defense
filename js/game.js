/**
 * Loads the canvas game core from static text chunks (GitHub Pages friendly).
 */
(function () {
  const CHUNK_URLS = ['js/chunks/game.001.txt', 'js/chunks/game.002.txt', 'js/chunks/game.003.txt'];
  function run(code) {
    const s = document.createElement('script');
    s.text = code;
    document.head.appendChild(s);
    window.dispatchEvent(new CustomEvent('jga-td-game-ready'));
  }
  function fail(err) {
    console.error('[JgaTd] game load failed', err);
    const msg = document.getElementById('msg');
    if (msg) msg.textContent = 'Spielkern konnte nicht geladen werden.';
    const play = document.getElementById('playBtn');
    if (play) {
      play.disabled = true;
      play.textContent = 'Laden fehlgeschlagen';
    }
  }
  const play = document.getElementById('playBtn');
  if (play) {
    play.disabled = true;
    play.textContent = 'Schlachtfeld wird bereitet…';
  }
  Promise.all(CHUNK_URLS.map((u) => fetch(u).then((r) => {
    if (!r.ok) throw new Error(u + ' ' + r.status);
    return r.text();
  }))).then((parts) => {
    run(parts.join(''));
    if (play) {
      play.disabled = false;
      play.textContent = '🐎 In den Kampf';
    }
  }).catch(fail);
})();
