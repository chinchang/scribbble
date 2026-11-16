#!/usr/bin/env bash
# Renders scripts/og-image/og.html to public/og.png (1200x630).
# Needs Google Chrome and ImageMagick. Tunables live in config.js.
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$DIR/../.." && pwd)"
OUT="${1:-$ROOT/public/og.png}"
CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
TMP="$(mktemp -d)"

# Rendered at 2x, then downsampled for cleaner edges.
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --force-device-scale-factor=2 --window-size=1200,630 \
  --virtual-time-budget=10000 \
  --screenshot="$TMP/og@2x.png" "file://$DIR/og.html" >/dev/null 2>&1

magick "$TMP/og@2x.png" -filter Lanczos -resize 1200x630 -strip \
  -define png:compression-level=9 "$OUT"
rm -rf "$TMP"
echo "Wrote $OUT"
