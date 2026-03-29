#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
OUTPUT_DIR="$DOCS_DIR/public/screenshots"
MAESTRO_OUTPUT_DIR="$SCRIPT_DIR/.maestro-output"

cleanup() {
  rm -rf "$MAESTRO_OUTPUT_DIR"
}
trap cleanup EXIT

echo "📸 Generating mobile documentation screenshots..."
echo ""

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"
mkdir -p "$MAESTRO_OUTPUT_DIR"

# 1. Run Maestro screenshot flows
# timeout ensures the script always exits even if Maestro hangs.
# The || captures the exit code so set -e doesn't abort before copying screenshots.
echo "Running Maestro screenshot flows..."
cd "$SCRIPT_DIR"
timeout 900 maestro test --output "$MAESTRO_OUTPUT_DIR" --env SCREENSHOT_DIR="$MAESTRO_OUTPUT_DIR" flows/ || MAESTRO_EXIT_CODE=$?
MAESTRO_EXIT_CODE=${MAESTRO_EXIT_CODE:-0}

# 2. Copy screenshots to docs public directory
echo ""
echo "Copying screenshots to $OUTPUT_DIR..."
find "$MAESTRO_OUTPUT_DIR" -name "*.png" -exec cp {} "$OUTPUT_DIR/" \;

echo ""
echo "✅ Screenshots saved to $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "  (no screenshots found)"

exit "$MAESTRO_EXIT_CODE"
