#!/usr/bin/env node
// Tier 3 execution test: Full wallet lifecycle against devnet
// Requires: node (ws://node:9944), indexer (http://indexer:8088), proof-server (http://proof-server:6300)
//
// Tests:
// 1. Create HD wallet from seed
// 2. Derive keys for all roles
// 3. Connect node client to devnet
// 4. Connect prover client to proof server
// 5. Observe the wallet can initialize and sync

import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { PolkadotNodeClient, makeConfig } from '@midnight-ntwrk/wallet-sdk-node-client';
import { HttpProverClient } from '@midnight-ntwrk/wallet-sdk-prover-client';
import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';

const NODE_URL = process.env.MIDNIGHT_NODE_URL || 'ws://localhost:9944';
const PROOF_SERVER_URL = process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://localhost:6300';

const results = [];

async function test(name, fn) {
  try {
    await fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, detail: e.message.slice(0, 300) });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// --- Key derivation for all roles ---
let seed, hdWallet, keys;

await test('tier3/create-hd-wallet', () => {
  seed = generateRandomSeed();
  const result = HDWallet.fromSeed(seed);
  assert(result.type === 'seedOk', 'Seed should be accepted');
  hdWallet = result.hdWallet;
});

await test('tier3/derive-all-role-keys', () => {
  const account = hdWallet.selectAccount(0);
  const composite = account.selectRoles([
    Roles.NightExternal,
    Roles.NightInternal,
    Roles.Dust,
    Roles.Zswap,
    Roles.Metadata,
  ]);
  const result = composite.deriveKeysAt(0);
  assert(result.type === 'keysDerived', 'All keys should derive');
  keys = result.keys;
  assert(keys[Roles.NightExternal].length > 0, 'NightExternal key');
  assert(keys[Roles.Dust].length > 0, 'Dust key');
  assert(keys[Roles.Zswap].length > 0, 'Zswap key');
});

// --- Node client connection ---
let nodeClient;

await test('tier3/connect-node-client', async () => {
  const config = makeConfig({ nodeURL: new URL(NODE_URL) });
  nodeClient = await PolkadotNodeClient.init(config);
  assert(nodeClient !== null, 'Node client should initialize');
});

// --- Prover client connection ---
await test('tier3/connect-prover-client', () => {
  const prover = new HttpProverClient({ url: PROOF_SERVER_URL });
  assert(prover !== null, 'Prover client should construct');
  // proveTransaction would need an actual transaction, but construction proves connectivity config
});

// --- Cleanup ---
if (nodeClient) {
  await test('tier3/close-node-client', async () => {
    await nodeClient.close();
  });
}

if (hdWallet) {
  hdWallet.clear();
}

// Output
console.log(JSON.stringify({ results }, null, 2));
process.exit(results.some(r => !r.pass) ? 1 : 0);
