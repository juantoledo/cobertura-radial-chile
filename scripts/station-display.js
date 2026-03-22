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

  window.hasStationFieldValue = hasStationFieldValue;
  window.stationFieldEmptyClass = stationFieldEmptyClass;
})();
