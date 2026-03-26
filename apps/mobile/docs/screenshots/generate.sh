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
  if [ -n "$MOCK_SERVER_PID" ]; then
    echo "Stopping mock server (PID $MOCK_SERVER_PID)..."
    kill "$MOCK_SERVER_PID" 2>/dev/null || true
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
pnpm --filter @cellarboss/mock-server start &
MOCK_SERVER_PID=$!

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
echo "Running Maestro screenshot flows..."
cd "$SCRIPT_DIR"
maestro test --output "$MAESTRO_OUTPUT_DIR" flows/

# 4. Copy screenshots to docs public directory
echo ""
echo "Copying screenshots to $OUTPUT_DIR..."
find "$MAESTRO_OUTPUT_DIR" -name "*.png" -exec cp {} "$OUTPUT_DIR/" \;

echo ""
echo "✅ Screenshots saved to $OUTPUT_DIR"
ls -la "$OUTPUT_DIR"/*.png 2>/dev/null || echo "  (no screenshots found)"
