/**
 * List view — table by region, filters, share
 * Requires: data/data.js (NODES, REGION_COLORS, VERSION), location-filter.js, export-csv.js, theme.js, help.js
 */
(function() {
  if (typeof NODES === 'undefined' || !NODES.length) return;

  if (typeof VERSION !== 'undefined') document.getElementById('app-version') && (document.getElementById('app-version').textContent = VERSION);
  document.getElementById('nodes-count') && (document.getElementById('nodes-count').textContent = NODES.length);

  const filterRegion = document.getElementById('filter-region');
  const regionNames = Object.keys(REGION_COLORS || {}).sort();
  regionNames.forEach(reg => {
    const opt = document.createElement('option');
    opt.value = reg === '' ? '__sin_region__' : reg;
    opt.textContent = reg || 'Sin región en el archivo de Subtel';
    filterRegion.appendChild(opt);
  });
  const filterConf = document.getElementById('filter-echolink-conference');
  if (filterConf) {
    const conferences = [...new Set(NODES.filter(r=>r.isEcholink).map(r=>r.echoLinkConference || '').filter(Boolean))].sort();
    conferences.forEach(c => {
      const o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      filterConf.appendChild(o);
    });
  }

  function parseDate(s) {
    if (!s) return null;
    const p = String(s).trim().split('-');
    if (p.length !== 3) return new Date(s);
    if (p[0].length === 4) return new Date(s);
    return new Date(parseInt(p[2],10), parseInt(p[1],10)-1, parseInt(p[0],10));
  }
  function venceClass(vence) {
    if (!vence) return '';
    const d = parseDate(vence);
    const now = new Date();
    const diff = (d - now) / (1000*60*60*24);
    if (diff < 0) return 'vence-expired';
    if (diff < 365) return 'vence-warn';
    return 'vence-ok';
  }
  function bandaClass(banda) {
    if (banda.includes('UHF')) return 'badge-uhf';
    return 'badge-vhf';
  }

  function render(filtered) {
    const main = document.getElementById('main-content');
    document.getElementById('shown-count').textContent = filtered.length;
    document.getElementById('total-count').textContent = NODES.length;
    document.getElementById('regions-count').textContent = filtered.length ? new Set(filtered.map(r => r.region || '')).size : 0;
    document.getElementById('clubs-count').textContent = filtered.length ? new Set(filtered.map(r => r.nombre).filter(Boolean)).size : 0;
    document.getElementById('filter-nearme').textContent = getNearMeLocation() ? ' · cerca de mí' : '';

    if (filtered.length === 0) {
      main.innerHTML = '<div class="no-results">No se encontraron resultados para la búsqueda actual.</div>';
      return;
    }

    const nearMe = getNearMeLocation();
    const showDistance = !!nearMe;

    const byRegion = {};
    regionNames.forEach(reg => { byRegion[reg] = []; });
    filtered.forEach(r => {
      const reg = r.region || '';
      if (byRegion[reg] !== undefined) byRegion[reg].push(r);
    });

    let regionsToShow = regionNames.filter(reg => byRegion[reg] && byRegion[reg].length > 0);
    if (nearMe && regionsToShow.length > 1) {
      regionsToShow.sort((a, b) => {
        const minA = Math.min(...byRegion[a].map(r => r._dist ?? 9999));
        const minB = Math.min(...byRegion[b].map(r => r._dist ?? 9999));
        return minA - minB;
      });
    }

    const labels = ['Señal','Banda','RX (MHz)','TX (MHz)','Tono','Pot. W','Club / Titular','Comuna','Ubicación','Vence','Compartir'];
    if (showDistance) labels.splice(2, 0, 'Distancia');

    let html = '';
    regionsToShow.forEach(reg => {
      const rows = byRegion[reg];
      if (!rows || !rows.length) return;

      html += `<div class="zone-group" data-region="${reg}">
        <div class="zone-header">
          <span class="zone-badge" style="border-color: ${REGION_COLORS[reg]||'#5e35b1'}; color: ${REGION_COLORS[reg]||'#5e35b1'}">${reg || 'Sin región en el archivo de Subtel'}</span>
          <span class="zone-count"><span>${rows.length}</span> repetidor${rows.length !== 1 ? 'es' : ''}</span>
        </div>
        <table class="rpt-table">
          <thead><tr>
            <th>Señal</th><th>Banda</th>
            ${showDistance ? '<th>Distancia</th>' : ''}
            <th>RX (MHz)</th><th>TX (MHz)</th><th>Tono</th><th>Pot. W</th>
            <th>Club / Titular</th><th>Comuna</th><th>Ubicación</th><th>Vence</th><th>Compartir</th>
          </tr></thead>
          <tbody>`;

      rows.forEach(r => {
        const vc = venceClass(r.vence);
        const bc = bandaClass(r.banda);
        const bandaShort = (r.banda || '').replace('/FM','');
        const echolinkBadge = r.isEcholink ? `<span class="badge-echolink" title="${(r.echoLinkConference || '').replace(/"/g,'&quot;')}">Echolink</span>` : '';
        const distCell = showDistance ? `<td class="cell-dist" data-label="Distancia">${r._dist != null ? r._dist + ' km' : '—'}</td>` : '';
        html += `<tr>
          <td class="cell-signal" data-label="${labels[0]}">${r.signal || '—'} ${echolinkBadge}</td>
          <td data-label="${labels[1]}"><span class="badge-banda ${bc}">${bandaShort}</span></td>
          ${distCell}
          <td class="cell-freq freq-rx" data-label="${labels[showDistance ? 3 : 2]}">${r.rx || '—'}</td>
          <td class="cell-freq freq-tx" data-label="${labels[showDistance ? 4 : 3]}">${r.tx || '—'}</td>
          <td class="cell-tone" data-label="${labels[showDistance ? 5 : 4]}">${r.tono || '—'}</td>
          <td class="cell-pot" data-label="${labels[showDistance ? 6 : 5]}">${r.potencia ? r.potencia + ' W' : '—'}</td>
          <td class="cell-club" data-label="${labels[showDistance ? 7 : 6]}"><strong>${r.nombre}</strong><small>${r.region}</small></td>
          <td class="cell-comuna" data-label="${labels[showDistance ? 8 : 7]}">${r.comuna || '—'}</td>
          <td class="cell-ub" data-label="${labels[showDistance ? 9 : 8]}" title="${r.ubicacion}">${r.ubicacion || '—'}</td>
          <td class="cell-vence ${vc}" data-label="${labels[showDistance ? 10 : 9]}">${r.vence || '—'}</td>
          <td class="cell-share" data-label="Compartir"><button type="button" class="share-btn" data-signal="${(r.signal||'').replace(/"/g,'&quot;')}" aria-label="Compartir ${(r.signal||'').replace(/"/g,'&quot;')}" title="Compartir detalles">↗</button></td>
        </tr>`;
      });

      html += `</tbody></table></div>`;
    });

    main.innerHTML = html;
  }

  function toggleNearMe() {
    const loc = getNearMeLocation();
    if (loc) {
      clearNearMeLocation();
      updateNearMeButtonState();
      render(getFiltered());
      return;
    }
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización.');
      return;
    }
    const btn = document.getElementById('btn-nearme');
    if (btn) btn.disabled = true;
    requestNearMeLocation(
      function () {
        updateNearMeButtonState();
        render(getFiltered());
        if (btn) btn.disabled = false;
      },
      function () {
        if (btn) btn.disabled = false;
        alert('No se pudo obtener tu ubicación. Verifica que el permiso esté concedido.');
      }
    );
  }
  window.toggleNearMe = toggleNearMe;

  function getFiltered() {
    const q = document.getElementById('search').value.trim().toLowerCase();
    const banda = document.getElementById('filter-banda').value;
    const region = document.getElementById('filter-region').value;
    const echolink = document.getElementById('filter-echolink').value;
    const echolinkConference = (document.getElementById('filter-echolink-conference') || {}).value || '';
    const nearMe = getNearMeLocation();

    let result = NODES.filter(r => {
      if (region === '__sin_region__') { if (r.region) return false; }
      else if (region && r.region !== region) return false;
      if (banda && !r.banda.includes(banda)) return false;
      if (echolink === 'only' && !r.isEcholink) return false;
      if (echolink === 'no' && r.isEcholink) return false;
      if (echolinkConference && echolink !== 'no' && r.echoLinkConference !== echolinkConference) return false;
      if (q) {
        const haystack = [r.signal, r.nombre, r.comuna, r.ubicacion, r.region, r.rx, r.tx, r.tono, r.banda, r.echoLinkConference].filter(Boolean).join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (nearMe && (r.lat == null || r.lon == null || haversine(nearMe.lat, nearMe.lon, r.lat, r.lon) > NEAR_ME_RADIUS_KM)) return false;
      return true;
    });

    if (nearMe && result.length > 0) {
      result = result.slice().map(r => ({ ...r, _dist: (r.lat != null && r.lon != null) ? Math.round(haversine(nearMe.lat, nearMe.lon, r.lat, r.lon)) : null }));
      result.sort((a, b) => (a._dist ?? 9999) - (b._dist ?? 9999));
    }
    return result;
  }

  function shareStation(signal) {
    const r = NODES.find(n => n.signal === signal);
    if (!r) return;
    const lines = [
      r.signal + (r.nombre ? ' — ' + r.nombre : ''),
      'Banda: ' + (r.banda || '—'),
      'RX: ' + (r.rx || '—') + ' MHz · TX: ' + (r.tx || '—') + ' MHz',
      'Tono: ' + (r.tono ? r.tono + ' Hz' : '—'),
      (r.isEcholink ? 'Echolink' + (r.echoLinkConference ? ': ' + r.echoLinkConference : '') : ''),
      'Comuna: ' + (r.comuna || '—') + ' · Región: ' + (r.region || '—'),
      'Ubicación: ' + (r.ubicacion || '—'),
      'Radiomap — https://www.radiomap.cl/'
    ].filter(Boolean);
    const text = lines.join('\n');
    const title = 'Radiomap — ' + (r.signal || 'Repetidora');
    if (navigator.share) {
      navigator.share({ title, text, url: 'https://www.radiomap.cl/' }).catch(() => {});
    } else {
      fallbackCopy(text);
    }
  }
  function fallbackCopy(text) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof alert === 'function') alert('Detalles copiados al portapapeles.');
    }).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Detalles copiados al portapapeles.');
    });
  }

  document.getElementById('main-content').addEventListener('click', function (e) {
    const btn = e.target.closest('.share-btn');
    if (btn && btn.dataset.signal !== undefined) shareStation(btn.dataset.signal);
  });

  ['search','filter-banda','filter-region','filter-echolink','filter-echolink-conference'].forEach(id => {
    const el = document.getElementById(id);
    if (el) ['input','change'].forEach(ev => el.addEventListener(ev, () => render(getFiltered())));
  });

  updateNearMeButtonState();

  function closeMenu() {
    document.getElementById('header-menu').classList.remove('open');
    document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
  }

  document.getElementById('menu-toggle').addEventListener('click', function() {
    const menu = document.getElementById('header-menu');
    const open = menu.classList.toggle('open');
    this.setAttribute('aria-expanded', open);
  });

  function getExportCriteria() {
    const banda = document.getElementById('filter-banda');
    const region = document.getElementById('filter-region');
    const echolink = document.getElementById('filter-echolink');
    const echolinkConference = document.getElementById('filter-echolink-conference');
    const search = document.getElementById('search');
    return {
      banda: banda ? banda.value : '',
      region: region ? region.value : '',
      echolink: echolink ? echolink.value : '',
      echoLinkConference: echolinkConference ? echolinkConference.value : '',
      search: search ? search.value.trim() : '',
      nearMe: !!getNearMeLocation()
    };
  }
  document.querySelectorAll('#btn-download-csv, #btn-download-csv-menu').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      exportRepeatersCSV(getFiltered(), getExportCriteria());
      closeMenu();
    });
  });

  document.addEventListener('click', function(e) {
    const menu = document.getElementById('header-menu');
    const toggle = document.getElementById('menu-toggle');
    if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) {
      closeMenu();
    }
  });

  render(getFiltered());
})();
