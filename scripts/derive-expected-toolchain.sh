#!/usr/bin/env bash
#
# Derive state/expected-toolchain.yaml for the wallet repo from
# authoritative upstream sources.
#
# Sources consulted (all deterministic, no hand-maintenance):
#   wallet_sdk_<pkg>_version → upstream/midnight-wallet/packages/<pkg>/package.json
#   ledger_v8_version        → workspace/package.json (pins the ledger shim we bind to)
#   midnight_node_tag        → docker-compose.yml (node image)
#   indexer_tag              → docker-compose.yml
#   proof_server_tag         → docker-compose.yml
#
# Usage:
#   bash repos/wallet/scripts/derive-expected-toolchain.sh              # print
#   bash repos/wallet/scripts/derive-expected-toolchain.sh --write      # write to state/
#   bash repos/wallet/scripts/derive-expected-toolchain.sh --check      # fail on drift
#
# Schema conforms to docs/design/fingerprint-schema.md (coordinator-level).

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXPECTED_FILE="$REPO_ROOT/state/expected-toolchain.yaml"
MODE="${1:-print}"

# Packages documented by this repo. The version for each is the
# upstream/midnight-wallet/packages/<name>/package.json field.
# Each entry is "<npm-key>:<upstream-dir>"; the npm-key is how the
# package appears in workspace/package.json (under the
# @midnight-ntwrk/wallet-sdk-* prefix); the upstream-dir is the
# folder name inside upstream/midnight-wallet/packages/.
WALLET_PACKAGES=(
    "abstractions:abstractions"
    "address-format:address-format"
    "capabilities:capabilities"
    "dust-wallet:dust-wallet"
    "facade:facade"
    "hd:hd"
    "indexer-client:indexer-client"
    "node-client:node-client"
    "prover-client:prover-client"
    "runtime:runtime"
    "shielded:shielded-wallet"
    "unshielded-wallet:unshielded-wallet"
    "utilities:utilities"
)

get_upstream_pkg_version() {
    local pkg="$1"
    local pkg_json="$REPO_ROOT/upstream/midnight-wallet/packages/$pkg/package.json"
    if [[ -f "$pkg_json" ]] && command -v python3 &>/dev/null; then
        python3 -c "
import json, re
v = json.load(open('$pkg_json')).get('version','unknown')
v = re.sub(r'-(rc|beta|alpha|pre)\.[0-9]+$', '', v)
print(v)
" 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# Ledger v8 pin — comes from workspace/package.json (since wallet docs
# bind to a specific ledger shim; upstream wallet itself doesn't declare
# it at the top level).
get_ledger_v8_version() {
    local ws_pkg="$REPO_ROOT/workspace/package.json"
    if [[ -f "$ws_pkg" ]] && command -v python3 &>/dev/null; then
        python3 -c "
import json, re
d = json.load(open('$ws_pkg')).get('dependencies', {})
v = d.get('@midnight-ntwrk/ledger-v8', 'unknown')
v = re.sub(r'-(rc|beta|alpha|pre)\.[0-9]+$', '', v)
print(v)
" 2>/dev/null || echo "unknown"
    else
        echo "unknown"
    fi
}

# Docker image tags from docker-compose.yml
dc_file="$REPO_ROOT/docker-compose.yml"
node_tag="unknown"
indexer_tag="unknown"
proof_server_tag="unknown"
if [[ -f "$dc_file" ]]; then
    node_tag=$(grep -oE 'midnightntwrk/midnight-node:[^[:space:]"]+' "$dc_file" | head -1 | cut -d: -f2 || echo unknown)
    indexer_tag=$(grep -oE 'midnightntwrk/indexer-standalone:[^[:space:]"]+' "$dc_file" | head -1 | cut -d: -f2 || echo unknown)
    proof_server_tag=$(grep -oE 'midnightntwrk/proof-server:[^[:space:]"]+' "$dc_file" | head -1 | cut -d: -f2 || echo unknown)
fi

# Node major — from toolchain Dockerfile if present, else unknown
node_major="unknown"
for dockerfile in "$REPO_ROOT/docker/Dockerfile.toolchain" "$REPO_ROOT/Dockerfile.toolchain"; do
    [[ -f "$dockerfile" ]] || continue
    node_major=$(grep -oE 'FROM[[:space:]]+node:[0-9]+' "$dockerfile" | head -1 | grep -oE '[0-9]+$' || echo unknown)
    break
done

TMP=$(mktemp)
{
    echo "# Expected Toolchain Versions — wallet"
    echo "#"
    echo "# DERIVED AUTOMATICALLY from upstream by"
    echo "# repos/wallet/scripts/derive-expected-toolchain.sh. Do not hand-edit;"
    echo "# rerun the script after advancing submodules."
    echo "#"
    echo "# Sources:"
    echo "#   wallet_sdk_<pkg>_version → upstream/midnight-wallet/packages/<pkg>/package.json"
    echo "#   ledger_v8_version        → workspace/package.json"
    echo "#   midnight_node_tag        → docker-compose.yml"
    echo "#   indexer_tag              → docker-compose.yml"
    echo "#   proof_server_tag         → docker-compose.yml"
    echo ""
    echo "schema: 1"
    echo ""
    echo "# Wallet SDK packages (source: upstream midnight-wallet)"
    for entry in "${WALLET_PACKAGES[@]}"; do
        npm_key="${entry%%:*}"
        upstream_dir="${entry##*:}"
        ver=$(get_upstream_pkg_version "$upstream_dir")
        key=$(echo "$npm_key" | tr '-' '_')
        echo "wallet_sdk_${key}_version: \"${ver}\""
    done
    echo ""
    echo "# Ledger shim (pinned in workspace/package.json)"
    echo "ledger_v8_version: \"$(get_ledger_v8_version)\""
    echo ""
    echo "# Node.js major (inside toolchain Docker image)"
    echo "node_major: \"${node_major}\""
    echo ""
    echo "# Docker image tags (digests captured at runtime)"
    echo "midnight_node_tag: \"${node_tag}\""
    echo "indexer_tag: \"${indexer_tag}\""
    echo "proof_server_tag: \"${proof_server_tag}\""
    echo ""
    echo "# Provenance"
    echo "_derivation:"
    echo "  wallet_upstream: \"$(git -C "$REPO_ROOT/upstream/midnight-wallet" rev-parse --short HEAD 2>/dev/null || echo unknown)\""
    echo "  wallet_doc_repo: \"$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)\""
    echo "  derived_at:      \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\""
} > "$TMP"

case "$MODE" in
    --write)
        mkdir -p "$(dirname "$EXPECTED_FILE")"
        cp "$TMP" "$EXPECTED_FILE"
        echo "Wrote $EXPECTED_FILE"
        ;;
    --check)
        if ! diff -q "$EXPECTED_FILE" "$TMP" >/dev/null 2>&1; then
            echo "state/expected-toolchain.yaml drifts from upstream:" >&2
            diff "$EXPECTED_FILE" "$TMP" | head -30 >&2
            rm "$TMP"
            exit 1
        fi
        echo "state/expected-toolchain.yaml is in sync with upstream"
        ;;
    print|*)
        cat "$TMP"
        ;;
esac
rm -f "$TMP"
