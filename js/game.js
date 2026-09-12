/**
 * Game loader — plain readable core (no gzip pack).
 * game-core.js is the source of truth and is loaded before this file.
 */
(function () {
  function ready() {
    window.dispatchEvent(new CustomEvent('jga-td-game-ready'));
    const play = document.getElementById('playBtn');
    if (play && play.disabled) {
      play.disabled = false;
      play.textContent = '🐎 In den Kampf';
    }
  }
  if (window.JgaTdGame) ready();
  else window.addEventListener('DOMContentLoaded', ready);
  // If core script already executed synchronously, fire immediately on next tick
  setTimeout(function () {
    if (window.JgaTdGame) ready();
  }, 0);
})();
