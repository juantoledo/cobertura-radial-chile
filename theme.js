/**
 * Dark/Light theme toggle — shared across mapa and lista
 * Uses cookies (works with file://) — key: ra-theme
 */
(function() {
  const COOKIE_KEY = 'ra-theme';

  function getTheme() {
    try {
      var m = document.cookie.match(new RegExp('(^|\\s)' + COOKIE_KEY + '=([^;]+)'));
      return (m && m[2]) || 'dark';
    } catch (e) { return 'dark'; }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      document.cookie = COOKIE_KEY + '=' + theme + '; path=/; max-age=31536000';
    } catch (e) {}
    updateToggleButton();
    if (typeof onThemeChange === 'function') onThemeChange(theme);
  }

  function toggleTheme() {
    setTheme(getTheme() === 'dark' ? 'light' : 'dark');
  }

  function updateToggleButton() {
    const btn = document.getElementById('theme-toggle');
    if (btn) {
      btn.setAttribute('aria-label', getTheme() === 'dark' ? 'Modo claro' : 'Modo oscuro');
      btn.innerHTML = getTheme() === 'dark' ? '☀' : '☽';
    }
  }

  // Apply on load
  setTheme(getTheme());

  // Update button when DOM ready (script may load before body)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateToggleButton);
  } else {
    updateToggleButton();
  }

  // Expose for manual toggle
  window.toggleTheme = toggleTheme;
  window.getTheme = getTheme;
})();
