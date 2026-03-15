// Type-check evidence: @midnight-ntwrk/wallet-sdk-abstractions
// Verifies that all documented branded types exist and are constructable.

import {
  WalletSeed,
  WalletState,
  SerializedTransaction,
  ProtocolState,
  ProtocolVersion,
  NetworkId,
  SyncProgress,
} from '@midnight-ntwrk/wallet-sdk-abstractions';

// --- WalletSeed ---
// [evidence: abstractions/WalletSeed-branded-type]
// WalletSeed is a branded Uint8Array
const seed: WalletSeed.WalletSeed = WalletSeed.WalletSeed(new Uint8Array(32));
const seedFromStr: WalletSeed.WalletSeed = WalletSeed.fromString('00'.repeat(32));
const isSeed: boolean = WalletSeed.is(seed);

// --- WalletState ---
// [evidence: abstractions/WalletState-branded-type]
const state: WalletState.WalletState = WalletState.WalletState('serialized-state');
const isState: boolean = WalletState.is(state);

// --- SerializedTransaction ---
// [evidence: abstractions/SerializedTransaction-branded-type]
// SerializedTransaction has `of` and `from` helpers but no `is` predicate
const stx: SerializedTransaction.SerializedTransaction =
  SerializedTransaction.of(new Uint8Array(100));

// --- ProtocolVersion ---
// [evidence: abstractions/ProtocolVersion-branded-type]
const pv: ProtocolVersion.ProtocolVersion = ProtocolVersion.ProtocolVersion(1n);
const pvMin: ProtocolVersion.ProtocolVersion = ProtocolVersion.MinSupportedVersion;
const pvMax: ProtocolVersion.ProtocolVersion = ProtocolVersion.MaxSupportedVersion;
const isPv: boolean = ProtocolVersion.is(pv);
const range = ProtocolVersion.makeRange(
  ProtocolVersion.ProtocolVersion(0n),
  ProtocolVersion.ProtocolVersion(10n),
);
const inRange: boolean = ProtocolVersion.withinRange(pv, range);

// --- NetworkId ---
// [evidence: abstractions/NetworkId-well-known-values]
const mainnet: NetworkId.WellKnownNetworkId = NetworkId.NetworkId.MainNet;
const testnet: NetworkId.WellKnownNetworkId = NetworkId.NetworkId.TestNet;
const devnet: NetworkId.WellKnownNetworkId = NetworkId.NetworkId.DevNet;
const custom: NetworkId.NetworkId = 'custom-network';

// --- SyncProgress ---
// [evidence: abstractions/SyncProgress-creation-and-check]
const sp: SyncProgress.SyncProgress = SyncProgress.createSyncProgress({
  appliedIndex: 100n,
  highestIndex: 200n,
  highestRelevantIndex: 150n,
  highestRelevantWalletIndex: 100n,
  isConnected: true,
});
const isComplete: boolean = sp.isStrictlyComplete();
const isCloseEnough: boolean = sp.isCompleteWithin(50n);
