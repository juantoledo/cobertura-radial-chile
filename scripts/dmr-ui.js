/**
 * Shared compact DMR detail HTML (map sidebar + list modal).
 * Requires: loaded after data.js (uses r.isDMR / r.isEcholink).
 */
(function () {
  function escapeHtml(s) {
    if (s == null || s === '') return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function escapeAttr(s) {
    return String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  }

  /**
   * @param {object} r node
   * @param {'sidebar'|'modal'} context
   * @returns {string} safe HTML (empty if not DMR-only)
   */
  function buildDmrDetailHtml(r, context) {
    if (!r || !r.isDMR || r.isEcholink) return '';
    var parts = ['<span class="badge-dmr">DMR</span>'];
    var conf = (r.conference || '').trim();
    if (conf) {
      parts.push(
        '<span class="dmr-kv">' +
          '<abbr class="dmr-abbr" title="Conferencia / red">Red</abbr>' +
          '<span class="dmr-token dmr-token--net">' +
          escapeHtml(conf) +
          '</span></span>'
      );
    }
    function pushTokens(abbr, fullLabel, val, tokenClass) {
      if (val == null || String(val).trim() === '') return;
      var tk = String(val)
        .trim()
        .split(/\s+/)
        .map(function (t) {
          return '<span class="dmr-token ' + tokenClass + '">' + escapeHtml(t) + '</span>';
        })
        .join('');
      parts.push(
        '<span class="dmr-kv"><abbr class="dmr-abbr" title="' +
          escapeAttr(fullLabel) +
          '">' +
          escapeHtml(abbr) +
          '</abbr><span class="dmr-tokens">' +
          tk +
          '</span></span>'
      );
    }
    pushTokens('CC', 'Color', r.color, 'dmr-token--cc');
    pushTokens('Sl', 'Slot', r.slot, 'dmr-token--slot');
    pushTokens('TG', 'TG', r.tg, 'dmr-token--tg');
    return (
      '<span class="dmr-inline dmr-inline--' +
      (context === 'sidebar' ? 'sidebar' : 'modal') +
      '">' +
      parts.join('') +
      '</span>'
    );
  }

  window.buildDmrDetailHtml = buildDmrDetailHtml;
})();
