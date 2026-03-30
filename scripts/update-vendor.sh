#!/usr/bin/env bash
# update-vendor.sh — Mechanical phase of vendor update for aletheia-midnight-wallet.
#
# This script performs the deterministic, non-AI parts of a vendor update:
#   1. Pin upstream/midnight-wallet to a target commit (or latest origin/main)
#   2. Discover package versions from workspace root and package.json files
#   3. Re-extract the API surface and diff against baseline
#   4. Check infrastructure Docker image versions from upstream compose
#   5. Optionally run the verification pipeline
#   6. Generate a structured change report
#
# Usage:
#   ./scripts/update-vendor.sh [TARGET_COMMIT]
#
# Exit codes:
#   0 — update completed, change report written
#   1 — fatal error
#   2 — no new commits (already up to date)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
UPSTREAM_DIR="$REPO_ROOT/upstream/midnight-wallet"
SNAPSHOT_FILE="$REPO_ROOT/state/snapshot.yaml"
CHANGE_REPORT="$REPO_ROOT/state/change-report.yaml"

TARGET_COMMIT="${1:-origin/main}"

# --- Helpers ---

log() { echo "▸ $*" >&2; }
die() { echo "FATAL: $*" >&2; exit 1; }

current_snapshot_commit() {
  if [ -f "$SNAPSHOT_FILE" ]; then
    grep -A1 "^primary:" "$SNAPSHOT_FILE" | grep "commit:" | awk '{print $2}' 2>/dev/null || echo "none"
  else
    echo "none"
  fi
}

pkg_field() {
  local file="$1" field="$2"
  node -e "console.log(require('$file')$field || 'unknown')" 2>/dev/null || echo "unknown"
}

wallet_pkg_version() {
  local pkg="$1"
  pkg_field "$UPSTREAM_DIR/packages/$pkg/package.json" ".version"
}

# --- Phase 1: Pull and pin upstream/midnight-wallet ---

log "Phase 1: Fetching upstream/midnight-wallet..."
cd "$UPSTREAM_DIR"
git fetch origin 2>&1 >&2

OLD_COMMIT=$(git rev-parse HEAD)
git checkout "$TARGET_COMMIT" -- 2>&1 >&2 || git checkout "$TARGET_COMMIT" 2>&1 >&2
NEW_COMMIT=$(git rev-parse HEAD)
NEW_SHORT=$(git rev-parse --short HEAD)

if [ "$OLD_COMMIT" = "$NEW_COMMIT" ]; then
  SNAPSHOT_COMMIT=$(current_snapshot_commit)
  if [ "$SNAPSHOT_COMMIT" = "$NEW_COMMIT" ] || [ "$SNAPSHOT_COMMIT" = "$NEW_SHORT" ]; then
    log "Already up to date at $NEW_SHORT — no changes."
    exit 2
  fi
  log "Commit unchanged ($NEW_SHORT) but snapshot needs refresh."
fi

log "midnight-wallet: $OLD_COMMIT → $NEW_COMMIT"

COMMIT_LOG=$(git log --oneline "$OLD_COMMIT..$NEW_COMMIT" 2>/dev/null || git log --oneline -10)

cd "$REPO_ROOT"

# --- Phase 2: Discover versions ---

log "Phase 2: Discovering versions..."

ROOT_PKG_MANAGER=$(pkg_field "$UPSTREAM_DIR/package.json" ".packageManager")
ROOT_NODE_ENGINE=$(pkg_field "$UPSTREAM_DIR/package.json" ".engines.node")

FACADE_VERSION=$(wallet_pkg_version "facade")
SHIELDED_VERSION=$(wallet_pkg_version "shielded-wallet")
UNSHIELDED_VERSION=$(wallet_pkg_version "unshielded-wallet")
DUST_VERSION=$(wallet_pkg_version "dust-wallet")
HD_VERSION=$(wallet_pkg_version "hd")
ADDRESS_VERSION=$(wallet_pkg_version "address-format")
CAPABILITIES_VERSION=$(wallet_pkg_version "capabilities")
RUNTIME_VERSION=$(wallet_pkg_version "runtime")

LEDGER_VERSION=$(pkg_field "$UPSTREAM_DIR/packages/facade/package.json" ".dependencies['@midnight-ntwrk/ledger-v8']")

log "facade: $FACADE_VERSION | shielded: $SHIELDED_VERSION | unshielded: $UNSHIELDED_VERSION | dust: $DUST_VERSION"
log "ledger: $LEDGER_VERSION | Node: $ROOT_NODE_ENGINE"

# --- Phase 3: Extract and diff API surface ---

log "Phase 3: Extracting API surface..."

OLD_SURFACE="$REPO_ROOT/state/api-surface.json"
OLD_SURFACE_BACKUP=""
if [ -f "$OLD_SURFACE" ]; then
  OLD_SURFACE_BACKUP=$(mktemp)
  cp "$OLD_SURFACE" "$OLD_SURFACE_BACKUP"
fi

UPSTREAM_DIR="$UPSTREAM_DIR" node "$REPO_ROOT/tools/extract-api-surface.mjs" --json > "$REPO_ROOT/state/api-surface.json"
UPSTREAM_DIR="$UPSTREAM_DIR" node "$REPO_ROOT/tools/extract-api-surface.mjs" --markdown > "$REPO_ROOT/state/api-surface.md"

NEW_EXPORT_COUNT=$(node -e "
  const d = require('$REPO_ROOT/state/api-surface.json');
  let t=0; for(const p of d.packages) for(const e of p.entry_points) t+=e.symbols.length;
  console.log(t);
")

API_CHANGED="false"
API_DIFF_OUTPUT=""
if [ -n "$OLD_SURFACE_BACKUP" ]; then
  API_DIFF_OUTPUT=$(UPSTREAM_DIR="$UPSTREAM_DIR" node "$REPO_ROOT/tools/extract-api-surface.mjs" --diff "$OLD_SURFACE_BACKUP" 2>&1) || API_CHANGED="true"
  rm -f "$OLD_SURFACE_BACKUP"
fi

log "API surface: $NEW_EXPORT_COUNT exports (changed: $API_CHANGED)"

# --- Phase 3.5: Check infrastructure versions from upstream compose ---

log "Phase 3.5: Checking infrastructure versions..."

UPSTREAM_COMPOSE="$UPSTREAM_DIR/infra/compose/docker-compose.yml"
UPSTREAM_DYNAMIC="$UPSTREAM_DIR/infra/compose/docker-compose-dynamic.yml"
INFRA_CHANGED="false"
NEW_NODE_IMG=""
NEW_INDEXER_IMG=""
NEW_PROOF_IMG=""

if [ -f "$UPSTREAM_COMPOSE" ]; then
  NEW_NODE_IMG=$(grep -oP 'midnight-node:\K[^\s"'"'"']+' "$UPSTREAM_COMPOSE" 2>/dev/null || echo "")
  NEW_INDEXER_IMG=$(grep -oP 'indexer-standalone:\K[^\s"'"'"']+' "$UPSTREAM_COMPOSE" 2>/dev/null || echo "")
fi
if [ -f "$UPSTREAM_DYNAMIC" ]; then
  NEW_PROOF_IMG=$(grep -oP 'proof-server:\K[^\s"'"'"']+' "$UPSTREAM_DYNAMIC" 2>/dev/null || echo "")
fi

if [ -n "$NEW_NODE_IMG" ] || [ -n "$NEW_INDEXER_IMG" ] || [ -n "$NEW_PROOF_IMG" ]; then
  log "Upstream infra: node=$NEW_NODE_IMG indexer=$NEW_INDEXER_IMG proof=$NEW_PROOF_IMG"
  OUR_COMPOSE="$REPO_ROOT/docker-compose.yml"
  if [ -f "$OUR_COMPOSE" ]; then
    CUR_NODE_IMG=$(grep -oP 'midnight-node:\K[^\s"'"'"']+' "$OUR_COMPOSE" 2>/dev/null || echo "")
    CUR_INDEXER_IMG=$(grep -oP 'indexer-standalone:\K[^\s"'"'"']+' "$OUR_COMPOSE" 2>/dev/null || echo "")
    CUR_PROOF_IMG=$(grep -oP 'proof-server:\K[^\s"'"'"']+' "$OUR_COMPOSE" 2>/dev/null || echo "")
    if [ "$CUR_NODE_IMG" != "$NEW_NODE_IMG" ] || [ "$CUR_INDEXER_IMG" != "$NEW_INDEXER_IMG" ] || [ "$CUR_PROOF_IMG" != "$NEW_PROOF_IMG" ]; then
      INFRA_CHANGED="true"
      log "Infrastructure versions differ from upstream"
      log "  node:    $CUR_NODE_IMG → $NEW_NODE_IMG"
      log "  indexer: $CUR_INDEXER_IMG → $NEW_INDEXER_IMG"
      log "  proof:   $CUR_PROOF_IMG → $NEW_PROOF_IMG"
    else
      log "Infrastructure versions match upstream"
    fi
  fi
else
  INFRA_CHANGED="unknown"
  log "No upstream compose.yml found"
fi

# --- Phase 4: Run verification pipeline ---

PIPELINE_EXIT=-1
if [ "${SKIP_PIPELINE:-}" != "1" ] && [ -f "$REPO_ROOT/workspace/run-tests.sh" ]; then
  log "Phase 4: Running verification pipeline..."
  PIPELINE_EXIT=0

  if [ -d /app/workspace ] && [ -f /app/workspace/run-tests.sh ]; then
    # Inside the toolchain container — run directly
    bash /app/workspace/run-tests.sh --skip-pdf 2>&1 || PIPELINE_EXIT=$?
  else
    # Outside the toolchain container — use docker compose
    docker compose -f "$REPO_ROOT/docker-compose.yml" run --rm --no-deps \
      toolchain-standalone bash /app/workspace/run-tests.sh --skip-pdf 2>&1 || PIPELINE_EXIT=$?
  fi

  if [ $PIPELINE_EXIT -eq 0 ]; then
    log "Pipeline: ALL PASSED"
  else
    log "Pipeline: FAILED (exit $PIPELINE_EXIT)"
  fi
else
  log "Phase 4: Skipped (SKIP_PIPELINE=1 or no pipeline found)"
fi

# --- Phase 5: Generate change report ---

log "Phase 5: Generating change report..."

cat > "$CHANGE_REPORT" << REPORT
# Change report generated by update-vendor.sh
# $(date -Iseconds)
schema: 1

upstream:
  repo: midnight-wallet
  old_commit: $OLD_COMMIT
  new_commit: $NEW_COMMIT
  commits: |
$(echo "$COMMIT_LOG" | sed 's/^/    /')

versions:
  facade: "$FACADE_VERSION"
  shielded: "$SHIELDED_VERSION"
  unshielded: "$UNSHIELDED_VERSION"
  dust: "$DUST_VERSION"
  hd: "$HD_VERSION"
  address_format: "$ADDRESS_VERSION"
  capabilities: "$CAPABILITIES_VERSION"
  runtime: "$RUNTIME_VERSION"
  ledger: "$LEDGER_VERSION"
  node_engine: "$ROOT_NODE_ENGINE"
  package_manager: "$ROOT_PKG_MANAGER"

api_surface:
  total_exports: $NEW_EXPORT_COUNT
  changed: $API_CHANGED

infrastructure:
  changed: $INFRA_CHANGED
  node: "${NEW_NODE_IMG:-unknown}"
  indexer: "${NEW_INDEXER_IMG:-unknown}"
  proof_server: "${NEW_PROOF_IMG:-unknown}"

pipeline:
  exit_code: $PIPELINE_EXIT
  passed: $([ $PIPELINE_EXIT -eq 0 ] && echo "true" || echo "false")

needs_ai_review: $(
  if [ $PIPELINE_EXIT -gt 0 ]; then echo "true  # pipeline failed"
  elif [ "$API_CHANGED" = "true" ]; then echo "true  # API surface changed"
  elif [ "$INFRA_CHANGED" = "true" ]; then echo "true  # infrastructure versions changed"
  else echo "false"
  fi
)
REPORT

cat "$CHANGE_REPORT"

log "Change report written to $CHANGE_REPORT"
log "Done."
