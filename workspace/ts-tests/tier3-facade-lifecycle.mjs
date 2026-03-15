#!/usr/bin/env node
// Tier 3 execution test: WalletFacade lifecycle against devnet
// Requires: node, indexer, proof-server
//
// Tests the FULL wallet lifecycle:
// 1. Derive keys from HD wallet for all three wallet types
// 2. Create ledger secret keys (ZswapSecretKeys, DustSecretKey)
// 3. Initialize WalletFacade with all three sub-wallets
// 4. Start the wallet (begins syncing)
// 5. Wait for sync completion
// 6. Read balances from all three wallets
// 7. Clean shutdown

import * as ledger from '@midnight-ntwrk/ledger-v8';
// DustWallet internally uses ledger-v7 for WASM state — DustParameters must come from v7
import * as ledgerV7 from '@midnight-ntwrk/ledger-v7';
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { createKeystore, PublicKey, UnshieldedWallet } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { InMemoryTransactionHistoryStorage } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { ShieldedWallet } from '@midnight-ntwrk/wallet-sdk-shielded';
import { DustWallet } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { WalletFacade, FacadeState } from '@midnight-ntwrk/wallet-sdk-facade';
import { makeDefaultProvingService } from '@midnight-ntwrk/wallet-sdk-capabilities/proving';
import * as rx from 'rxjs';

const NODE_URL = process.env.MIDNIGHT_NODE_URL || 'ws://localhost:9944';
const INDEXER_URL = process.env.MIDNIGHT_INDEXER_URL || 'http://localhost:8088/api/v1/graphql';
const INDEXER_WS_URL = process.env.MIDNIGHT_INDEXER_WS_URL || 'ws://localhost:8088/api/v4/graphql/ws';
const PROOF_SERVER_URL = process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://localhost:6300';
const NETWORK_ID = NetworkId.NetworkId.Undeployed;

const results = [];
let facade = null;

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, detail: (e.message || String(e)).slice(0, 500) });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// --- Step 1: Derive keys ---
let shieldedSeed, unshieldedSeed, dustSeed;
let shieldedSecretKeys, dustSecretKey, unshieldedKeystore;

await test('facade/derive-role-keys', () => {
  const seed = generateRandomSeed();
  const { hdWallet } = HDWallet.fromSeed(seed);
  const account = hdWallet.selectAccount(0);

  shieldedSeed = account.selectRole(Roles.Zswap).deriveKeyAt(0).key;
  unshieldedSeed = account.selectRole(Roles.NightExternal).deriveKeyAt(0).key;
  dustSeed = account.selectRole(Roles.Dust).deriveKeyAt(0).key;

  assert(shieldedSeed.length > 0, 'Shielded seed derived');
  assert(unshieldedSeed.length > 0, 'Unshielded seed derived');
  assert(dustSeed.length > 0, 'Dust seed derived');

  hdWallet.clear();
});

// --- Step 2: Create ledger secret keys ---
await test('facade/create-secret-keys', () => {
  shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(shieldedSeed);
  assert(shieldedSecretKeys !== null, 'ZswapSecretKeys created');

  dustSecretKey = ledger.DustSecretKey.fromSeed(dustSeed);
  assert(dustSecretKey !== null, 'DustSecretKey created');

  unshieldedKeystore = createKeystore(unshieldedSeed, NETWORK_ID);
  assert(unshieldedKeystore !== null, 'Unshielded keystore created');
});

// --- Step 3: Build configuration ---
let configuration;

await test('facade/build-configuration', () => {
  const dustParams = ledgerV7.LedgerParameters.initialParameters().dust;
  assert(dustParams !== null, 'Dust parameters available');

  configuration = {
    indexerClientConnection: {
      indexerHttpUrl: INDEXER_URL,
      indexerWsUrl: INDEXER_WS_URL,
    },
    relayURL: new URL(NODE_URL),
    networkId: NETWORK_ID,
    costParameters: { feeBlocksMargin: 5 },
    txHistoryStorage: new InMemoryTransactionHistoryStorage(),
    provingServerUrl: new URL(PROOF_SERVER_URL),
  };
});

// --- Step 4: Initialize WalletFacade ---
await test('facade/init-wallet-facade', async () => {
  facade = await WalletFacade.init({
    configuration,
    shielded: (config) => ShieldedWallet(config).startWithSeed(shieldedSeed),
    unshielded: (config) =>
      UnshieldedWallet(config).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
    dust: (config) =>
      DustWallet(config).startWithSeed(dustSeed, ledgerV7.LedgerParameters.initialParameters().dust),
  });

  assert(facade !== null, 'WalletFacade initialized');
  assert(typeof facade.state === 'function', 'facade.state() exists');
  assert(facade.shielded !== undefined, 'Shielded sub-wallet accessible');
  assert(facade.unshielded !== undefined, 'Unshielded sub-wallet accessible');
  assert(facade.dust !== undefined, 'Dust sub-wallet accessible');
});

// --- Step 5: Start and sync ---
await test('facade/start-wallet', async () => {
  await facade.start(shieldedSecretKeys, dustSecretKey);
});

await test('facade/wait-for-sync', async () => {
  // Wait for sync with a timeout — devnet should sync quickly
  const syncedState = await Promise.race([
    facade.waitForSyncedState(),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Sync timed out after 120s')), 120000)
    ),
  ]);

  assert(syncedState !== null, 'Synced state received');
  assert(syncedState.isSynced, 'State reports synced');
});

// --- Step 6: Read balances ---
await test('facade/read-shielded-balances', async () => {
  const state = await rx.firstValueFrom(facade.state());
  const balances = state.shielded.balances;
  assert(typeof balances === 'object', 'Shielded balances is an object');
  // Fresh wallet on devnet has no shielded tokens — that's expected
});

await test('facade/read-unshielded-balances', async () => {
  const state = await rx.firstValueFrom(facade.state());
  const balances = state.unshielded.balances;
  assert(typeof balances === 'object', 'Unshielded balances is an object');
  // Fresh wallet on devnet has no Night tokens — that's expected
});

await test('facade/read-dust-balance', async () => {
  const state = await rx.firstValueFrom(facade.state());
  const balance = state.dust.balance(new Date());
  assert(typeof balance === 'bigint', `Dust balance should be bigint, got ${typeof balance}`);
  // Fresh wallet on devnet has 0 dust — that's expected
  assert(balance === 0n, `Fresh wallet should have 0 dust, got ${balance}`);
});

await test('facade/read-dust-address', async () => {
  const state = await rx.firstValueFrom(facade.state());
  const address = state.dust.address;
  assert(address !== null && address !== undefined, 'Dust address should exist');
});

await test('facade/read-shielded-address', async () => {
  const state = await rx.firstValueFrom(facade.state());
  const address = state.shielded.address;
  assert(address !== null && address !== undefined, 'Shielded address should exist');
});

await test('facade/read-unshielded-address', async () => {
  const state = await rx.firstValueFrom(facade.state());
  const address = state.unshielded.address;
  assert(address !== null && address !== undefined, 'Unshielded address should exist');
});

await test('facade/read-sync-progress', async () => {
  const state = await rx.firstValueFrom(facade.state());
  // SyncProgress objects exist — shapes differ between wallet types:
  // - Shielded/Dust: { appliedIndex, highestIndex, ..., isConnected }
  // - Unshielded: { appliedId, highestTransactionId, isConnected }
  const shieldedProgress = state.shielded.progress;
  const dustProgress = state.dust.progress;
  const unshieldedProgress = state.unshielded.progress;

  assert(shieldedProgress !== null, 'Shielded progress exists');
  assert(dustProgress !== null, 'Dust progress exists');
  assert(unshieldedProgress !== null, 'Unshielded progress exists');
  assert('isConnected' in shieldedProgress, 'Shielded has isConnected');
  assert('isConnected' in unshieldedProgress, 'Unshielded has isConnected');
});

// --- Step 7: Stop ---
await test('facade/stop-wallet', async () => {
  await facade.stop();
  facade = null;
});

// Cleanup on failure
if (facade) {
  try { await facade.stop(); } catch {}
}

console.log(JSON.stringify({ results }, null, 2));
process.exit(results.some(r => !r.pass) ? 1 : 0);
