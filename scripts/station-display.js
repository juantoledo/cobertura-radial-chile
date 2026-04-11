/**
 * Shared helpers: when to show optional station fields (hide label+value if empty).
 * Loaded before map.js / list.js.
 */
(function () {
  /**
   * @param {*} v Raw field from node (string, number, null, undefined, …)
   * @returns {boolean} true if the UI should render a label+value for this field
   */
  function hasStationFieldValue(v) {
    if (v == null) return false;
    if (typeof v === 'number') return !isNaN(v);
    if (typeof v === 'boolean') return v === true;
    var s = String(v).trim();
    if (s === '') return false;
    if (s === '—' || s === '-' || s === '–') return false;
    return true;
  }

  /**
   * CSS class for table cells with no value (hides mobile ::before labels, etc.).
   * @param {*} v
   * @returns {string} ' cell-empty' or ''
   */
  function stationFieldEmptyClass(v) {
    return hasStationFieldValue(v) ? '' : ' cell-empty';
  }

  /**
   * Stable hue 0–359 from a string (for per-label chip colors).
   */
  function labelHueFromString(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
    }
    return Math.abs(h) % 360;
  }

  /**
   * HTML: space-separated labels → colored #hashtag chips (CSV stays without #).
   * Requires global escapeHtml (utils.js).
   */
  function formatStationLabelsHtml(raw) {
    if (typeof escapeHtml !== 'function') return '';
    var parts = String(raw).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '';
    var inner = parts
      .map(function (t) {
        if (t.charAt(0) === '#') t = t.slice(1);
        t = t.trim();
        if (!t) return '';
        var hue = labelHueFromString(t.toLowerCase());
        return (
          '<span class="station-label-tag" style="--label-h:' +
          hue +
          '">#' +
          escapeHtml(t) +
          '</span>'
        );
      })
      .filter(Boolean)
      .join('');
    if (!inner) return '';
    return '<div class="station-label-tags">' + inner + '</div>';
  }

  window.hasStationFieldValue = hasStationFieldValue;
  window.stationFieldEmptyClass = stationFieldEmptyClass;
  window.formatStationLabelsHtml = formatStationLabelsHtml;
})();
