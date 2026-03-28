#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
OUTPUT_DIR="$DOCS_DIR/public/screenshots"
MAESTRO_OUTPUT_DIR="$SCRIPT_DIR/.maestro-output"

MOCK_SERVER_URL="http://localhost:5174"
MOCK_SERVER_PID=""

cleanup() {
  if [ -n "${MOCK_SERVER_PID:-}" ]; then
    echo "Stopping mock server (PID $MOCK_SERVER_PID)..."
    # Kill entire process group
    kill -TERM -"$MOCK_SERVER_PID" 2>/dev/null || true
    wait "$MOCK_SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$MAESTRO_OUTPUT_DIR"
}
trap cleanup EXIT

echo "📸 Generating mobile documentation screenshots..."
echo ""

# Ensure output directory exists
mkdir -p "$OUTPUT_DIR"
mkdir -p "$MAESTRO_OUTPUT_DIR"

# 1. Start mock server
echo "Starting mock server..."
cd "$REPO_ROOT"
# Start mock server in its own process group
pnpm --filter @cellarboss/mock-server start &
MOCK_SERVER_PID=$!

# Ensure it has its own group
set +m

# 2. Wait for mock server to be ready
echo "Waiting for mock server..."
TIMEOUT=30
ELAPSED=0
until curl -sf "$MOCK_SERVER_URL/__test/healthcheck" > /dev/null 2>&1; do
  if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
    echo "❌ Mock server did not start within ${TIMEOUT}s"
    exit 1
  fi
  sleep 1
  ELAPSED=$((ELAPSED + 1))
done
echo "Mock server is ready."
echo ""

# 3. Run Maestro screenshot flows
# timeout ensures the script always exits even if Maestro hangs.
# The || captures the exit code so set -e doesn't abort before copying screenshots.
export SCREENSHOT_DIR="$MAESTRO_OUTPUT_DIR"
echo "Running Maestro screenshot flows..."
cd "$SCRIPT_DIR"
timeout 900 maestro test --output "$MAESTRO_OUTPUT_DIR" flows/ || MAESTRO_EXIT_CODE=$?
MAESTRO_EXIT_CODE=${MAESTRO_EXIT_CODE:-0}

# 4. Copy screenshots to docs public directory
echo ""
echo "Copying screenshots to $OUTPUT_DIR..."
find "$MAESTRO_OUTPUT_DIR" -name "*.png" -exec cp {} "$OUTPUT_DIR/" \;

echo ""
echo "✅ Screenshots saved to $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "  (no screenshots found)"

exit "$MAESTRO_EXIT_CODE"
