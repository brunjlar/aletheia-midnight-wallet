#!/usr/bin/env bash
#
# collect-fingerprint.sh — Capture the wallet-repo environment
# fingerprint at test time.
#
# Output conforms to docs/design/fingerprint-schema.md (coordinator-
# level schema). Written to stdout or to the path given as the first
# positional argument.
#
# Usage:
#   bash scripts/collect-fingerprint.sh                     # stdout
#   bash scripts/collect-fingerprint.sh /tmp/fp.json        # file
#   bash scripts/collect-fingerprint.sh --docker            # collect from inside container
#
# The 'toolchain' section captures the wallet SDK npm package versions
# and dist-file hashes (these are what the test suite actually binds to).
# The 'infrastructure' section captures Docker image digests where
# available. 'source_pins' records the upstream submodule commit.
# 'verification' compares actuals against state/expected-toolchain.yaml.

set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="${REPO_ROOT:-$(cd "$SCRIPT_DIR/.." && pwd)}"

# shellcheck disable=SC1091
source "$REPO_ROOT/../../scripts/lib/fingerprint-helpers.sh" 2>/dev/null || {
    # If we're running inside Docker where the coordinator helpers aren't
    # mounted, fall back to inline minimal helpers.
    fp_sha256_file() { [[ -f "$1" ]] && sha256sum "$1" 2>/dev/null | cut -c1-16 || echo "not-found"; }
    fp_npm_version() {
        local p="$1/package.json"
        if [[ -f "$p" ]]; then
            # Prefer node (always available in a node-based toolchain),
            # fall back to python3 if we're on a host that has it but no node.
            if command -v node &>/dev/null; then
                node -e "console.log(require('$p').version || 'unknown')" 2>/dev/null || echo "unknown"
            elif command -v python3 &>/dev/null; then
                python3 -c "import json; print(json.load(open('$p')).get('version','unknown'))" 2>/dev/null || echo "unknown"
            else
                echo "unknown"
            fi
        else
            echo "unknown"
        fi
    }
    fp_git_short() { git -C "$1" rev-parse --short HEAD 2>/dev/null || echo "unknown"; }
    fp_iso_utc() { date -u +"%Y-%m-%dT%H:%M:%SZ"; }
    fp_docker_digest() {
        local ref="$1"
        if command -v docker &>/dev/null; then
            local d
            d=$(docker inspect --format='{{index .RepoDigests 0}}' "$ref" 2>/dev/null | head -1)
            [[ -n "$d" ]] && echo "$d" && return
        fi
        echo "$ref"
    }
}

OUTPUT="${1:-}"
IN_DOCKER="false"
[[ "$OUTPUT" == "--docker" ]] && IN_DOCKER="true" && OUTPUT=""

# The npm-keys are the wallet SDK packages our workspace binds to.
WALLET_NPM_KEYS=(
    abstractions address-format capabilities dust-wallet facade
    hd indexer-client node-client prover-client runtime
    shielded unshielded-wallet utilities
)

WORKSPACE="${WORKSPACE:-$REPO_ROOT/workspace}"
if [[ "$IN_DOCKER" == "true" ]]; then
    WORKSPACE="/app/workspace"
fi

# Build the toolchain JSON object piece by piece.
toolchain_entries=""
for key in "${WALLET_NPM_KEYS[@]}"; do
    pkg_dir="$WORKSPACE/node_modules/@midnight-ntwrk/wallet-sdk-$key"
    ver=$(fp_npm_version "$pkg_dir")
    # Hash the main entry file if present
    main_js=""
    for candidate in "$pkg_dir/dist/index.js" "$pkg_dir/dist/esm/index.js" "$pkg_dir/dist/cjs/index.js"; do
        [[ -f "$candidate" ]] && main_js="$candidate" && break
    done
    hash=$(fp_sha256_file "${main_js:-}")
    [[ -n "$toolchain_entries" ]] && toolchain_entries+=","
    # Normalize to all-underscore keys so comparison against
    # expected-toolchain.yaml (which uses underscores) works uniformly.
    underscore_key=$(echo "$key" | tr '-' '_')
    toolchain_entries+="
    \"wallet_sdk_$underscore_key\": { \"version\": \"$ver\", \"sha256_prefix\": \"$hash\" }"
done

# Ledger shims (what the wallet binds to for on-chain types)
for shim in ledger-v7 ledger-v8; do
    pkg_dir="$WORKSPACE/node_modules/@midnight-ntwrk/$shim"
    ver=$(fp_npm_version "$pkg_dir")
    key=$(echo "$shim" | tr '-' '_')
    toolchain_entries+=",
    \"$key\": { \"version\": \"$ver\" }"
done

# Runtime
node_version=$(node --version 2>/dev/null || echo "unknown")
lockfile_hash=$(fp_sha256_file "$WORKSPACE/package-lock.json")
platform=$(uname -m)

# Source pins
wallet_upstream_commit="unknown"
if [[ -d "$REPO_ROOT/upstream/midnight-wallet/.git" ]] || [[ -f "$REPO_ROOT/upstream/midnight-wallet/.git" ]]; then
    wallet_upstream_commit=$(fp_git_short "$REPO_ROOT/upstream/midnight-wallet")
fi
wallet_doc_commit="unknown"
if [[ -d "$REPO_ROOT/.git" ]] || [[ -f "$REPO_ROOT/.git" ]]; then
    wallet_doc_commit=$(fp_git_short "$REPO_ROOT")
fi

# Docker image digests (host-side only; inside the container we can't ask docker)
node_image="unknown"
indexer_image="unknown"
proof_server_image="unknown"
if [[ "$IN_DOCKER" != "true" ]] && command -v docker &>/dev/null; then
    for pair in "node:midnightntwrk/midnight-node" "indexer:midnightntwrk/indexer-standalone" "proof-server:midnightntwrk/proof-server"; do
        IFS=: read svc img <<< "$pair"
        digest=$(fp_docker_digest "$img" 2>/dev/null)
        case "$svc" in
            node) node_image="$digest" ;;
            indexer) indexer_image="$digest" ;;
            proof-server) proof_server_image="$digest" ;;
        esac
    done
fi
# Env-var override (used when spawned from run-tests.sh with digests resolved)
node_image="${DOCKER_NODE_IMAGE:-$node_image}"
indexer_image="${DOCKER_INDEXER_IMAGE:-$indexer_image}"
proof_server_image="${DOCKER_PROOF_SERVER_IMAGE:-$proof_server_image}"

# Build the JSON
raw_json=$(cat <<JSON
{
  "schema_version": 1,
  "captured_at": "$(fp_iso_utc)",
  "toolchain": {$toolchain_entries
  },
  "infrastructure": {
    "node_image": "$node_image",
    "indexer_image": "$indexer_image",
    "proof_server_image": "$proof_server_image"
  },
  "runtime": {
    "node_version": "$node_version",
    "npm_lockfile_sha256_prefix": "$lockfile_hash",
    "platform": "$platform"
  },
  "source_pins": {
    "wallet_upstream": "$wallet_upstream_commit",
    "wallet_doc_repo": "$wallet_doc_commit"
  },
  "verification": {
    "verified_against_expected": false,
    "mismatches": null,
    "expected_toolchain_file": "state/expected-toolchain.yaml"
  }
}
JSON
)

# Compare against expected-toolchain if available. Uses node for YAML
# parsing (python3 is not always present in the wallet's node-based
# toolchain image); `npm i yaml` is already a workspace dep.
EXPECTED_FILE="$REPO_ROOT/state/expected-toolchain.yaml"
if [[ -f "$EXPECTED_FILE" ]] && command -v node &>/dev/null; then
    fp_tmp=$(mktemp)
    printf '%s' "$raw_json" > "$fp_tmp"
    raw_json=$(node -e "
const fs = require('fs');
const fp = JSON.parse(fs.readFileSync('$fp_tmp', 'utf8'));
const text = fs.readFileSync('$EXPECTED_FILE', 'utf8');
// Minimal YAML parser good enough for 'key: \"value\"' and 'key: value'
// (no nested structures in our schema for these fields).
const exp = {};
for (const line of text.split('\n')) {
  const m = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)\s*\$/);
  if (!m) continue;
  let v = m[2].trim();
  if (v.startsWith('\"') && v.endsWith('\"')) v = v.slice(1, -1);
  if (v && !v.startsWith('#')) exp[m[1]] = v;
}

const tc = fp.toolchain || {};
const rt = fp.runtime || {};
const nodeVer = rt.node_version || 'unknown';
const nodeMajor = (nodeVer && nodeVer !== 'unknown')
  ? nodeVer.replace(/^v/, '').split('.')[0] : 'unknown';

const actual = {};
for (const [k, v] of Object.entries(tc)) {
  if (v && typeof v === 'object' && 'version' in v) {
    actual[k + '_version'] = v.version;
  }
}
actual.node_major = nodeMajor;

const mismatches = [];
for (const [key, actualVal] of Object.entries(actual)) {
  const expectedVal = String(exp[key] || '');
  if (!expectedVal || actualVal === 'unknown') continue;
  if (actualVal !== expectedVal) {
    mismatches.push(\`\${key}: expected=\${expectedVal} actual=\${actualVal}\`);
  }
}
fp.verification.verified_against_expected = true;
fp.verification.mismatches = mismatches.length ? mismatches : null;
console.log(JSON.stringify(fp, null, 2));
" 2>/dev/null || cat "$fp_tmp")
    rm -f "$fp_tmp"
fi

if [[ -n "$OUTPUT" ]]; then
    printf '%s' "$raw_json" > "$OUTPUT"
else
    printf '%s\n' "$raw_json"
fi
