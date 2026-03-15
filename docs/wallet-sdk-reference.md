# Midnight Wallet SDK Reference

<!-- Assembled by tools/assemble-wallet-docs.mjs -->
<!-- Source: upstream/midnight-wallet @ unknown -->
<!-- Generated: 2026-03-15T00:38:28.943Z -->

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

| Tier | Passing | Failing | Errors | Total |
|------|---------|---------|--------|-------|
| tier1 | 50 | 0 | 0 | 50 |
| **Total** | **50** | **0** | | **50** |

---

## 2. API Surface

### @midnight-ntwrk/wallet-sdk-abstractions (2.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `WalletSeed` | namespace | — |
| `WalletState` | namespace | — |
| `SerializedTransaction` | namespace | — |
| `ProtocolState` | namespace | — |
| `ProtocolVersion` | namespace | — |
| `NetworkId` | namespace | — |
| `SyncProgress` | namespace | — |

### @midnight-ntwrk/wallet-sdk-address-format (3.0.1)

| Symbol | Kind | Members |
|--------|------|---------|
| `mainnet` | const | — |
| `NetworkId` | type | — |
| `FormatContext` | type | — |
| `Field` | type | — |
| `BLSScalar` | const | — |
| `ScaleBigInt` | const | — |
| `Bech32mSymbol` | const | — |
| `HasCodec` | type | — |
| `CodecTarget` | type | — |
| `MidnightBech32m` | class | — |
| `Bech32mCodec` | class | — |
| `ShieldedAddress` | class | — |
| `ShieldedEncryptionSecretKey` | class | — |
| `ShieldedCoinPublicKey` | class | — |
| `ShieldedEncryptionPublicKey` | class | — |
| `UnshieldedAddress` | class | — |
| `DustAddress` | class | — |

### @midnight-ntwrk/wallet-sdk-capabilities (3.1.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `InsufficientFundsError` | class | — |
| `BalanceRecipe` | interface | — |
| `CoinSelection` | type | — |
| `BalanceRecipeProps` | type | — |
| `getBalanceRecipe` | const | — |
| `createCounterOffer` | const | — |
| `chooseCoin` | const | — |
| `TransactionCostModel` | interface | — |
| `CounterOffer` | class | — |
| `TokenType` | type | — |
| `TokenValue` | type | — |
| `CoinRecipe` | interface | — |
| `Imbalance` | type | — |
| `Imbalances` | type | — |
| `PendingTransactionsService` | type | — |
| `IndexerClientConnection` | type | — |
| `DefaultPendingTransactionsServiceConfiguration` | type | — |
| `InitParams` | type | — |
| `PendingTransactionsServiceImpl` | class | — |
| `PendingTransactionsServiceEffect` | type | — |
| `PendingTransactionsServiceEffectImpl` | class | — |
| `PendingTransactions` | namespace | — |
| `ProvingError` | class | — |
| `ProvingServiceEffect` | interface | — |
| `ProvingService` | interface | — |
| `UnboundTransaction` | type | — |
| `fromProvingProviderEffect` | const | — |
| `fromProvingProvider` | const | — |
| `ServerProvingConfiguration` | type | — |
| `WasmProvingConfiguration` | type | — |
| `DefaultProvingConfiguration` | type | — |
| `makeServerProvingServiceEffect` | const | — |
| `makeWasmProvingServiceEffect` | const | — |
| `makeSimulatorProvingServiceEffect` | const | — |
| `makeDefaultProvingServiceEffect` | const | — |
| `makeDefaultProvingService` | const | — |
| `makeServerProvingService` | const | — |
| `makeWasmProvingService` | const | — |
| `makeSimulatorProvingService` | const | — |
| `SubmissionEvent` | const | — |
| `Finalized` | type | — |
| `Submitted` | type | — |
| `InBlock` | type | — |
| `SubmissionError` | class | — |
| `SubmitTransactionMethod` | type | — |
| `SubmitTransactionMethodEffect` | type | — |
| `SubmissionServiceEffect` | interface | — |
| `SubmissionService` | interface | — |
| `DefaultSubmissionConfiguration` | type | — |
| `makeDefaultSubmissionServiceEffect` | const | — |
| `makeDefaultSubmissionService` | const | — |
| `SimulatorSubmissionConfiguration` | type | — |
| `makeSimulatorSubmissionService` | const | — |

#### Sub-export: `./balancer`

| Symbol | Kind | Members |
|--------|------|---------|
| `InsufficientFundsError` | class | — |
| `BalanceRecipe` | interface | — |
| `CoinSelection` | type | — |
| `BalanceRecipeProps` | type | — |
| `getBalanceRecipe` | const | — |
| `createCounterOffer` | const | — |
| `chooseCoin` | const | — |
| `TransactionCostModel` | interface | — |
| `CounterOffer` | class | — |
| `TokenType` | type | — |
| `TokenValue` | type | — |
| `CoinRecipe` | interface | — |
| `Imbalance` | type | — |
| `Imbalances` | type | — |

#### Sub-export: `./submission`

| Symbol | Kind | Members |
|--------|------|---------|
| `SubmissionEvent` | const | — |
| `Finalized` | type | — |
| `Submitted` | type | — |
| `InBlock` | type | — |
| `SubmissionError` | class | — |
| `SubmitTransactionMethod` | type | — |
| `SubmitTransactionMethodEffect` | type | — |
| `SubmissionServiceEffect` | interface | — |
| `SubmissionService` | interface | — |
| `DefaultSubmissionConfiguration` | type | — |
| `makeDefaultSubmissionServiceEffect` | const | — |
| `makeDefaultSubmissionService` | const | — |
| `SimulatorSubmissionConfiguration` | type | — |
| `makeSimulatorSubmissionService` | const | — |

#### Sub-export: `./pendingTransactions`

| Symbol | Kind | Members |
|--------|------|---------|
| `PendingTransactionsService` | type | — |
| `IndexerClientConnection` | type | — |
| `DefaultPendingTransactionsServiceConfiguration` | type | — |
| `InitParams` | type | — |
| `PendingTransactionsServiceImpl` | class | — |
| `PendingTransactionsServiceEffect` | type | — |
| `PendingTransactionsServiceEffectImpl` | class | — |
| `PendingTransactions` | namespace | — |

#### Sub-export: `./proving`

| Symbol | Kind | Members |
|--------|------|---------|
| `ProvingError` | class | — |
| `ProvingServiceEffect` | interface | — |
| `ProvingService` | interface | — |
| `UnboundTransaction` | type | — |
| `fromProvingProviderEffect` | const | — |
| `fromProvingProvider` | const | — |
| `ServerProvingConfiguration` | type | — |
| `WasmProvingConfiguration` | type | — |
| `DefaultProvingConfiguration` | type | — |
| `makeServerProvingServiceEffect` | const | — |
| `makeWasmProvingServiceEffect` | const | — |
| `makeSimulatorProvingServiceEffect` | const | — |
| `makeDefaultProvingServiceEffect` | const | — |
| `makeDefaultProvingService` | const | — |
| `makeServerProvingService` | const | — |
| `makeWasmProvingService` | const | — |
| `makeSimulatorProvingService` | const | — |

### @midnight-ntwrk/wallet-sdk-dust-wallet (2.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `DustWalletCapabilities` | type | — |
| `DustWalletState` | class | — |
| `DustWalletAPI` | type | — |
| `DustWallet` | type | — |
| `DustWalletClass` | interface | — |
| `DefaultDustConfiguration` | type | — |

#### Sub-export: `./v1`

| Symbol | Kind | Members |
|--------|------|---------|
| `PublicKey` | type | — |
| `CoreWallet` | type | — |
| `DustWalletCapabilities` | type | — |
| `DustWalletState` | class | — |
| `DustWalletAPI` | type | — |
| `DustWallet` | type | — |
| `DustWalletClass` | interface | — |
| `DefaultDustConfiguration` | type | — |
| `Keys` | namespace | — |
| `Simulator` | namespace | — |
| `SyncService` | namespace | — |
| `Transacting` | namespace | — |
| `Context` | type | — |
| `AnyContext` | type | — |
| `V1Tag` | const | — |
| `DefaultRunningV1` | type | — |
| `RunningV1Variant` | class | — |
| `BaseV1Configuration` | type | — |
| `DefaultV1Configuration` | type | — |
| `DefaultV1Variant` | type | — |
| `V1Variant` | type | — |
| `DefaultV1Builder` | type | — |
| `V1Builder` | class | — |
| `Dust` | type | — |
| `DustWithNullifier` | type | — |
| `DustFullInfo` | type | — |
| `DustGenerationDetails` | type | — |
| `DustGenerationInfo` | type | — |
| `UtxoWithMeta` | type | — |
| `AnyTransaction` | type | — |
| `UnprovenDustSpend` | type | — |
| `NetworkId` | type | — |
| `TotalCostParameters` | type | — |
| `CoinsAndBalances` | namespace | — |

### @midnight-ntwrk/wallet-sdk-facade (2.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `FinalizedTransactionRecipe` | type | — |
| `UnboundTransactionRecipe` | type | — |
| `UnprovenTransactionRecipe` | type | — |
| `BalancingRecipe` | type | — |
| `TokenTransfer` | interface | `type`, `receiverAddress`, `amount` |
| `ShieldedTokenTransfer` | type | — |
| `UnshieldedTokenTransfer` | type | — |
| `CombinedTokenTransfer` | type | — |
| `CombinedSwapInputs` | type | — |
| `CombinedSwapOutputs` | type | — |
| `TransactionIdentifier` | type | — |
| `UtxoWithMeta` | type | — |
| `FacadeState` | class | — |
| `DefaultConfiguration` | type | — |
| `InitParams` | type | — |
| `WalletFacade` | class | — |

### @midnight-ntwrk/wallet-sdk-hd (3.0.1)

| Symbol | Kind | Members |
|--------|------|---------|
| `Roles` | const | — |
| `Role` | type | — |
| `HDWallet` | class | — |
| `AccountKey` | class | — |
| `RoleKey` | class | — |
| `CompositeRoleKey` | class | — |
| `mnemonicToWords` | const | — |
| `generateMnemonicWords` | const | — |
| `joinMnemonicWords` | const | — |
| `generateRandomSeed` | const | — |
| `validateMnemonic` | const | — |

### @midnight-ntwrk/wallet-sdk-indexer-client (1.1.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `Connect` | const | — |
| `Disconnect` | const | — |
| `BlockHash` | const | — |
| `TransactionStatus` | const | — |
| `DustLedgerEvents` | const | — |
| `ShieldedTransactions` | const | — |
| `UnshieldedTransactions` | const | — |
| `ZswapEvents` | const | — |
| `Maybe` | type | — |
| `InputMaybe` | type | — |
| `Exact` | type | — |
| `MakeOptional` | type | — |
| `MakeMaybe` | type | — |
| `MakeEmpty` | type | — |
| `Incremental` | type | — |
| `Scalars` | type | — |
| `Block` | type | — |
| `BlockOffset` | type | — |
| `CollapsedMerkleTree` | type | — |
| `CommitteeMember` | type | — |
| `ContractAction` | type | — |
| `ContractActionOffset` | type | — |
| `ContractBalance` | type | — |
| `ContractCall` | type | — |
| `ContractDeploy` | type | — |
| `ContractUpdate` | type | — |
| `DParameter` | type | — |
| `DParameterChange` | type | — |
| `DustGenerationDtimeUpdate` | type | — |
| `DustGenerationStatus` | type | — |
| `DustInitialUtxo` | type | — |
| `DustLedgerEvent` | type | — |
| `DustOutput` | type | — |
| `DustSpendProcessed` | type | — |
| `EpochInfo` | type | — |
| `EpochPerf` | type | — |
| `FirstValidEpoch` | type | — |
| `Mutation` | type | — |
| `MutationConnectArgs` | type | — |
| `MutationDisconnectArgs` | type | — |
| `ParamChange` | type | — |
| `PoolMetadata` | type | — |
| `PresenceEvent` | type | — |
| `Query` | type | — |
| `QueryBlockArgs` | type | — |
| `QueryCommitteeArgs` | type | — |
| `QueryContractActionArgs` | type | — |
| `QueryDustGenerationStatusArgs` | type | — |
| `QueryEpochPerformanceArgs` | type | — |
| `QueryEpochUtilizationArgs` | type | — |
| `QueryPoolMetadataArgs` | type | — |
| `QueryPoolMetadataListArgs` | type | — |
| `QueryRegisteredFirstValidEpochsArgs` | type | — |
| `QueryRegisteredPresenceArgs` | type | — |
| `QueryRegisteredSpoSeriesArgs` | type | — |
| `QueryRegisteredTotalsSeriesArgs` | type | — |
| `QuerySpoByPoolIdArgs` | type | — |
| `QuerySpoCompositeByPoolIdArgs` | type | — |
| `QuerySpoIdentitiesArgs` | type | — |
| `QuerySpoIdentityByPoolIdArgs` | type | — |
| `QuerySpoListArgs` | type | — |
| `QuerySpoPerformanceBySpoSkArgs` | type | — |
| `QuerySpoPerformanceLatestArgs` | type | — |
| `QueryStakeDistributionArgs` | type | — |
| `QueryStakePoolOperatorsArgs` | type | — |
| `QueryTransactionsArgs` | type | — |
| `RegisteredStat` | type | — |
| `RegisteredTotals` | type | — |
| `RegularTransaction` | type | — |
| `RelevantTransaction` | type | — |
| `Segment` | type | — |
| `ShieldedTransactionsEvent` | type | — |
| `ShieldedTransactionsProgress` | type | — |
| `Spo` | type | — |
| `SpoComposite` | type | — |
| `SpoIdentity` | type | — |
| `StakeShare` | type | — |
| `Subscription` | type | — |
| `SubscriptionBlocksArgs` | type | — |
| `SubscriptionContractActionsArgs` | type | — |
| `SubscriptionDustLedgerEventsArgs` | type | — |
| `SubscriptionShieldedTransactionsArgs` | type | — |
| `SubscriptionUnshieldedTransactionsArgs` | type | — |
| `SubscriptionZswapLedgerEventsArgs` | type | — |
| `SystemParameters` | type | — |
| `SystemTransaction` | type | — |
| `TermsAndConditions` | type | — |
| `TermsAndConditionsChange` | type | — |
| `Transaction` | type | — |
| `TransactionFees` | type | — |
| `TransactionOffset` | type | — |
| `TransactionResult` | type | — |
| `TransactionResultStatus` | type | — |
| `UnshieldedTransaction` | type | — |
| `UnshieldedTransactionsEvent` | type | — |
| `UnshieldedTransactionsProgress` | type | — |
| `UnshieldedUtxo` | type | — |
| `ZswapLedgerEvent` | type | — |
| `BlockHashQueryVariables` | type | — |
| `BlockHashQuery` | type | — |
| `ConnectMutationVariables` | type | — |
| `ConnectMutation` | type | — |
| `DisconnectMutationVariables` | type | — |
| `DisconnectMutation` | type | — |
| `TransactionStatusQueryVariables` | type | — |
| `TransactionStatusQuery` | type | — |
| `DustLedgerEventsSubscriptionVariables` | type | — |
| `DustLedgerEventsSubscription` | type | — |
| `ShieldedTransactionsSubscriptionVariables` | type | — |
| `ShieldedTransactionsSubscription` | type | — |
| `UnshieldedTransactionsSubscriptionVariables` | type | — |
| `UnshieldedTransactionsSubscription` | type | — |
| `ZswapEventsSubscriptionVariables` | type | — |
| `ZswapEventsSubscription` | type | — |
| `BlockHashDocument` | const | — |
| `ConnectDocument` | const | — |
| `DisconnectDocument` | const | — |
| `TransactionStatusDocument` | const | — |
| `DustLedgerEventsDocument` | const | — |
| `ShieldedTransactionsDocument` | const | — |
| `UnshieldedTransactionsDocument` | const | — |
| `ZswapEventsDocument` | const | — |

#### Sub-export: `./effect`

| Symbol | Kind | Members |
|--------|------|---------|
| `Query` | namespace | — |
| `Subscription` | namespace | — |
| `QueryClient` | class | — |
| `HttpQueryClient` | namespace | — |
| `SubscriptionClient` | class | — |
| `WsSubscriptionClient` | namespace | — |
| `ConnectionHelper` | namespace | — |
| `QueryRunner` | namespace | — |

### @midnight-ntwrk/wallet-sdk-node-client (1.0.1)

| Symbol | Kind | Members |
|--------|------|---------|
| `Config` | type | — |
| `makeConfig` | const | — |
| `DEFAULT_CONFIG` | const | — |
| `PolkadotNodeClient` | class | — |

#### Sub-export: `./effect`

| Symbol | Kind | Members |
|--------|------|---------|
| `NodeClient` | namespace | — |
| `Config` | type | — |
| `DEFAULT_CONFIG` | const | — |
| `makeConfig` | const | — |
| `PolkadotNodeClient` | class | — |
| `SubmissionEvent` | namespace | — |
| `NodeClientError` | namespace | — |

#### Sub-export: `./testing`

| Symbol | Kind | Members |
|--------|------|---------|
| `TestTransactions` | namespace | — |

### @midnight-ntwrk/wallet-sdk-prover-client (1.1.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `HttpProverClient` | class | — |

#### Sub-export: `./effect`

| Symbol | Kind | Members |
|--------|------|---------|
| `ProverClient` | namespace | — |
| `HttpProverClient` | namespace | — |
| `WasmProver` | namespace | — |

### @midnight-ntwrk/wallet-sdk-runtime (1.0.1)

| Symbol | Kind | Members |
|--------|------|---------|
| `WalletBuilder` | class | — |
| `BuildArguments` | type | — |
| `FullConfiguration` | type | — |
| `Runtime` | namespace | — |

#### Sub-export: `./abstractions`

| Symbol | Kind | Members |
|--------|------|---------|
| `Variant` | namespace | — |
| `VariantBuilder` | namespace | — |
| `WalletLike` | namespace | — |
| `WalletRuntimeError` | class | — |
| `StateChange` | namespace | — |
| `VersionChangeType` | namespace | — |

### @midnight-ntwrk/wallet-sdk-shielded (2.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `ShieldedWalletCapabilities` | type | — |
| `UnboundTransaction` | type | — |
| `ShieldedWalletState` | class | — |
| `ShieldedWallet` | type | — |
| `ShieldedWalletClass` | type | — |
| `ShieldedWalletAPI` | type | — |
| `CustomizedShieldedWallet` | type | — |
| `DefaultShieldedConfiguration` | type | — |
| `CustomizedShieldedWalletClass` | interface | — |
| `CustomShieldedWallet` | function | — |

#### Sub-export: `./v1`

| Symbol | Kind | Members |
|--------|------|---------|
| `BaseV1Configuration` | type | — |
| `DefaultV1Configuration` | type | — |
| `V1Variant` | type | — |
| `AnyV1Variant` | type | — |
| `DefaultV1Variant` | type | — |
| `TransactionOf` | type | — |
| `AuxDataOf` | type | — |
| `SerializedStateOf` | type | — |
| `DefaultV1Builder` | type | — |
| `V1Builder` | class | — |
| `Sync` | namespace | — |
| `Transacting` | namespace | — |
| `TransactionHistory` | namespace | — |
| `Serialization` | namespace | — |
| `CoinsAndBalances` | namespace | — |
| `Keys` | namespace | — |
| `Context` | type | — |
| `AnyContext` | type | — |
| `V1Tag` | const | — |
| `DefaultRunningV1` | type | — |
| `RunningV1Variant` | class | — |
| `Simulator` | namespace | — |
| `WalletError` | namespace | — |
| `PublicKeys` | type | — |
| `CoinHashesMap` | type | — |
| `CoreWallet` | type | — |
| `TransactionOps` | type | — |

### @midnight-ntwrk/wallet-sdk-unshielded-wallet (2.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `UnshieldedWalletCapabilities` | type | — |
| `UnshieldedWalletState` | class | — |
| `UnshieldedWallet` | type | — |
| `DefaultUnshieldedConfiguration` | type | — |
| `UnshieldedWalletClass` | type | — |
| `UnshieldedWalletAPI` | type | — |
| `CustomizedUnshieldedWallet` | type | — |
| `CustomizedUnshieldedWalletClass` | interface | — |
| `CustomUnshieldedWallet` | function | — |
| `TransactionHistory` | type | — |
| `InMemoryTransactionHistoryStorage` | class | — |
| `NoOpTransactionHistoryStorage` | class | — |
| `TransactionHash` | type | — |
| `TransactionHistoryEntrySchema` | const | — |
| `TransactionHistoryEntry` | type | — |
| `TransactionHistoryStorage` | interface | — |
| `PublicKey` | type | — |
| `UnshieldedKeystore` | interface | — |
| `createKeystore` | const | — |

#### Sub-export: `./v1`

| Symbol | Kind | Members |
|--------|------|---------|
| `BaseV1Configuration` | type | — |
| `DefaultV1Configuration` | type | — |
| `V1Variant` | type | — |
| `AnyV1Variant` | type | — |
| `DefaultV1Variant` | type | — |
| `TransactionOf` | type | — |
| `SerializedStateOf` | type | — |
| `DefaultV1Builder` | type | — |
| `V1Builder` | class | — |
| `Sync` | namespace | — |
| `SyncProgress` | namespace | — |
| `Transacting` | namespace | — |
| `TransactionHistory` | namespace | — |
| `Serialization` | namespace | — |
| `CoinsAndBalances` | namespace | — |
| `Keys` | namespace | — |
| `Context` | type | — |
| `AnyContext` | type | — |
| `V1Tag` | const | — |
| `DefaultRunningV1` | type | — |
| `RunningV1Variant` | class | — |
| `Simulator` | namespace | — |
| `WalletError` | namespace | — |
| `CoreWallet` | type | — |
| `UnboundTransaction` | type | — |
| `IntentOf` | type | — |
| `TransactionOps` | type | — |
| `TransactionHistoryStorage` | namespace | — |
| `UnshieldedState` | namespace | — |

### @midnight-ntwrk/wallet-sdk-utilities (1.0.1)

| Symbol | Kind | Members |
|--------|------|---------|
| `ArrayOps` | namespace | — |
| `BlobOps` | namespace | — |
| `DateOps` | namespace | — |
| `EitherOps` | namespace | — |
| `Fluent` | namespace | — |
| `HList` | namespace | — |
| `LedgerOps` | namespace | — |
| `ObservableOps` | namespace | — |
| `Poly` | namespace | — |
| `RecordOps` | namespace | — |
| `SafeBigInt` | namespace | — |

#### Sub-export: `./networking`

| Symbol | Kind | Members |
|--------|------|---------|
| `HttpURL` | namespace | — |
| `WsURL` | namespace | — |
| `InvalidProtocolSchemeError` | class | — |
| `FailedToDeriveWebSocketUrlError` | class | — |
| `URLError` | type | — |
| `ClientError` | class | — |
| `ServerError` | class | — |

#### Sub-export: `./types`

| Symbol | Kind | Members |
|--------|------|---------|
| `CanAssign` | type | — |
| `Expect` | type | — |
| `ItemType` | type | — |
| `Equal` | type | — |

#### Sub-export: `./testing`

| Symbol | Kind | Members |
|--------|------|---------|
| `TestContainers` | namespace | — |
| `getRepositoryRoot` | function | — |
| `getComposeDirectory` | function | — |
| `BuildTestEnvironmentVariablesOptions` | interface | — |
| `buildTestEnvironmentVariables` | function | — |

**Total: 465 symbols, 3 members across 13 packages**

---

## 3. Foundation Layer

### 3.1 Abstractions (`@midnight-ntwrk/wallet-sdk-abstractions`)

Branded types that form the domain vocabulary of the wallet SDK.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

| Test | Status | Detail |
|------|--------|--------|
| abstractions/WalletSeed-from-bytes | PASS | — |
| abstractions/WalletSeed-from-string | PASS | — |
| abstractions/WalletSeed-is-predicate | PASS | — |
| abstractions/WalletState-from-string | PASS | — |
| abstractions/SerializedTransaction-of | PASS | — |
| abstractions/ProtocolVersion-construction | PASS | — |
| abstractions/ProtocolVersion-min-max | PASS | — |
| abstractions/ProtocolVersion-range-within | PASS | — |
| abstractions/ProtocolVersion-is-predicate | PASS | — |
| abstractions/NetworkId-well-known | PASS | — |
| abstractions/SyncProgress-create | PASS | — |
| abstractions/SyncProgress-strictly-complete | PASS | — |
| abstractions/SyncProgress-not-complete | PASS | — |

### 3.2 Utilities (`@midnight-ntwrk/wallet-sdk-utilities`)

Domain-agnostic operations used across the SDK.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

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

| Test | Status | Detail |
|------|--------|--------|
| hd/mnemonic-generates-24-words | PASS | — |
| hd/mnemonic-validates-roundtrip | PASS | — |
| hd/invalid-mnemonic-rejected | PASS | — |
| hd/random-seed-length | PASS | — |
| hd/wallet-from-seed | PASS | — |
| hd/roles-values | PASS | — |
| hd/derive-key-at-index-0 | PASS | — |
| hd/different-roles-different-keys | PASS | — |
| hd/different-accounts-different-keys | PASS | — |
| hd/composite-role-keys | PASS | — |
| hd/deterministic-derivation | PASS | — |

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

| Test | Status | Detail |
|------|--------|--------|
| address-format/BLSScalar-is-32-bytes | PASS | — |
| address-format/ScaleBigInt-encode-decode-roundtrip | PASS | — |
| address-format/ScaleBigInt-zero | PASS | — |
| address-format/ScaleBigInt-large-value | PASS | — |
| address-format/ShieldedCoinPublicKey-construction | PASS | — |
| address-format/ShieldedCoinPublicKey-equality | PASS | — |
| address-format/ShieldedEncryptionPublicKey-construction | PASS | — |
| address-format/ShieldedAddress-composition | PASS | — |
| address-format/UnshieldedAddress-hex-roundtrip | PASS | — |
| address-format/UnshieldedAddress-equality | PASS | — |
| address-format/DustAddress-from-bigint | PASS | — |
| address-format/DustAddress-rejects-over-modulus | PASS | — |
| address-format/DustAddress-validates-modulus | PASS | — |
| address-format/MidnightBech32m-encode-shielded | PASS | — |
| address-format/MidnightBech32m-encode-unshielded | PASS | — |
| address-format/MidnightBech32m-roundtrip | PASS | — |

---

## 4. Infrastructure Clients

### 4.1 Node Client (`@midnight-ntwrk/wallet-sdk-node-client`)

Polkadot RPC client for submitting transactions to the Midnight node.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

### 4.2 Indexer Client (`@midnight-ntwrk/wallet-sdk-indexer-client`)

GraphQL client for querying the chain indexer. Provides queries and
subscriptions for wallet synchronization.

**Note:** This package includes ~120 auto-generated GraphQL types from
the indexer schema. The reference below covers the key query/subscription
exports; the full generated type inventory is in the appendix.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

### 4.3 Prover Client (`@midnight-ntwrk/wallet-sdk-prover-client`)

HTTP client for the ZK proof generation server.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

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

*No evidence collected yet.*

### 5.2 Submission (`@midnight-ntwrk/wallet-sdk-capabilities/submission`)

Transaction submission lifecycle: submit → in-block → finalized.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

### 5.3 Pending Transactions (`@midnight-ntwrk/wallet-sdk-capabilities/pendingTransactions`)

Tracks transactions that have been submitted but not yet finalized.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

### 5.4 Proving (`@midnight-ntwrk/wallet-sdk-capabilities/proving`)

ZK proof generation services. Supports multiple backends: server-side,
WASM (in-browser), and simulator (for testing).

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

---

## 6. Wallet Implementations

### 6.1 Shielded Wallet (`@midnight-ntwrk/wallet-sdk-shielded`)

Privacy-preserving wallet for custom shielded tokens. Uses zero-knowledge
proofs for all operations — balances and transaction details are hidden
from observers.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

### 6.2 Unshielded Wallet (`@midnight-ntwrk/wallet-sdk-unshielded-wallet`)

Wallet for Night (the native token) and other unshielded tokens. Operations
are publicly visible on the ledger.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

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

*No evidence collected yet.*

---

## 7. Facade (`@midnight-ntwrk/wallet-sdk-facade`)

The unified entry point. Orchestrates all three wallet types for
transaction balancing — running unshielded, shielded, and dust/fee
balancing in sequence.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

---

## 8. Runtime (`@midnight-ntwrk/wallet-sdk-runtime`)

Wallet builder and lifecycle management. Registers wallet variants
keyed by protocol version ranges, enabling seamless hard-fork migration.

| Export | Kind | Description |
|--------|------|-------------|
| | | |

*No evidence collected yet.*

---

## Appendix A: Generated GraphQL Types (indexer-client)

The indexer-client package exports ~120 auto-generated types from the
indexer's GraphQL schema. These are listed here for completeness.

| Symbol | Kind |
|--------|------|
| `Connect` | const |
| `Disconnect` | const |
| `BlockHash` | const |
| `TransactionStatus` | const |
| `DustLedgerEvents` | const |
| `ShieldedTransactions` | const |
| `UnshieldedTransactions` | const |
| `ZswapEvents` | const |
| `Maybe` | type |
| `InputMaybe` | type |
| `Exact` | type |
| `MakeOptional` | type |
| `MakeMaybe` | type |
| `MakeEmpty` | type |
| `Incremental` | type |
| `Scalars` | type |
| `Block` | type |
| `BlockOffset` | type |
| `CollapsedMerkleTree` | type |
| `CommitteeMember` | type |
| `ContractAction` | type |
| `ContractActionOffset` | type |
| `ContractBalance` | type |
| `ContractCall` | type |
| `ContractDeploy` | type |
| `ContractUpdate` | type |
| `DParameter` | type |
| `DParameterChange` | type |
| `DustGenerationDtimeUpdate` | type |
| `DustGenerationStatus` | type |
| `DustInitialUtxo` | type |
| `DustLedgerEvent` | type |
| `DustOutput` | type |
| `DustSpendProcessed` | type |
| `EpochInfo` | type |
| `EpochPerf` | type |
| `FirstValidEpoch` | type |
| `Mutation` | type |
| `MutationConnectArgs` | type |
| `MutationDisconnectArgs` | type |
| `ParamChange` | type |
| `PoolMetadata` | type |
| `PresenceEvent` | type |
| `Query` | type |
| `QueryBlockArgs` | type |
| `QueryCommitteeArgs` | type |
| `QueryContractActionArgs` | type |
| `QueryDustGenerationStatusArgs` | type |
| `QueryEpochPerformanceArgs` | type |
| `QueryEpochUtilizationArgs` | type |
| `QueryPoolMetadataArgs` | type |
| `QueryPoolMetadataListArgs` | type |
| `QueryRegisteredFirstValidEpochsArgs` | type |
| `QueryRegisteredPresenceArgs` | type |
| `QueryRegisteredSpoSeriesArgs` | type |
| `QueryRegisteredTotalsSeriesArgs` | type |
| `QuerySpoByPoolIdArgs` | type |
| `QuerySpoCompositeByPoolIdArgs` | type |
| `QuerySpoIdentitiesArgs` | type |
| `QuerySpoIdentityByPoolIdArgs` | type |
| `QuerySpoListArgs` | type |
| `QuerySpoPerformanceBySpoSkArgs` | type |
| `QuerySpoPerformanceLatestArgs` | type |
| `QueryStakeDistributionArgs` | type |
| `QueryStakePoolOperatorsArgs` | type |
| `QueryTransactionsArgs` | type |
| `RegisteredStat` | type |
| `RegisteredTotals` | type |
| `RegularTransaction` | type |
| `RelevantTransaction` | type |
| `Segment` | type |
| `ShieldedTransactionsEvent` | type |
| `ShieldedTransactionsProgress` | type |
| `Spo` | type |
| `SpoComposite` | type |
| `SpoIdentity` | type |
| `StakeShare` | type |
| `Subscription` | type |
| `SubscriptionBlocksArgs` | type |
| `SubscriptionContractActionsArgs` | type |
| `SubscriptionDustLedgerEventsArgs` | type |
| `SubscriptionShieldedTransactionsArgs` | type |
| `SubscriptionUnshieldedTransactionsArgs` | type |
| `SubscriptionZswapLedgerEventsArgs` | type |
| `SystemParameters` | type |
| `SystemTransaction` | type |
| `TermsAndConditions` | type |
| `TermsAndConditionsChange` | type |
| `Transaction` | type |
| `TransactionFees` | type |
| `TransactionOffset` | type |
| `TransactionResult` | type |
| `TransactionResultStatus` | type |
| `UnshieldedTransaction` | type |
| `UnshieldedTransactionsEvent` | type |
| `UnshieldedTransactionsProgress` | type |
| `UnshieldedUtxo` | type |
| `ZswapLedgerEvent` | type |
| `BlockHashQueryVariables` | type |
| `BlockHashQuery` | type |
| `ConnectMutationVariables` | type |
| `ConnectMutation` | type |
| `DisconnectMutationVariables` | type |
| `DisconnectMutation` | type |
| `TransactionStatusQueryVariables` | type |
| `TransactionStatusQuery` | type |
| `DustLedgerEventsSubscriptionVariables` | type |
| `DustLedgerEventsSubscription` | type |
| `ShieldedTransactionsSubscriptionVariables` | type |
| `ShieldedTransactionsSubscription` | type |
| `UnshieldedTransactionsSubscriptionVariables` | type |
| `UnshieldedTransactionsSubscription` | type |
| `ZswapEventsSubscriptionVariables` | type |
| `ZswapEventsSubscription` | type |
| `BlockHashDocument` | const |
| `ConnectDocument` | const |
| `DisconnectDocument` | const |
| `TransactionStatusDocument` | const |
| `DustLedgerEventsDocument` | const |
| `ShieldedTransactionsDocument` | const |
| `UnshieldedTransactionsDocument` | const |
| `ZswapEventsDocument` | const |
| `Query` | namespace |
| `Subscription` | namespace |
| `QueryClient` | class |
| `HttpQueryClient` | namespace |
| `SubscriptionClient` | class |
| `WsSubscriptionClient` | namespace |
| `ConnectionHelper` | namespace |
| `QueryRunner` | namespace |

## Appendix B: Evidence Index

Complete index of all verification evidence, organized by test tier
and package.

### standalone

| Test | Tier | Status |
|------|------|--------|
| abstractions/WalletSeed-from-bytes | tier1 | pass |
| abstractions/WalletSeed-from-string | tier1 | pass |
| abstractions/WalletSeed-is-predicate | tier1 | pass |
| abstractions/WalletState-from-string | tier1 | pass |
| abstractions/SerializedTransaction-of | tier1 | pass |
| abstractions/ProtocolVersion-construction | tier1 | pass |
| abstractions/ProtocolVersion-min-max | tier1 | pass |
| abstractions/ProtocolVersion-range-within | tier1 | pass |
| abstractions/ProtocolVersion-is-predicate | tier1 | pass |
| abstractions/NetworkId-well-known | tier1 | pass |
| abstractions/SyncProgress-create | tier1 | pass |
| abstractions/SyncProgress-strictly-complete | tier1 | pass |
| abstractions/SyncProgress-not-complete | tier1 | pass |
| address-format/BLSScalar-is-32-bytes | tier1 | pass |
| address-format/ScaleBigInt-encode-decode-roundtrip | tier1 | pass |
| address-format/ScaleBigInt-zero | tier1 | pass |
| address-format/ScaleBigInt-large-value | tier1 | pass |
| address-format/ShieldedCoinPublicKey-construction | tier1 | pass |
| address-format/ShieldedCoinPublicKey-equality | tier1 | pass |
| address-format/ShieldedEncryptionPublicKey-construction | tier1 | pass |
| address-format/ShieldedAddress-composition | tier1 | pass |
| address-format/UnshieldedAddress-hex-roundtrip | tier1 | pass |
| address-format/UnshieldedAddress-equality | tier1 | pass |
| address-format/DustAddress-from-bigint | tier1 | pass |
| address-format/DustAddress-rejects-over-modulus | tier1 | pass |
| address-format/DustAddress-validates-modulus | tier1 | pass |
| address-format/MidnightBech32m-encode-shielded | tier1 | pass |
| address-format/MidnightBech32m-encode-unshielded | tier1 | pass |
| address-format/MidnightBech32m-roundtrip | tier1 | pass |
| hd/mnemonic-generates-24-words | tier1 | pass |
| hd/mnemonic-validates-roundtrip | tier1 | pass |
| hd/invalid-mnemonic-rejected | tier1 | pass |
| hd/random-seed-length | tier1 | pass |
| hd/wallet-from-seed | tier1 | pass |
| hd/roles-values | tier1 | pass |
| hd/derive-key-at-index-0 | tier1 | pass |
| hd/different-roles-different-keys | tier1 | pass |
| hd/different-accounts-different-keys | tier1 | pass |
| hd/composite-role-keys | tier1 | pass |
| hd/deterministic-derivation | tier1 | pass |

### typecheck

| Test | Tier | Status |
|------|------|--------|
| typecheck/abstractions | tier1 | pass |
| typecheck/address-format | tier1 | pass |
| typecheck/capabilities | tier1 | pass |
| typecheck/dust-wallet | tier1 | pass |
| typecheck/facade | tier1 | pass |
| typecheck/hd | tier1 | pass |
| typecheck/node-client | tier1 | pass |
| typecheck/prover-client | tier1 | pass |
| typecheck/runtime | tier1 | pass |
| typecheck/utilities | tier1 | pass |


## Appendix C: Version Information

| Component | Version |
|-----------|---------|
| Wallet SDK upstream | unknown |
| Node | 0.22.0-rc.6 |
| Indexer | 4.0.0-rc.5 |
| Proof Server | 8.0.2 |
| Ledger | v8 |
| TypeScript | 5.9.3 |
| Node.js | 22 |
