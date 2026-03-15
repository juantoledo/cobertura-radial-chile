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
