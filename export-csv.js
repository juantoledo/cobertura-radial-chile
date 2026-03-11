/**
 * CSV export for repeater list — shared by mapa and lista
 */
function exportRepeatersCSV(rows) {
  const cols = ['signal','nombre','banda','comuna','ubicacion','rx','tx','tono','potencia','ganancia','region','vence'];
  const headers = ['Señal','Club/Titular','Banda','Comuna','Ubicación','RX (MHz)','TX (MHz)','Tono','Pot. W','Gan. dBi','Región','Vence'];
  const esc = v => (v == null || v === '') ? '' : (''+v).includes(',') || (''+v).includes('"') || (''+v).includes('\n') ? '"' + (''+v).replace(/"/g, '""') + '"' : ''+v;
  const csv = [headers.join(','), ...rows.map(r => cols.map(c => esc(r[c])).join(','))].join('\n');
  const blob = new Blob(['\ufeff'+csv], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'repetidores-chile-' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
}
