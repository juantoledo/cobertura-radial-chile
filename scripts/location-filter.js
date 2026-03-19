/**
 * Shared near-me (geolocation) filter logic for map and list views
 */
const NEAR_ME_RADIUS_KM = 100;

function haversine(la1, lo1, la2, lo2) {
  const R = 6371, dLa = (la2 - la1) * Math.PI / 180, dLo = (lo2 - lo1) * Math.PI / 180;
  const a = Math.sin(dLa/2)**2 + Math.cos(la1 * Math.PI/180) * Math.cos(la2 * Math.PI/180) * Math.sin(dLo/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNearMeLocation() {
  try {
    const s = sessionStorage.getItem('ra-nearme-location');
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

function setNearMeLocation(lat, lon) {
  sessionStorage.setItem('ra-nearme-location', JSON.stringify({ lat, lon }));
}

function clearNearMeLocation() {
  sessionStorage.removeItem('ra-nearme-location');
}

function updateNearMeButtonState() {
  const loc = getNearMeLocation();
  document.querySelectorAll('.location-btn, #btn-nearme').forEach(btn => {
    if (btn) btn.classList.toggle('active', !!loc);
  });
}

function requestNearMeLocation(onSuccess, onError) {
  if (!navigator.geolocation) {
    if (onError) onError();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    function (pos) {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      setNearMeLocation(lat, lon);
      if (onSuccess) onSuccess(lat, lon);
    },
    function () {
      if (onError) onError();
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
  );
}

/** Filter state sync between map and list views */
const FILTER_KEYS = ['search', 'filter-banda', 'filter-region', 'filter-echolink', 'filter-echolink-conference'];
const URL_PARAM_MAP = { 'search': 'search', 'filter-banda': 'banda', 'filter-region': 'region', 'filter-echolink': 'echolink', 'filter-echolink-conference': 'echolinkConference' };

function saveFilterState() {
  try {
    const state = {};
    FILTER_KEYS.forEach(id => {
      const el = document.getElementById(id);
      if (el) state[id] = el.value || '';
    });
    sessionStorage.setItem('ra-filter-state', JSON.stringify(state));
  } catch (e) { /* ignore */ }
}

function urlHasShareParams() {
  const params = new URLSearchParams(window.location.search);
  const keys = ['search', 'banda', 'region', 'echolink', 'echolinkConference', 'near', 'mlat', 'mlon', 'zoom', 'mode', 'signal'];
  return keys.some(k => params.has(k));
}

function loadFilterState() {
  try {
    const params = new URLSearchParams(window.location.search);
    const useUrl = urlHasShareParams();
    const state = {};

    if (useUrl) {
      FILTER_KEYS.forEach(id => {
        const paramKey = URL_PARAM_MAP[id];
        state[id] = paramKey != null && params.get(paramKey) != null ? params.get(paramKey) : '';
      });
      if (params.has('near')) {
        const near = params.get('near');
        const parts = String(near).split(',');
        const la = parseFloat(parts[0], 10);
        const lo = parseFloat(parts[1], 10);
        if (!isNaN(la) && !isNaN(lo)) setNearMeLocation(la, lo);
      } else {
        clearNearMeLocation();
      }
    } else {
      const s = sessionStorage.getItem('ra-filter-state');
      if (s) Object.assign(state, JSON.parse(s));
    }

    FILTER_KEYS.forEach(id => {
      const el = document.getElementById(id);
      if (el && state[id] !== undefined) el.value = state[id];
    });
  } catch (e) { /* ignore */ }
}

/**
 * Reset search, selects, near-me, session filter state; strip share params from URL.
 * Map/list pages set window.__radiomapAfterClearFilters to refresh UI (markers, table).
 */
function clearAllFilters() {
  try {
    FILTER_KEYS.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      if (el.tagName === 'SELECT') {
        el.selectedIndex = 0;
      } else {
        el.value = '';
      }
    });
    clearNearMeLocation();
    updateNearMeButtonState();
    saveFilterState();
    try {
      if (window.location.search) {
        var path = window.location.pathname || '/';
        var hash = window.location.hash || '';
        window.history.replaceState(null, '', path + hash);
      }
    } catch (e2) { /* ignore */ }
    if (typeof window.__radiomapAfterClearFilters === 'function') {
      window.__radiomapAfterClearFilters();
    }
  } catch (e) { /* ignore */ }
}

window.clearAllFilters = clearAllFilters;
