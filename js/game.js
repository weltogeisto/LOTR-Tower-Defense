/**
 * Plain game-core loader shim — no gzip/DecompressionStream.
 * game-core.js is included via <script> before this file.
 */
(function () {
  const play = document.getElementById('playBtn');
  if (play) {
    play.disabled = false;
    if (!play.textContent || /bereit|fehlgeschlagen|Schlachtfeld/i.test(play.textContent)) {
      play.textContent = '🐎 In den Kampf';
    }
  }
  if (!window.JgaTdGame) {
    const msg = document.getElementById('msg');
    if (msg) msg.textContent = 'Spielkern konnte nicht geladen werden.';
    if (play) {
      play.disabled = true;
      play.textContent = 'Laden fehlgeschlagen';
    }
    console.error('[JgaTd] game-core missing — expected js/game-core.js');
    return;
  }
  window.dispatchEvent(new CustomEvent('jga-td-game-ready'));
})();
