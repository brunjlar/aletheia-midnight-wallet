# Wallet SDK — API Surface

*Extracted: 2026-03-21T21:33:00.511Z*

## @midnight-ntwrk/wallet-sdk-abstractions (2.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `WalletSeed` | namespace | — |
| `WalletState` | namespace | — |
| `SerializedTransaction` | namespace | — |
| `ProtocolState` | namespace | — |
| `ProtocolVersion` | namespace | — |
| `NetworkId` | namespace | — |
| `SyncProgress` | namespace | — |

## @midnight-ntwrk/wallet-sdk-address-format (3.1.0)

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

## @midnight-ntwrk/wallet-sdk-capabilities (3.2.0)

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

### Sub-export: `./balancer`

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

### Sub-export: `./submission`

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

### Sub-export: `./pendingTransactions`

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

### Sub-export: `./proving`

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

## @midnight-ntwrk/wallet-sdk-dust-wallet (3.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `DustWalletCapabilities` | type | — |
| `DustWalletState` | class | — |
| `DustWalletAPI` | type | — |
| `DustWallet` | type | — |
| `DustWalletClass` | interface | — |
| `DefaultDustConfiguration` | type | — |

### Sub-export: `./v1`

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

## @midnight-ntwrk/wallet-sdk-facade (3.0.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `FinalizedTransactionRecipe` | type | — |
| `UnboundTransactionRecipe` | type | — |
| `UnprovenTransactionRecipe` | type | — |
| `BalancingRecipe` | type | — |
| `TokenTransfer` | interface | type, receiverAddress, amount |
| `ShieldedTokenTransfer` | type | — |
| `UnshieldedTokenTransfer` | type | — |
| `CombinedTokenTransfer` | type | — |
| `CombinedSwapInputs` | type | — |
| `CombinedSwapOutputs` | type | — |
| `TransactionIdentifier` | type | — |
| `UtxoWithMeta` | type | — |
| `FacadeState` | class | — |
| `TermsAndConditions` | type | — |
| `FetchTermsAndConditionsConfiguration` | type | — |
| `DefaultConfiguration` | type | — |
| `InitParams` | type | — |
| `WalletFacade` | class | — |

## @midnight-ntwrk/wallet-sdk-hd (3.0.1)

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

## @midnight-ntwrk/wallet-sdk-indexer-client (1.2.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `Connect` | const | — |
| `Disconnect` | const | — |
| `BlockHash` | const | — |
| `FetchTermsAndConditions` | const | — |
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
| `FetchTermsAndConditionsQueryVariables` | type | — |
| `FetchTermsAndConditionsQuery` | type | — |
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
| `FetchTermsAndConditionsDocument` | const | — |
| `TransactionStatusDocument` | const | — |
| `DustLedgerEventsDocument` | const | — |
| `ShieldedTransactionsDocument` | const | — |
| `UnshieldedTransactionsDocument` | const | — |
| `ZswapEventsDocument` | const | — |

### Sub-export: `./effect`

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

## @midnight-ntwrk/wallet-sdk-node-client (1.1.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `Config` | type | — |
| `makeConfig` | const | — |
| `DEFAULT_CONFIG` | const | — |
| `PolkadotNodeClient` | class | — |

### Sub-export: `./effect`

| Symbol | Kind | Members |
|--------|------|---------|
| `NodeClient` | namespace | — |
| `Config` | type | — |
| `DEFAULT_CONFIG` | const | — |
| `makeConfig` | const | — |
| `PolkadotNodeClient` | class | — |
| `SubmissionEvent` | namespace | — |
| `NodeClientError` | namespace | — |

### Sub-export: `./testing`

| Symbol | Kind | Members |
|--------|------|---------|
| `TestTransactions` | namespace | — |

## @midnight-ntwrk/wallet-sdk-prover-client (1.2.0)

| Symbol | Kind | Members |
|--------|------|---------|
| `HttpProverClient` | class | — |

### Sub-export: `./effect`

| Symbol | Kind | Members |
|--------|------|---------|
| `ProverClient` | namespace | — |
| `HttpProverClient` | namespace | — |
| `WasmProver` | namespace | — |

## @midnight-ntwrk/wallet-sdk-runtime (1.0.2)

| Symbol | Kind | Members |
|--------|------|---------|
| `WalletBuilder` | class | — |
| `BuildArguments` | type | — |
| `FullConfiguration` | type | — |
| `Runtime` | namespace | — |

### Sub-export: `./abstractions`

| Symbol | Kind | Members |
|--------|------|---------|
| `Variant` | namespace | — |
| `VariantBuilder` | namespace | — |
| `WalletLike` | namespace | — |
| `WalletRuntimeError` | class | — |
| `StateChange` | namespace | — |
| `VersionChangeType` | namespace | — |

## @midnight-ntwrk/wallet-sdk-shielded (2.1.0)

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

### Sub-export: `./v1`

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

## @midnight-ntwrk/wallet-sdk-unshielded-wallet (2.1.0)

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

### Sub-export: `./v1`

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

## @midnight-ntwrk/wallet-sdk-utilities (1.1.0)

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

### Sub-export: `./networking`

| Symbol | Kind | Members |
|--------|------|---------|
| `HttpURL` | namespace | — |
| `WsURL` | namespace | — |
| `InvalidProtocolSchemeError` | class | — |
| `FailedToDeriveWebSocketUrlError` | class | — |
| `URLError` | type | — |
| `ClientError` | class | — |
| `ServerError` | class | — |

### Sub-export: `./types`

| Symbol | Kind | Members |
|--------|------|---------|
| `CanAssign` | type | — |
| `Expect` | type | — |
| `ItemType` | type | — |
| `Equal` | type | — |

### Sub-export: `./testing`

| Symbol | Kind | Members |
|--------|------|---------|
| `TestContainers` | namespace | — |
| `getRepositoryRoot` | function | — |
| `getComposeDirectory` | function | — |
| `BuildTestEnvironmentVariablesOptions` | interface | — |
| `buildTestEnvironmentVariables` | function | — |

---
**Total: 471 symbols, 3 members across 13 packages**
