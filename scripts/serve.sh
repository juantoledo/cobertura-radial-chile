#!/usr/bin/env bash
# Serve the static site over HTTP (default port 8080). Use from repo root context.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
PORT="${1:-8080}"
exec python3 -m http.server "$PORT"
