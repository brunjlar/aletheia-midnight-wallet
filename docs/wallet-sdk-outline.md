# Midnight Wallet SDK Reference

<!-- Assembled by tools/assemble-wallet-docs.mjs -->
<!-- Source: upstream/midnight-wallet @ UPSTREAM_COMMIT -->
<!-- Generated: BUILD_TIMESTAMP -->

## 1. Introduction

The Midnight Wallet SDK is a TypeScript library for managing all three
token types on the Midnight blockchain: **shielded tokens** (zero-knowledge
privacy-preserving), **unshielded tokens** (Night, the native token), and
**dust** (fee tokens with time-dependent generation). The SDK provides
HD key derivation, address encoding, transaction balancing and signing,
chain synchronization, and ZK proof generation — all through a unified
facade.

### 1.1 Architecture Overview

The SDK follows a layered architecture with 13 packages:

```
Layer 1: Foundation
  abstractions    — Branded types (WalletSeed, WalletState, ProtocolVersion, ...)
  utilities       — Domain-agnostic operations (SafeBigInt, BlobOps, ...)
  hd              — HD wallet key derivation (BIP32/BIP39, CIP-1852)
  address-format  — Bech32m address encoding (mn_ prefix)

Layer 2: Infrastructure Clients
  node-client     — Polkadot RPC client for the Midnight node
  indexer-client  — GraphQL client for chain indexer
  prover-client   — HTTP client for ZK proof server

Layer 3: Capabilities
  capabilities    — Shared services and pure operations
    /balancer     — Coin selection and balance recipes
    /submission   — Transaction submission lifecycle
    /pendingTransactions — Pending transaction tracking
    /proving      — ZK proof generation services

Layer 4: Wallet Implementations
  shielded-wallet       — Shielded (private) token wallet
  unshielded-wallet     — Unshielded (Night) token wallet
  dust-wallet           — Dust (fee) token wallet

Layer 5: Facade
  facade          — Unified API combining all three wallets
```

### 1.2 Token Model

Midnight implements three distinct token types:

| Token | Wallet | Privacy | Purpose |
|-------|--------|---------|---------|
| Custom shielded | ShieldedWallet | ZK-private | Arbitrary tokens with zero-knowledge proofs |
| Night (unshielded) | UnshieldedWallet | Public | Native token for transfers and staking |
| Dust | DustWallet | Public | Fee token with time-dependent generation |

### 1.3 Variant/Runtime Pattern

Each wallet uses a **variant-based architecture** for protocol version
compatibility. A variant is a specific implementation for a range of
protocol versions (enabling hard-fork migration). The `WalletBuilder`
registers variants, and the `Runtime` dispatches to the correct one
based on the current protocol version.

### 1.4 Evidence Summary

(evidence-summary)

---

## 2. API Surface

(api-surface)

---

## 3. Foundation Layer

### 3.1 Abstractions (`@midnight-ntwrk/wallet-sdk-abstractions`)

Branded types that form the domain vocabulary of the wallet SDK.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: abstractions/*)

### 3.2 Utilities (`@midnight-ntwrk/wallet-sdk-utilities`)

Domain-agnostic operations used across the SDK.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: utilities/*)

### 3.3 HD Wallet (`@midnight-ntwrk/wallet-sdk-hd`)

Hierarchical deterministic key derivation following BIP32/BIP39 with
Midnight's CIP-1852 derivation path: `m/44'/2400'/{account}'/{role}/{index}`.

Five key roles:

| Role | Index | Purpose |
|------|-------|---------|
| NightExternal | 0 | Receiving Night tokens |
| NightInternal | 1 | Change addresses for Night |
| Dust | 2 | Dust generation addresses |
| Zswap | 3 | Zero-knowledge swap keys |
| Metadata | 4 | Metadata encryption keys |

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: hd/*)

### 3.4 Address Format (`@midnight-ntwrk/wallet-sdk-address-format`)

Bech32m address encoding with the `mn_` prefix and type-specific HRPs.

| Address Type | HRP | Purpose |
|-------------|-----|---------|
| `shield-addr` | Shielded receiving | ZK-private token receipt |
| `addr` | Unshielded | Night token receipt |
| `dust` | Dust | Dust generation registration |
| `shield-cpk` | Shielded coin public key | Coin ownership proof |
| `shield-epk` | Encryption public key | Encrypted communication |
| `shield-esk` | Encryption secret key | Decryption capability |

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: address-format/*)

---

## 4. Infrastructure Clients

### 4.1 Node Client (`@midnight-ntwrk/wallet-sdk-node-client`)

Polkadot RPC client for submitting transactions to the Midnight node.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: node-client/*)

### 4.2 Indexer Client (`@midnight-ntwrk/wallet-sdk-indexer-client`)

GraphQL client for querying the chain indexer. Provides queries and
subscriptions for wallet synchronization.

**Note:** This package includes ~120 auto-generated GraphQL types from
the indexer schema. The reference below covers the key query/subscription
exports; the full generated type inventory is in the appendix.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: indexer-client/*)

### 4.3 Prover Client (`@midnight-ntwrk/wallet-sdk-prover-client`)

HTTP client for the ZK proof generation server.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: prover-client/*)

---

## 5. Capabilities

Shared capability implementations decomposed into pure state operations
(capabilities) and side-effecting services. Every capability has both an
Effect-based variant (`*Effect`) and a plain Promise-based variant.

### 5.1 Balancer (`@midnight-ntwrk/wallet-sdk-capabilities/balancer`)

Coin selection and transaction balancing. Computes which UTxOs to consume
and what change outputs to create.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: capabilities/balancer/*)

### 5.2 Submission (`@midnight-ntwrk/wallet-sdk-capabilities/submission`)

Transaction submission lifecycle: submit → in-block → finalized.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: capabilities/submission/*)

### 5.3 Pending Transactions (`@midnight-ntwrk/wallet-sdk-capabilities/pendingTransactions`)

Tracks transactions that have been submitted but not yet finalized.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: capabilities/pendingTransactions/*)

### 5.4 Proving (`@midnight-ntwrk/wallet-sdk-capabilities/proving`)

ZK proof generation services. Supports multiple backends: server-side,
WASM (in-browser), and simulator (for testing).

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: capabilities/proving/*)

---

## 6. Wallet Implementations

### 6.1 Shielded Wallet (`@midnight-ntwrk/wallet-sdk-shielded`)

Privacy-preserving wallet for custom shielded tokens. Uses zero-knowledge
proofs for all operations — balances and transaction details are hidden
from observers.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: shielded/*)

### 6.2 Unshielded Wallet (`@midnight-ntwrk/wallet-sdk-unshielded-wallet`)

Wallet for Night (the native token) and other unshielded tokens. Operations
are publicly visible on the ledger.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: unshielded/*)

### 6.3 Dust Wallet (`@midnight-ntwrk/wallet-sdk-dust-wallet`)

Fee management wallet. Dust is generated over time from registered Night
UTxOs, with a rate that depends on the backing amount, a maximum cap,
and a creation time.

Key concepts:
- **Dust generation**: Register Night UTxOs to generate dust over time
- **Fee calculation**: `calculateFee(tx)` and `estimateFee(tx)`
- **Time-dependent balance**: `balance(date)` returns dust in SPECK

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: dust/*)

---

## 7. Facade (`@midnight-ntwrk/wallet-sdk-facade`)

The unified entry point. Orchestrates all three wallet types for
transaction balancing — running unshielded, shielded, and dust/fee
balancing in sequence.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: facade/*)

---

## 8. Runtime (`@midnight-ntwrk/wallet-sdk-runtime`)

Wallet builder and lifecycle management. Registers wallet variants
keyed by protocol version ranges, enabling seamless hard-fork migration.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

(evidence: runtime/*)

---

## Appendix A: Generated GraphQL Types (indexer-client)

The indexer-client package exports ~120 auto-generated types from the
indexer's GraphQL schema. These are listed here for completeness.

(graphql-types)

## Appendix B: Evidence Index

Complete index of all verification evidence, organized by test tier
and package.

(evidence-index)

## Appendix C: Version Information

| Component | Version |
|-----------|---------|
| Wallet SDK upstream | UPSTREAM_COMMIT |
| Node | 0.22.0-rc.6 |
| Indexer | 4.0.0-rc.5 |
| Proof Server | 8.0.2 |
| Ledger | v8 |
| TypeScript | 5.9.3 |
| Node.js | 22 |
