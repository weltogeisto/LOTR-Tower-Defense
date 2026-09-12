/**
 * Game ready shim — readable core modules load via index.html script tags.
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
  setTimeout(function () {
    if (window.JgaTdGame) ready();
  }, 0);
})();
