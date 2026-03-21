#!/bin/bash
# run-tests.sh — Master verification pipeline for Wallet SDK documentation
#
# Usage:
#   bash run-tests.sh                    # Tier 1 only (standalone)
#   bash run-tests.sh --devnet           # Tiers 1-3 (with devnet)
#   bash run-tests.sh --skip-pdf         # Skip PDF generation

set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

DEVNET=false
SKIP_PDF=false

for arg in "$@"; do
  case "$arg" in
    --devnet) DEVNET=true ;;
    --skip-pdf) SKIP_PDF=true ;;
  esac
done

echo "=== Wallet SDK Verification Pipeline ==="
echo ""

# Step 1: Extract API surface
echo "--- Step 1: Extract API surface ---"
node /app/tools/extract-api-surface.mjs --json > /app/state/api-surface.json
node /app/tools/extract-api-surface.mjs --markdown > /app/state/api-surface.md
SYMBOLS=$(node -e "const d=JSON.parse(require('fs').readFileSync('/app/state/api-surface.json','utf-8')); let t=0; for(const p of d.packages) for(const e of p.entry_points) t+=e.symbols.length; console.log(t)")
echo "Extracted $SYMBOLS symbols"
echo ""

# Step 2: Aggregate evidence (run all verification scripts)
echo "--- Step 2: Aggregate evidence ---"
node /app/tools/aggregate-evidence.mjs
echo ""

# Step 3: Tier 1 — Standalone type-check tests
echo "--- Step 3: Tier 1 — Type-check tests ---"
npx tsc --noEmit
echo "Type-check passed"
echo ""

# Step 4: Tier 1 — Run standalone examples
echo "--- Step 4: Tier 1 — Standalone examples ---"
for test in ts-tests/tier1-*.mjs; do
  if [ -f "$test" ]; then
    echo "  Running $(basename $test)..."
    node "$test"
  fi
done
echo ""

if [ "$DEVNET" = true ]; then
  # Step 5: Tier 3 — Devnet tests
  echo "--- Step 5: Tier 3 — Devnet tests ---"
  for test in ts-tests/tier3-*.mjs; do
    if [ -f "$test" ]; then
      echo "  Running $(basename $test)..."
      node "$test"
    fi
  done
  echo ""
fi

# Steps 6-8 run from /app (tools use relative paths to state/ and docs/)
cd /app

# Step 6: Check coverage
echo "--- Step 6: Check coverage ---"
node /app/tools/check-coverage.mjs
echo ""

# Step 7: Assemble documentation
echo "--- Step 7: Assemble documentation ---"
node /app/tools/assemble-wallet-docs.mjs
echo ""

# Step 8: Generate PDF
if [ "$SKIP_PDF" = false ]; then
  echo "--- Step 8: Generate PDF ---"
  node /app/tools/generate-pdf.mjs
  echo ""
fi

echo "=== Pipeline complete ==="
