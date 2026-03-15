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

### 1.4 Effect Library Integration

The SDK uses the [Effect](https://effect.website/) library extensively.
Most services have two flavors:

- **Effect-based** (`*Effect`): Returns `Effect.Effect<T, E>` — composable,
  lazy, with typed errors. Used internally and for advanced integrations.
- **Promise-based**: Returns `Promise<T>` — standard async/await API for
  most consumers.

All errors extend `Data.TaggedError`, providing a `_tag` discriminant
for pattern matching.

### 1.5 Evidence Summary

(evidence-summary)

---

## 2. API Surface

(api-surface)

---

## 3. Foundation Layer

### 3.1 Abstractions (`@midnight-ntwrk/wallet-sdk-abstractions`)

Branded types that form the domain vocabulary of the wallet SDK. Each
type is a nominal brand using Effect's `Brand` module, preventing
accidental use of raw primitives where a branded type is expected.

| Export | Kind | Description |
|--------|------|-------------|
| `WalletSeed` | namespace | Branded `Uint8Array` for BIP32 seeds. Has `fromString(hex)`, `is(value)` predicate. |
| `WalletState` | namespace | Branded `string` for serialized wallet state. Has `is(value)` predicate. |
| `SerializedTransaction` | namespace | Branded `Uint8Array` for serialized transactions. Has `of(bytes)` and `from(serializable)` helpers. |
| `ProtocolVersion` | namespace | Branded `bigint` for protocol versions. Has `makeRange`, `withinRange`, `is`, `MinSupportedVersion` (0), `MaxSupportedVersion`. |
| `NetworkId` | namespace | Well-known network identifiers: `MainNet`, `TestNet`, `DevNet`, `QaNet`, `Undeployed`, `Preview`, `PreProd`. Accepts any string. |
| `SyncProgress` | namespace | Tracks wallet sync state. `createSyncProgress(params)` creates instances with `isStrictlyComplete()` and `isCompleteWithin(maxGap)` methods. |
| `ProtocolState` | namespace | Wraps wallet state with protocol version metadata. |

(evidence: abstractions/*)

### 3.2 Utilities (`@midnight-ntwrk/wallet-sdk-utilities`)

Domain-agnostic operations used across the SDK. Each utility is exported
as a namespace module containing related functions.

| Export | Kind | Description |
|--------|------|-------------|
| `SafeBigInt` | namespace | Safe conversions between bigint and other types. |
| `ArrayOps` | namespace | Array utility functions (filter, map, group). |
| `BlobOps` | namespace | Binary/blob operations (concat, slice, compare). |
| `DateOps` | namespace | Date arithmetic (e.g., `addSeconds`). |
| `EitherOps` | namespace | Effect Either utilities. |
| `Fluent` | namespace | Fluent API builder helpers. |
| `HList` | namespace | Heterogeneous list types (used by WalletBuilder). |
| `LedgerOps` | namespace | Ledger-specific type operations. |
| `ObservableOps` | namespace | RxJS Observable utilities. |
| `Poly` | namespace | Polymorphic function utilities (variant dispatch). |
| `RecordOps` | namespace | Record/object utilities. |

**Sub-export `./networking`**: URL validation types and HTTP error classes.

| Export | Kind | Description |
|--------|------|-------------|
| `HttpURL` | namespace | Validated HTTP URL type. |
| `WsURL` | namespace | Validated WebSocket URL type. |
| `InvalidProtocolSchemeError` | class | Tagged error (`_tag: 'InvalidProtocolSchemeError'`) for invalid URL schemes. |
| `FailedToDeriveWebSocketUrlError` | class | Tagged error for WebSocket URL derivation failures. |
| `ClientError` | class | Tagged error (`_tag: 'ClientError'`) for HTTP 4xx responses. |
| `ServerError` | class | Tagged error (`_tag: 'ServerError'`) for HTTP 5xx responses. |

**Sub-export `./types`**: Compile-time type utilities (`Expect`, `Equal`, `CanAssign`, `ItemType`).

(evidence: utilities/*)

### 3.3 HD Wallet (`@midnight-ntwrk/wallet-sdk-hd`)

Hierarchical deterministic key derivation following BIP32/BIP39 with
Midnight's derivation path: `m/44'/2400'/{account}'/{role}/{index}`.

Coin type `2400` is Midnight's registered BIP44 coin type. Five roles
partition keys by purpose:

| Role | Index | Purpose |
|------|-------|---------|
| NightExternal | 0 | Receiving Night tokens |
| NightInternal | 1 | Change addresses for Night |
| Dust | 2 | Dust generation addresses |
| Zswap | 3 | Zero-knowledge swap keys |
| Metadata | 4 | Metadata encryption keys |

| Export | Kind | Description |
|--------|------|-------------|
| `HDWallet` | class | HD wallet root. `fromSeed(seed)` returns `{ type: 'seedOk', hdWallet }` or `{ type: 'seedError', error }`. Call `selectAccount(n)` to get an `AccountKey`. |
| `AccountKey` | class | Account-level key. `selectRole(role)` gets a `RoleKey`; `selectRoles([...])` gets a `CompositeRoleKey` for batch derivation. |
| `RoleKey` | class | Role-level key. `deriveKeyAt(index)` returns `{ type: 'keyDerived', key: Uint8Array }` or `{ type: 'keyOutOfBounds' }`. |
| `CompositeRoleKey` | class | Multi-role key. `deriveKeysAt(index)` derives keys for all specified roles simultaneously. |
| `Roles` | const | Enum object: `{ NightExternal: 0, NightInternal: 1, Dust: 2, Zswap: 3, Metadata: 4 }`. |
| `generateMnemonicWords` | function | Generates a 24-word BIP39 mnemonic (default strength=256). |
| `joinMnemonicWords` | function | Joins word array into space-separated mnemonic string. |
| `mnemonicToWords` | function | Splits mnemonic string into word array. |
| `validateMnemonic` | function | Validates a BIP39 mnemonic against the English wordlist. |
| `generateRandomSeed` | function | Generates a cryptographically random 32-byte seed. |

Key derivation is **deterministic**: the same seed always produces the
same keys. Different roles produce different keys. Different accounts
produce different keys.

(evidence: hd/*)

### 3.4 Address Format (`@midnight-ntwrk/wallet-sdk-address-format`)

Bech32m address encoding with the `mn` prefix. Addresses encode a type
identifier, network identifier, and payload into a single checksummed
string.

| Address Type | Bech32m Type | Payload | Purpose |
|-------------|-------------|---------|---------|
| `ShieldedAddress` | `shield-addr` | Coin public key + encryption public key | Receiving shielded tokens |
| `UnshieldedAddress` | `addr` | 32-byte public key | Receiving Night tokens |
| `DustAddress` | `dust` | BLS scalar (bigint < modulus) | Dust generation registration |
| `ShieldedCoinPublicKey` | `shield-cpk` | 32 bytes | Proving coin ownership |
| `ShieldedEncryptionPublicKey` | `shield-epk` | 32 bytes | Encrypting messages |
| `ShieldedEncryptionSecretKey` | `shield-esk` | 32 bytes | Decrypting messages |

| Export | Kind | Description |
|--------|------|-------------|
| `MidnightBech32m` | class | Encodes/decodes addresses. `encode(networkId, item)` produces a Bech32m string; `parse(str)` + `decode(Type, networkId)` reverses it. |
| `Bech32mCodec` | class | Generic codec for custom Bech32m types. |
| `BLSScalar` | const | BLS12-381 scalar field: `{ bytes: 32, modulus: 0x73eda753...01 }`. |
| `ScaleBigInt` | const | SCALE codec for bigint encoding/decoding. Roundtrips correctly for all non-negative values. |
| `ShieldedAddress` | class | Composed of `coinPublicKey` + `encryptionPublicKey`. |
| `ShieldedCoinPublicKey` | class | 32-byte key with `toHexString()`, `equals()`, `fromHexString()`. **Accepts `Buffer`, not `Uint8Array`.** |
| `ShieldedEncryptionPublicKey` | class | 32-byte key with `toHexString()`, `equals()`. **Accepts `Buffer`.** |
| `UnshieldedAddress` | class | 32-byte address with `hexString` getter and `equals()`. **Accepts `Buffer`.** |
| `DustAddress` | class | Stores a `bigint` validated against `BLSScalar.modulus`. Values `>= modulus` are rejected. |
| `mainnet` | symbol | Unique symbol for mainnet network ID (not a string). |

**Important:** Address constructors accept `Buffer`, not `Uint8Array`.
This is a platform-specific choice aligned with Node.js conventions.

(evidence: address-format/*)

---

## 4. Infrastructure Clients

### 4.1 Node Client (`@midnight-ntwrk/wallet-sdk-node-client`)

Polkadot RPC client for submitting transactions to the Midnight node.
Uses the `@polkadot/api` library over WebSocket.

| Export | Kind | Description |
|--------|------|-------------|
| `PolkadotNodeClient` | class | Main client. `init(config)` connects to the node. `sendMidnightTransaction(tx)` returns an `Observable<SubmissionEvent>` tracking the submission lifecycle. `close()` disconnects. |
| `Config` | type | `{ nodeURL: URL, reconnectionTimeout: Duration, reconnectionDelay: Duration }`. |
| `makeConfig` | function | Creates a `Config` from partial input. Only `nodeURL` is required; timeouts have defaults. |
| `DEFAULT_CONFIG` | const | Default reconnection settings (infinite timeout, 1s delay). Does not include `nodeURL`. |

The submission event stream emits `Submitted`, `InBlock`, and `Finalized`
events as the transaction progresses through the block pipeline.

(evidence: node-client/*)

### 4.2 Indexer Client (`@midnight-ntwrk/wallet-sdk-indexer-client`)

GraphQL client for querying the chain indexer. The indexer tracks wallet-relevant
events (UTxO creation/spending, shielded transactions, dust generation).

**Queries:**

| Query | Parameters | Purpose |
|-------|-----------|---------|
| `Connect` | `viewingKey: ViewingKey` | Register a viewing key to start a session |
| `Disconnect` | `sessionId: HexEncoded` | End an indexer session |
| `BlockHash` | `offset?: BlockOffset` | Get block height, hash, ledger params, timestamp |
| `TransactionStatus` | `transactionId: HexEncoded` | Check transaction result and segment status |

**Subscriptions:**

| Subscription | Purpose |
|-------------|---------|
| `DustLedgerEvents` | Stream dust ledger events for sync |
| `ShieldedTransactions` | Stream shielded transactions with Merkle tree updates |
| `UnshieldedTransactions` | Stream unshielded UTxO events |
| `ZswapEvents` | Stream Zswap ledger events |

**Effect sub-export (`./effect`):**

| Export | Kind | Description |
|--------|------|-------------|
| `QueryClient` | tag | Effect Context Tag for GraphQL query execution. |
| `SubscriptionClient` | tag | Effect Context Tag for GraphQL subscription streaming. |
| `HttpQueryClient` | namespace | `layer(config)` creates an Effect Layer for HTTP queries. |
| `WsSubscriptionClient` | namespace | `layer(config)` creates an Effect Layer for WebSocket subscriptions. |
| `ConnectionHelper` | namespace | `deriveWebSocketUrl(url)` converts HTTP to WS URL. |
| `QueryRunner` | namespace | `runPromise(query, vars, config)` executes a query as a plain Promise. |

**Note:** This package also exports ~120 auto-generated GraphQL types
from the indexer schema (see Appendix A).

(evidence: indexer-client/*)

### 4.3 Prover Client (`@midnight-ntwrk/wallet-sdk-prover-client`)

HTTP client for the ZK proof generation server. The proof server converts
`UnprovenTransaction` objects into `Transaction` objects with valid ZK proofs.

| Export | Kind | Description |
|--------|------|-------------|
| `HttpProverClient` | class | Wraps an HTTP connection. Constructor takes `{ url: string }`. `proveTransaction(tx, costModel?)` sends the transaction for proving and returns the proven version. |

The Effect sub-export (`./effect`) provides `ProverClient` (Context Tag),
`HttpProverClient` layer, and `SimulatorProverClient` for testing.

(evidence: prover-client/*)

---

## 5. Capabilities

Shared capability implementations decomposed into pure state operations
(capabilities) and side-effecting services. Every service has both an
Effect-based variant (`*Effect`) and a plain Promise-based variant.

### 5.1 Balancer (`@midnight-ntwrk/wallet-sdk-capabilities/balancer`)

Coin selection and transaction balancing. Computes which UTxOs to consume
and what change outputs to create to satisfy a set of imbalances.

| Export | Kind | Description |
|--------|------|-------------|
| `getBalanceRecipe` | function | Core balancing algorithm. Takes coins, imbalances, cost model, and coin selection strategy; returns a `BalanceRecipe` with inputs and outputs. |
| `createCounterOffer` | function | Creates a `CounterOffer` for multi-party transaction negotiation. |
| `chooseCoin` | function | Default coin selection: picks the smallest-value coin of the requested type. |
| `BalanceRecipe` | interface | `{ inputs: TInput[], outputs: TOutput[] }` — the result of balancing. |
| `CoinRecipe` | interface | `{ type: TokenType, value: TokenValue }` — a coin's type and value. |
| `TransactionCostModel` | interface | `{ inputFeeOverhead: bigint, outputFeeOverhead: bigint }` — per-input/output fee constants. |
| `CounterOffer` | class | Mutable accumulator for multi-step balancing with `addInput`/`addOutput`. |
| `Imbalances` | type/const | `Map<TokenType, TokenValue>` with companion methods: `empty()`, `fromEntry()`, `merge()`, `getValue()`, `typeSet()`. |
| `InsufficientFundsError` | class | Thrown when balancing cannot satisfy an imbalance. Has `tokenType` property. |

(evidence: capabilities/balancer/*)

### 5.2 Submission (`@midnight-ntwrk/wallet-sdk-capabilities/submission`)

Transaction submission lifecycle: submit → in-block → finalized.

| Export | Kind | Description |
|--------|------|-------------|
| `SubmissionService` | interface | `prove(tx): Promise<T>` — submits a transaction. |
| `SubmissionServiceEffect` | interface | Effect-based variant. |
| `SubmissionEvent` | const/type | Tagged union of `Submitted`, `InBlock`, `Finalized` events (from `Data.taggedEnum`). |
| `SubmissionError` | class | Tagged error (`_tag: 'SubmissionError'`) with `{ message, cause? }`. |
| `makeDefaultSubmissionService` | function | Creates a submission service from a `DefaultSubmissionConfiguration` (`{ relayURL: URL }`). |
| `makeSimulatorSubmissionService` | function | Creates a mock submission service for testing. |

(evidence: capabilities/submission/*)

### 5.3 Pending Transactions (`@midnight-ntwrk/wallet-sdk-capabilities/pendingTransactions`)

Tracks transactions that have been submitted but not yet finalized.
Monitors the indexer for confirmation and expiry.

| Export | Kind | Description |
|--------|------|-------------|
| `PendingTransactionsService` | type | Service interface for tracking pending transactions. |
| `PendingTransactionsServiceImpl` | class | Promise-based implementation. |
| `PendingTransactions` | namespace | Contains `TransactionTrait` interface for transaction identity operations (serialize, deserialize, ID extraction, TTL checking). |

(evidence: capabilities/pendingTransactions/*)

### 5.4 Proving (`@midnight-ntwrk/wallet-sdk-capabilities/proving`)

ZK proof generation services. Multiple backends for different environments.

| Export | Kind | Description |
|--------|------|-------------|
| `ProvingService` | interface | `prove(tx: UnprovenTransaction): Promise<T>` — generates a ZK proof for a transaction. |
| `ProvingServiceEffect` | interface | Effect-based variant. |
| `ProvingError` | class | Tagged error (`_tag: 'Wallet.Proving'`) with **required** `cause: Error`. |
| `makeDefaultProvingService` | function | Creates a server-backed proving service (requires `{ provingServerUrl: URL }`). |
| `makeServerProvingService` | function | Explicit server-backed proving service. |
| `makeWasmProvingService` | function | In-browser WASM proving (optional `keyMaterialProvider`). |
| `makeSimulatorProvingService` | function | Mock proving for testing — returns `ProofErasedTransaction` (no real proof). |
| `UnboundTransaction` | type | A transaction with a real proof but pre-binding. |

(evidence: capabilities/proving/*)

---

## 6. Wallet Implementations

All three wallets follow the same structural pattern:

1. A **factory function** (`ShieldedWallet(config)`) returns a wallet class
2. The class has `startWithSeed`/`startWithSecretKeys`/`restore` static methods
3. Each instance exposes `state: Observable<WalletState>`, lifecycle methods
   (`start`, `stop`), and token-specific operations
4. The `WalletState` class wraps capabilities (serialization, coins/balances,
   keys, transaction history) and provides convenient getters

### 6.1 Shielded Wallet (`@midnight-ntwrk/wallet-sdk-shielded`)

Privacy-preserving wallet for custom shielded tokens. Uses zero-knowledge
proofs for all operations — balances and transaction details are hidden
from observers.

| Export | Kind | Description |
|--------|------|-------------|
| `ShieldedWallet` | function | Factory: `ShieldedWallet(config) → ShieldedWalletClass`. |
| `ShieldedWalletClass` | type | Class with `startWithSeed(seed)`, `startWithSecretKeys(keys)`, `restore(state)`. |
| `ShieldedWalletState` | class | State with getters: `balances` (record of token balances), `totalCoins`, `availableCoins`, `pendingCoins`, `coinPublicKey`, `encryptionPublicKey`, `address`, `progress`. |
| `ShieldedWalletAPI` | type | Instance API: `state`, `start(secretKeys)`, `balanceTransaction(keys, tx)`, `transferTransaction(keys, outputs)`, `initSwap(keys, inputs, outputs)`, `getAddress()`, `revertTransaction(tx)`, `stop()`. |
| `DefaultShieldedConfiguration` | type | Default configuration type (aliases `DefaultV1Configuration`). |

The shielded wallet requires `ZswapSecretKeys` for most operations,
ensuring that only the key holder can view or modify the wallet state.

(evidence: shielded/*)

### 6.2 Unshielded Wallet (`@midnight-ntwrk/wallet-sdk-unshielded-wallet`)

Wallet for Night (the native token) and other unshielded tokens.
Operations are publicly visible on the ledger.

| Export | Kind | Description |
|--------|------|-------------|
| `UnshieldedWallet` | function | Factory: `UnshieldedWallet(config) → UnshieldedWalletClass`. |
| `UnshieldedWalletClass` | type | Class with `startWithPublicKey(pk)`, `restore(state)`. |
| `UnshieldedWalletState` | class | State with getters: `balances`, `totalCoins`, `availableCoins`, `pendingCoins`, `address`, `progress`, `transactionHistory`. |
| `UnshieldedWalletAPI` | type | Instance API with three balance methods: `balanceFinalizedTransaction`, `balanceUnboundTransaction`, `balanceUnprovenTransaction`. Also `transferTransaction(outputs, ttl)`, `initSwap(inputs, outputs, ttl)`, signing methods. |
| `createKeystore` | function | `createKeystore(secretKey: Uint8Array, networkId): UnshieldedKeystore` — creates a keystore from a derived secret key. |
| `PublicKey` | type/const | `{ publicKey, addressHex, address }` with `fromKeyStore(keystore)` factory. |
| `TransactionHistoryStorage` | interface | `create`, `delete`, `getAll`, `get` for transaction history persistence. |

Unlike the shielded wallet, the unshielded wallet uses public-key
based authentication and provides separate balancing methods for each
transaction stage.

(evidence: unshielded/*)

### 6.3 Dust Wallet (`@midnight-ntwrk/wallet-sdk-dust-wallet`)

Fee management wallet. Dust is generated over time from registered Night
UTxOs. Each dust coin has generation parameters:

- **`backingNight`**: The Night UTxO backing this dust generation
- **`rate`**: Dust generation rate (dust per unit time)
- **`maxCap`**: Maximum dust that can accumulate
- **`ctime`**: Creation time of the dust generation

The balance at any given time is computed from these parameters, making
it **time-dependent**: `balance(date)` returns the current dust amount
as a `bigint` (in SPECK, the smallest dust unit).

| Export | Kind | Description |
|--------|------|-------------|
| `DustWallet` | function | Factory: `DustWallet(config) → DustWalletClass`. |
| `DustWalletClass` | type | Class with `startWithSeed(seed, dustParams)`, `startWithSecretKey(key, dustParams)`, `restore(state)`. |
| `DustWalletState` | class | State with getters: `address`, `totalCoins`, `availableCoins`, `pendingCoins`, `progress`, and methods: `balance(time)` (returns `bigint`), `availableCoinsWithFullInfo(time)`, `estimateDustGeneration(nightUtxos, time)`. |
| `DustWalletAPI` | type | Instance API: `state`, `start(secretKey)`, `createDustGenerationTransaction(...)`, `calculateFee(txs)`, `estimateFee(...)`, `balanceTransactions(...)`, `getAddress()`, `stop()`. |
| `DefaultDustConfiguration` | type | Default configuration type. |

(evidence: dust/*)

---

## 7. Facade (`@midnight-ntwrk/wallet-sdk-facade`)

The unified entry point. Orchestrates all three wallet types for
transaction balancing — running unshielded, shielded, and dust/fee
balancing in sequence, then merging results.

| Export | Kind | Description |
|--------|------|-------------|
| `WalletFacade` | class | Main facade. `init(params)` creates an instance. Exposes `state()` (Observable), `submitTransaction`, three `balance*` methods, `transferTransaction`, `initSwap`, dust registration/deregistration, and lifecycle methods. |
| `FacadeState` | class | Combined state: `shielded`, `unshielded`, `dust` sub-states plus `pending`. `isSynced` getter checks all three are synced. |
| `BalancingRecipe` | type/const | Union of `FinalizedTransactionRecipe`, `UnboundTransactionRecipe`, `UnprovenTransactionRecipe`. `isRecipe(value)` type guard and `getTransactions(recipe)` extractor. |
| `TokenTransfer` | type | `{ type: RawTokenType, receiverAddress: AddressType, amount: bigint }`. |
| `ShieldedTokenTransfer` | type | Transfer targeting shielded addresses. |
| `UnshieldedTokenTransfer` | type | Transfer targeting unshielded addresses. |
| `CombinedTokenTransfer` | type | Union of shielded and unshielded transfers. |
| `CombinedSwapInputs` | type | Input specification for atomic swaps across token types. |
| `DefaultConfiguration` | type | Intersection of all sub-wallet and service configurations. |

**Note:** `TokenKind` (`'dust' | 'shielded' | 'unshielded'`) and
`TokenKindsToBalance` are used internally but are **not exported**.

The facade exposes its sub-wallets as public readonly fields: `shielded`,
`unshielded`, `dust`, `submissionService`, `pendingTransactionsService`,
`provingService`.

(evidence: facade/*)

---

## 8. Runtime (`@midnight-ntwrk/wallet-sdk-runtime`)

Wallet builder and lifecycle management. The runtime infrastructure
enables seamless hard-fork migration by dispatching wallet operations
to the correct variant based on the current protocol version.

| Export | Kind | Description |
|--------|------|-------------|
| `WalletBuilder` | class | `init()` creates a builder. `withVariant(sinceVersion, variantBuilder)` registers a variant. `build(config?)` produces a wallet class. |
| `Runtime` | namespace | `initHead(args)` starts the runtime with the first variant. `init(args)` starts with a specific variant. `dispatch(runtime, impl)` invokes a polymorphic operation on the active variant. |

**Sub-export `./abstractions`:**

| Export | Kind | Description |
|--------|------|-------------|
| `Variant` | namespace | Variant type definitions and type-level utilities. |
| `VariantBuilder` | namespace | Builder types for constructing variants. |
| `WalletLike` | namespace | Base wallet interface that all variants implement. |
| `WalletRuntimeError` | class | Tagged error (`_tag: 'WalletRuntimeError'`) with `{ message, cause? }`. |
| `StateChange` | namespace | State transition types for version migration. |
| `VersionChangeType` | namespace | Protocol version change classification. |

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
