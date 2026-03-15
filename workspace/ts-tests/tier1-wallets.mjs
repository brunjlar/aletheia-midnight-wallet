#!/usr/bin/env node
// Tier 1 execution test: Wallet factories and state classes
// Tests that wallet factory functions exist and return wallet classes.

import { DustWallet, DustWalletState } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import { ShieldedWallet, ShieldedWalletState } from '@midnight-ntwrk/wallet-sdk-shielded';
import { UnshieldedWallet, UnshieldedWalletState } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { createKeystore, PublicKey } from '@midnight-ntwrk/wallet-sdk-unshielded-wallet';
import { WalletBuilder, Runtime } from '@midnight-ntwrk/wallet-sdk-runtime';
import { WalletRuntimeError } from '@midnight-ntwrk/wallet-sdk-runtime/abstractions';
import { WalletFacade, FacadeState, BalancingRecipe } from '@midnight-ntwrk/wallet-sdk-facade';
import { ProtocolVersion } from '@midnight-ntwrk/wallet-sdk-abstractions';
import { HDWallet, Roles, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';
import { NetworkId } from '@midnight-ntwrk/wallet-sdk-abstractions';

const results = [];

function test(name, fn) {
  try {
    fn();
    results.push({ name, pass: true });
  } catch (e) {
    results.push({ name, pass: false, detail: e.message.slice(0, 300) });
  }
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg);
}

// === Factory functions ===

test('wallets/DustWallet-is-factory-function', () => {
  assert(typeof DustWallet === 'function', 'DustWallet should be a function');
});

test('wallets/ShieldedWallet-is-factory-function', () => {
  assert(typeof ShieldedWallet === 'function', 'ShieldedWallet should be a function');
});

test('wallets/UnshieldedWallet-is-factory-function', () => {
  assert(typeof UnshieldedWallet === 'function', 'UnshieldedWallet should be a function');
});

// === State classes ===

test('wallets/DustWalletState-has-mapState', () => {
  assert(typeof DustWalletState.mapState === 'function', 'DustWalletState.mapState should exist');
});

test('wallets/ShieldedWalletState-has-mapState', () => {
  assert(typeof ShieldedWalletState.mapState === 'function', 'ShieldedWalletState.mapState should exist');
});

test('wallets/UnshieldedWalletState-has-mapState', () => {
  assert(typeof UnshieldedWalletState.mapState === 'function', 'UnshieldedWalletState.mapState should exist');
});

// === Keystore ===

test('wallets/createKeystore-from-random-key', () => {
  const seed = generateRandomSeed();
  const { hdWallet } = HDWallet.fromSeed(seed);
  const nightKey = hdWallet.selectAccount(0).selectRole(Roles.NightExternal).deriveKeyAt(0);
  assert(nightKey.type === 'keyDerived', 'Key should derive');

  const keystore = createKeystore(nightKey.key, NetworkId.NetworkId.DevNet);
  assert(keystore !== null, 'Keystore should be created');

  const pubKey = keystore.getPublicKey();
  assert(pubKey !== null && pubKey !== undefined, 'Public key should exist');

  const address = keystore.getAddress();
  assert(typeof address === 'string', 'Address should be string');

  hdWallet.clear();
});

test('wallets/PublicKey-fromKeyStore', () => {
  const seed = generateRandomSeed();
  const { hdWallet } = HDWallet.fromSeed(seed);
  const nightKey = hdWallet.selectAccount(0).selectRole(Roles.NightExternal).deriveKeyAt(0);
  const keystore = createKeystore(nightKey.key, NetworkId.NetworkId.DevNet);
  const pk = PublicKey.fromKeyStore(keystore);

  assert(pk.publicKey !== undefined, 'publicKey should exist');
  assert(typeof pk.addressHex === 'string', 'addressHex should be string');
  assert(typeof pk.address === 'string', 'address should be string');

  hdWallet.clear();
});

// === WalletBuilder ===

test('wallets/WalletBuilder-init', () => {
  const builder = WalletBuilder.init();
  assert(builder !== null, 'WalletBuilder.init() should return a builder');
});

// === Runtime ===

test('wallets/Runtime-namespace-exists', () => {
  assert(Runtime !== undefined, 'Runtime namespace should exist');
  assert(typeof Runtime.initHead === 'function', 'Runtime.initHead should be a function');
  assert(typeof Runtime.init === 'function', 'Runtime.init should be a function');
});

// === WalletRuntimeError ===

test('wallets/WalletRuntimeError-construction', () => {
  const err = new WalletRuntimeError({ message: 'runtime error' });
  assert(err instanceof Error, 'Should be an Error');
  assert(err._tag === 'WalletRuntimeError', `Tag should be WalletRuntimeError, got ${err._tag}`);
});

// === FacadeState ===

test('wallets/FacadeState-exists', () => {
  assert(typeof FacadeState === 'function', 'FacadeState should be a constructor');
});

// === BalancingRecipe ===

test('wallets/BalancingRecipe-isRecipe', () => {
  assert(typeof BalancingRecipe.isRecipe === 'function', 'isRecipe should be a function');
  assert(!BalancingRecipe.isRecipe({}), 'Empty object should not be a recipe');
});

test('wallets/BalancingRecipe-getTransactions', () => {
  assert(typeof BalancingRecipe.getTransactions === 'function', 'getTransactions should be a function');
});

// === WalletFacade ===

test('wallets/WalletFacade-init-is-static', () => {
  assert(typeof WalletFacade.init === 'function', 'WalletFacade.init should be a static method');
});

console.log(JSON.stringify({ results }));
process.exit(results.some(r => !r.pass) ? 1 : 0);
