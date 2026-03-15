# Aletheia Midnight — Wallet SDK

Verified documentation for the **Midnight Wallet SDK** — 13 TypeScript
packages covering HD key derivation, shielded/unshielded/dust wallets,
transaction balancing, and chain synchronization.

Part of the [Aletheia Midnight](https://github.com/brunjlar/aletheia-midnight)
documentation system.

## The Aletheia Principle

Every claim backed by deterministically produced evidence. The AI writes
prose; mechanical tools produce truth.

## Upstream

[midnightntwrk/midnight-wallet](https://github.com/midnightntwrk/midnight-wallet)
— pinned as a Git submodule in `upstream/midnight-wallet`.

## API Surface

465 symbols across 13 packages, organized in 5 layers:

| Layer | Packages | Purpose |
|-------|----------|---------|
| Foundation | abstractions, utilities, hd, address-format | Branded types, key derivation, address encoding |
| Clients | node-client, indexer-client, prover-client | RPC, GraphQL, and proof server clients |
| Capabilities | capabilities (balancer, submission, proving, pending) | Shared services and pure operations |
| Wallets | shielded, unshielded, dust-wallet | Token-specific wallet implementations |
| Facade | facade | Unified API combining all three wallets |

## Verification

Three oracle tiers:

| Tier | Oracle | What It Proves |
|------|--------|---------------|
| 1 | TypeScript compiler | Types exist with documented shapes |
| 1 | Runtime execution | Functions behave as documented |
| 3 | Devnet (node + indexer + proof server) | End-to-end wallet lifecycle works |

## Quick Start

```bash
# Standalone (Tier 1 only)
docker compose --profile standalone run --rm toolchain-standalone bash workspace/run-tests.sh

# With devnet (Tiers 1-3)
docker compose up -d node indexer proof-server
docker compose run --rm toolchain bash workspace/run-tests.sh --devnet
```

## Repository Layout

```
upstream/midnight-wallet/    — Git submodule (upstream source)
workspace/
  package.json               — npm dependencies
  tsconfig.json              — TypeScript configuration
  ts-tests/                  — Type-check and execution tests
  run-tests.sh               — Master verification pipeline
tools/
  extract-api-surface.mjs    — Deterministic API surface extractor
  aggregate-evidence.mjs     — Evidence collection
  assemble-wallet-docs.mjs   — Document assembler
  generate-pdf.mjs           — PDF generation
  check-coverage.mjs         — Symbol coverage checker
docs/
  wallet-sdk-outline.md      — Document skeleton
  wallet-sdk-reference.md    — Assembled reference (generated)
state/
  api-surface.json           — Extracted API surface
  snapshot.yaml              — Snapshot metadata
prompts/
  repo-profile.md            — AI instructions for this repo
```
