#!/usr/bin/env bash
# Regenerate data/data.js from data/curated_stations.csv (run from any cwd).
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
exec python3 scripts/csv-to-datajs.py
