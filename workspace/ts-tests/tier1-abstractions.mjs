#!/usr/bin/env node
// Tier 1 execution test: Abstractions
// Tests branded types, protocol versions, network IDs, sync progress.

import {
  WalletSeed,
  WalletState,
  SerializedTransaction,
  ProtocolVersion,
  NetworkId,
  SyncProgress,
} from '@midnight-ntwrk/wallet-sdk-abstractions';

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, detail: e.message });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// --- WalletSeed ---
test('abstractions/WalletSeed-from-bytes', () => {
  const seed = WalletSeed.WalletSeed(new Uint8Array(32));
  assert(seed instanceof Uint8Array, 'WalletSeed should be Uint8Array');
  assert(seed.length === 32, 'Length should be 32');
});

test('abstractions/WalletSeed-from-string', () => {
  const hex = '00'.repeat(32);
  const seed = WalletSeed.fromString(hex);
  assert(seed instanceof Uint8Array, 'Should be Uint8Array');
  assert(seed.length === 32, 'Should be 32 bytes');
});

test('abstractions/WalletSeed-is-predicate', () => {
  const seed = WalletSeed.WalletSeed(new Uint8Array(32));
  assert(WalletSeed.is(seed), 'Branded seed should pass is()');
});

// --- WalletState ---
test('abstractions/WalletState-from-string', () => {
  const state = WalletState.WalletState('test-state');
  assert(typeof state === 'string', 'WalletState should be string');
});

// --- SerializedTransaction ---
test('abstractions/SerializedTransaction-of', () => {
  const tx = SerializedTransaction.of(new Uint8Array(50));
  assert(tx instanceof Uint8Array, 'Should be Uint8Array');
  assert(tx.length === 50, 'Length should match');
});

// --- ProtocolVersion ---
test('abstractions/ProtocolVersion-construction', () => {
  const pv = ProtocolVersion.ProtocolVersion(5n);
  assert(typeof pv === 'bigint', 'Should be bigint');
  assert(pv === 5n, 'Value should be 5');
});

test('abstractions/ProtocolVersion-min-max', () => {
  assert(ProtocolVersion.MinSupportedVersion === 0n, 'Min should be 0');
  assert(ProtocolVersion.MaxSupportedVersion > 0n, 'Max should be positive');
});

test('abstractions/ProtocolVersion-range-within', () => {
  const start = ProtocolVersion.ProtocolVersion(0n);
  const end = ProtocolVersion.ProtocolVersion(10n);
  const range = ProtocolVersion.makeRange(start, end);
  const pv5 = ProtocolVersion.ProtocolVersion(5n);
  const pv15 = ProtocolVersion.ProtocolVersion(15n);
  assert(ProtocolVersion.withinRange(pv5, range), '5 should be within [0, 10]');
  assert(!ProtocolVersion.withinRange(pv15, range), '15 should not be within [0, 10]');
});

test('abstractions/ProtocolVersion-is-predicate', () => {
  const pv = ProtocolVersion.ProtocolVersion(1n);
  assert(ProtocolVersion.is(pv), 'Branded version should pass is()');
});

// --- NetworkId ---
test('abstractions/NetworkId-well-known', () => {
  assert(NetworkId.NetworkId.MainNet === 'mainnet', 'MainNet should be "mainnet"');
  assert(NetworkId.NetworkId.TestNet === 'testnet', 'TestNet should be "testnet"');
  assert(NetworkId.NetworkId.DevNet === 'devnet', 'DevNet should be "devnet"');
  assert(NetworkId.NetworkId.QaNet === 'qanet', 'QaNet should be "qanet"');
  assert(NetworkId.NetworkId.Undeployed === 'undeployed', 'Undeployed');
  assert(NetworkId.NetworkId.Preview === 'preview', 'Preview');
  assert(NetworkId.NetworkId.PreProd === 'preprod', 'PreProd');
});

// --- SyncProgress ---
test('abstractions/SyncProgress-create', () => {
  const sp = SyncProgress.createSyncProgress({
    appliedIndex: 100n,
    highestIndex: 200n,
    highestRelevantIndex: 150n,
    highestRelevantWalletIndex: 100n,
    isConnected: true,
  });
  assert(sp.appliedIndex === 100n, 'appliedIndex should be 100');
  assert(sp.isConnected === true, 'isConnected should be true');
});

test('abstractions/SyncProgress-strictly-complete', () => {
  const sp = SyncProgress.createSyncProgress({
    appliedIndex: 200n,
    highestIndex: 200n,
    highestRelevantIndex: 200n,
    highestRelevantWalletIndex: 200n,
    isConnected: true,
  });
  assert(sp.isStrictlyComplete(), 'Should be strictly complete when all indices match');
});

test('abstractions/SyncProgress-not-complete', () => {
  const sp = SyncProgress.createSyncProgress({
    appliedIndex: 100n,
    highestIndex: 200n,
    highestRelevantIndex: 200n,
    highestRelevantWalletIndex: 200n,
    isConnected: true,
  });
  assert(!sp.isStrictlyComplete(), 'Should not be complete when behind');
  assert(sp.isCompleteWithin(200n), 'Should be within range of 200');
  assert(!sp.isCompleteWithin(50n), 'Should not be within range of 50');
});

console.log(JSON.stringify({ results }));
process.exit(results.some(r => !r.pass) ? 1 : 0);
