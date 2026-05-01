# Radiomap exporters

Each subfolder here is a radio/software export format. Adding a new format requires three steps: creating `reference.csv`, running the generator, and implementing the mapping logic.

---

## Directory layout

```
scripts/exporter/
├── README.md               ← this file
├── generate-exporter-mapper.py  (at scripts/, not here)
├── registry.js             ← auto-generated; lists all formats for the download dialog
└── chirp/
    ├── reference.csv       ← defines the target column schema (source of truth)
    └── mapper.js           ← auto-generated exporter JS (edit only inside generate-exporter-mapper.py)
```

---

## Station data fields available for mapping

Every row passed to an exporter is a station object from `NODES` (defined in `data/data.js`). Available fields:

| Field | Type | Example | Notes |
|---|---|---|---|
| `signal` | string | `CE3RVP` | Callsign / identifier |
| `nombre` | string | `RADIO CLUB VALPARAÍSO` | Club or owner name |
| `rx` | string (MHz) | `146.940` | Receive frequency |
| `tx` | string (MHz) | `146.340` | Transmit frequency |
| `tono` | string (Hz) | `82.5` | CTCSS tone; empty if none |
| `banda` | string | `VHF/FM` | Band descriptor |
| `ubicacion` | string | `CERRO ALEGRE` | Physical location name |
| `comuna` | string | `VALPARAÍSO` | Municipality |
| `region` | string | `REGIÓN DE VALPARAÍSO` | Region |
| `potencia` | string (W) | `25` | TX power in watts |
| `isDMR` | bool/string | `true` / `""` | DMR station flag |
| `isEcholink` | bool/string | `true` / `""` | Echolink station flag |
| `conference` | string | `PEANUT` | Network/conference name |
| `notes` | string | | Free-form notes |

---

## How to add a new format

### Step 1 — Create the folder, `reference.csv`, and `settings.json`

```
scripts/exporter/{format}/reference.csv
```

- `{format}` must be a lowercase slug with no spaces (e.g., `adms`, `ics`, `gb3`).
- `reference.csv` must have **exactly one row**: the column headers of the target format's import CSV, in order.
- No data rows are needed; the file is purely a schema definition.

Also create `settings.json` in the same folder:

```json
{
    "label": "ADMS (Yaesu)",
    "fn": "exportAdms",
    "url": "https://example.com/adms"
}
```

| Field | Required | Description |
|---|---|---|
| `label` | yes | Display name shown in the download dialog |
| `fn` | yes | Name of the bare JS function exposed by `mapper.js` |
| `url` | no | Link to the radio/software homepage; shown in the download dialog |

If `settings.json` is absent or a field is missing, the generator falls back to `fmt.upper()` for label and `export{Fmt}` for fn.

### Step 3 — Implement the mapping in `generate-exporter-mapper.py`

Add a `generate_{format}_mapper(headers)` function following the same pattern as `generate_chirp_mapper`, and add a branch for it in `main()`:

```python
if fmt == "chirp":
    content = generate_chirp_mapper(headers)
elif fmt == "adms":
    content = generate_adms_mapper(headers)   # ← add this
else:
    content = generate_stub_mapper(fmt, headers)
```

Key rules for the mapping function:

- Use `textwrap.dedent(f"""...""")` with `{{`/`}}` for literal JS braces.
- The function must expose exactly two bare JS functions (they become globals automatically — no `window.` needed in the declaration):
  - `export{Format}(rows, criteria)` — builds and downloads the CSV
  - `build{Format}Filename(criteria)` — returns the filename string
- The `fn` value in `settings.json` must match `export{Format}` exactly.
- Use `\r\n` as line separator if the target software requires Windows line endings; use `\n` otherwise.
- Do **not** add a BOM (`﻿`) unless the target explicitly requires it. (The generic Radiomap CSV does add one for Excel; CHIRP rejects it.)
- Skip rows the format cannot represent (e.g., CHIRP skips DMR stations) and keep the `Location`/channel counter contiguous.

### Step 4 — Run the generator

From the repo root:

```bash
python scripts/generate-exporter-mapper.py
```

This writes:
- `scripts/exporter/{format}/mapper.js` — the new exporter
- `scripts/exporter/registry.js` — updated with the new entry

The download dialog reads `registry.js` at runtime and adds a button for every entry automatically. No HTML or JS changes are needed.

### Step 5 — Verify

1. Serve locally: `./scripts/serve.sh 8080`
2. Open `http://localhost:8080/` or `/lista.html`
3. Click the **CSV** download button → the dialog should show the new format under "Para radio/software específico"
4. Download and open the file in the target software to confirm it imports correctly

---

## Regenerating after changes

`mapper.js` and `registry.js` are **generated files** — do not edit them directly. All logic lives in `generate-exporter-mapper.py`. After any change to the generator (field mapping, filename logic, column order), re-run:

```bash
python scripts/generate-exporter-mapper.py
```

The generator is idempotent and safe to run repeatedly.

---

## CRITICAL: changes are per format — never cross formats

Every format (`chirp`, `ft5dr`, etc.) has its own `generate_{format}_mapper()` function in `generate-exporter-mapper.py`. **A change requested for one format must only touch that format's function.** Field names, tone modes, power values, frequency precision, row counts, and column semantics differ between formats and are not interchangeable.

Examples:
- CHIRP uses `TSQL` for tone squelch; FT5DR uses `TONE` — do not unify them.
- CHIRP Location starts at 1; FT5DR channel starts at 1 — but the reasoning and padding rules are independent.
- FT5DR always outputs 900 fixed rows; CHIRP has no row limit — do not apply one format's constraint to the other.
- FT5DR frequencies trim trailing zeros; CHIRP uses `toFixed(6)` — keep them separate.

When a user asks to change a field value, a format string, or a column mapping, **always confirm or infer which format they mean** before editing. If ambiguous, ask.

---

## CHIRP-specific notes (for reference)

| Concern | Detail |
|---|---|
| No BOM | CHIRP's CSV parser rejects a leading `﻿` |
| CRLF endings | Required by CHIRP on Windows (`\r\n`) |
| DMR skipped | Rows where `isDMR` is truthy are silently excluded; `Location` counter stays contiguous |
| `DtcsCode` | Must be zero-padded 3-digit string: `"023"`, not `23` |
| `rToneFreq` / `cToneFreq` | Always present; default `88.5` even when `Tone` is empty |
| `Power` | Set to `1W` — users should set their own power per radio after import |
| `Name` max length | 16 characters (hardware limit for most CHIRP-supported radios) |
