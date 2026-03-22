/**
 * Shared help modal — map and list views.
 * Handles open/close, focus management, and focus trap.
 */
var _helpLastFocus = null;

function openHelp() {
  var el = document.getElementById('help-overlay');
  if (!el) return;
  _helpLastFocus = document.activeElement;
  el.classList.add('open');
  el.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  el.focus();
}

function closeHelp() {
  var el = document.getElementById('help-overlay');
  if (el) {
    el.classList.remove('open');
    el.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  try { document.cookie = 'ra-help-seen=1; path=/; max-age=31536000'; } catch (e) {}
  if (_helpLastFocus && typeof _helpLastFocus.focus === 'function') {
    _helpLastFocus.focus();
  }
  _helpLastFocus = null;
}

(function initHelp() {
  var overlay = document.getElementById('help-overlay');
  if (overlay) {
    overlay.addEventListener('click', function (e) {
      if (e.target === this) closeHelp();
    });
  }

  document.addEventListener('keydown', function (e) {
    var el = document.getElementById('help-overlay');
    if (!el || !el.classList.contains('open')) return;

    if (e.key === 'Escape') {
      closeHelp();
      return;
    }

    if (e.key === 'Tab') {
      var focusable = el.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (!focusable.length) { e.preventDefault(); return; }
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === el) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last || document.activeElement === el) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  });

  if (!document.cookie.split(';').some(function (c) { return c.trim().startsWith('ra-help-seen='); })) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { setTimeout(openHelp, 400); });
    } else {
      setTimeout(openHelp, 400);
    }
  }
})();
