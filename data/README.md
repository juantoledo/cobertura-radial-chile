# Datos — Cobertura Radial Chile

Archivos de datos para el mapa y la lista de repetidoras.

---

## Archivos

| Archivo | Descripción |
|---------|-------------|
| `curated_stations.csv` | Fuente de verdad. Listado de repetidoras curado. |
| `data.js` | Generado desde el CSV. Contiene `NODES`, `VERSION` y `REGION_COLORS`. |

---

## Origen y curación

Los datos provienen del [listado oficial SUBTEL](https://www.subtel.gob.cl/) y pueden curarse en `curated_stations.csv` para corregir errores de la fuente (coordenadas, frecuencias, nombres, etc.).

---

## Pipeline

`data.js` se genera automáticamente con:

```bash
python scripts/csv-to-datajs.py
```

El script lee `curated_stations.csv` y produce `data.js`. Se ejecuta en CI antes del deploy.

---

## Formato de curated_stations.csv

Columnas: `signal`, `nombre`, `comuna`, `ubicacion`, `lat`, `lon`, `range_km`, `potencia`, `ganancia`, `banda`, `rx`, `tx`, `tono`, `region`, `otorga`, `vence`, `isEcholink`, `echoLinkConference`. `isEcholink`: 1/true/yes para Sí. `echoLinkConference`: nombre de la conferencia Echolink.
