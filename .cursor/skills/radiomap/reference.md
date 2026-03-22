# Radiomap — reference

Companion to [`SKILL.md`](SKILL.md). URL/query details, globals, script roles.

## `data/data.js` globals

| Symbol | Role |
|--------|------|
| `VERSION` | String; CI bumps on push to `main`; HTML uses `__VERSION__` for cache bust |
| `NODES` | Array of station objects consumed by map, list, export, share |
| `REGION_COLORS` | Map region name → hex color for map UI |

Node objects follow CSV-derived fields (see `data/README.md`); the generator may add normalized booleans or extra keys — inspect `csv-to-datajs.py` / sample `NODES[0]` when in doubt.

## CSV column order (one line)

`signal`, `nombre`, `comuna`, `ubicacion`, `lat`, `lon`, `range_km`, `potencia`, `ganancia`, `banda`, `rx`, `tx`, `tono`, `region`, `otorga`, `vence`, `isEcholink`, `conference`, `isDMR`, `color`, `slot`, `tg`, `website`

(Confirm against `data/README.md` if the pipeline adds columns.)

## Share / URL query parameters

Implemented in [`scripts/share-view.js`](../../scripts/share-view.js) (build) and [`scripts/location-filter.js`](../../scripts/location-filter.js) (`loadFilterState`, `urlHasShareParams`).

| Param | Notes |
|-------|--------|
| `search` | Free-text search |
| `banda` | Repeatable or comma-separated → band filters |
| `region` | Repeatable or comma-separated → region filters |
| `type` | Repeatable or comma-separated; filter types (e.g. echolink, dmr, radioclub) |
| `conference` | Repeatable or comma-separated |
| `echolink` | Legacy: `only` / `no` maps to type filters if `type` absent |
| `echolinkConference` | Legacy single conference if `conference` absent |
| `near` | `lat,lon` (decimal) for “cerca de mí” anchor |
| `nearRadius` | Radius km when distance semantics apply (near, signal anchor, etc.) |
| `signal` | Reference station for distance filter / map focus |
| `mlat`, `mlon`, `zoom` | Map center and zoom (map page) |
| `mode` | Map display mode (when shared from map) |

## Script map (repo root: `scripts/`)

| File | Role |
|------|------|
| `map.js` | Leaflet map, sidebar, neighbors, tooltips |
| `list.js` | Lista table, detail, mobile cards |
| `dmr-ui.js` | DMR chips / blocks in shared UI |
| `station-display.js` | Field visibility / empty helpers |
| `location-filter.js` | Near me, filters, URL/session restore |
| `share-view.js` | Build share URLs, copy/share handlers |
| `export-csv.js` | CSV download |
| `help.js` | Help overlay, focus trap |
| `theme.js` | Theme toggle / persistence |
| `utils.js` | Shared helpers |
| `csv-to-datajs.py` | CSV → `data/data.js` |

## Helper scripts

| Script | Command |
|--------|---------|
| Regenerate `data.js` | `./scripts/sync-data.sh` |
| Local HTTP server | `./scripts/serve.sh [PORT]` (default `8080`) |
