/**
 * Shared help modal — map and list views
 */
function openHelp() {
  var el = document.getElementById('help-overlay');
  if (el) { el.classList.add('open'); el.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; }
}
function closeHelp() {
  var el = document.getElementById('help-overlay');
  if (el) { el.classList.remove('open'); el.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; }
  try { document.cookie = 'ra-help-seen=1; path=/; max-age=31536000'; } catch (e) {}
}

(function initHelp() {
  document.getElementById('help-overlay') && document.getElementById('help-overlay').addEventListener('click', function(e) {
    if (e.target === this) closeHelp();
  });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && document.getElementById('help-overlay') && document.getElementById('help-overlay').classList.contains('open')) closeHelp();
  });
  if (!document.cookie.split(';').some(function(c) { return c.trim().startsWith('ra-help-seen='); })) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function() { setTimeout(openHelp, 400); });
    else setTimeout(openHelp, 400);
  }
})();
