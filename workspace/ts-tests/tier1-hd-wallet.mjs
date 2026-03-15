#!/usr/bin/env node
// Tier 1 execution test: HD wallet key derivation
// Tests that mnemonic generation, seed creation, and key derivation
// actually produce the correct structure at runtime.

import { HDWallet, Roles, generateMnemonicWords, joinMnemonicWords, validateMnemonic, generateRandomSeed } from '@midnight-ntwrk/wallet-sdk-hd';

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

// --- Mnemonic generation ---
test('hd/mnemonic-generates-24-words', () => {
  const words = generateMnemonicWords();
  assert(words.length === 24, `Expected 24 words, got ${words.length}`);
});

test('hd/mnemonic-validates-roundtrip', () => {
  const words = generateMnemonicWords();
  const mnemonic = joinMnemonicWords(words);
  assert(validateMnemonic(mnemonic), 'Generated mnemonic should validate');
});

test('hd/invalid-mnemonic-rejected', () => {
  assert(!validateMnemonic('not a valid mnemonic phrase'), 'Invalid mnemonic should be rejected');
});

// --- Random seed generation ---
test('hd/random-seed-length', () => {
  const seed = generateRandomSeed();
  assert(seed instanceof Uint8Array, 'Seed should be Uint8Array');
  // Default strength=256 → 32 bytes
  assert(seed.length === 32, `Expected 32 bytes, got ${seed.length}`);
});

// --- HD wallet creation ---
test('hd/wallet-from-seed', () => {
  const seed = generateRandomSeed();
  const result = HDWallet.fromSeed(seed);
  assert(result.type === 'seedOk', `Expected seedOk, got ${result.type}`);
});

// --- Role enumeration ---
test('hd/roles-values', () => {
  assert(Roles.NightExternal === 0, 'NightExternal should be 0');
  assert(Roles.NightInternal === 1, 'NightInternal should be 1');
  assert(Roles.Dust === 2, 'Dust should be 2');
  assert(Roles.Zswap === 3, 'Zswap should be 3');
  assert(Roles.Metadata === 4, 'Metadata should be 4');
});

// --- Key derivation ---
test('hd/derive-key-at-index-0', () => {
  const seed = generateRandomSeed();
  const { hdWallet } = HDWallet.fromSeed(seed);
  const account = hdWallet.selectAccount(0);
  const roleKey = account.selectRole(Roles.NightExternal);
  const result = roleKey.deriveKeyAt(0);
  assert(result.type === 'keyDerived', `Expected keyDerived, got ${result.type}`);
  assert(result.key instanceof Uint8Array, 'Key should be Uint8Array');
  assert(result.key.length > 0, 'Key should not be empty');
  hdWallet.clear();
});

test('hd/different-roles-different-keys', () => {
  const seed = generateRandomSeed();
  const { hdWallet } = HDWallet.fromSeed(seed);
  const account = hdWallet.selectAccount(0);
  const nightKey = account.selectRole(Roles.NightExternal).deriveKeyAt(0);
  const dustKey = account.selectRole(Roles.Dust).deriveKeyAt(0);
  assert(nightKey.type === 'keyDerived' && dustKey.type === 'keyDerived', 'Both should derive');
  const nightHex = Buffer.from(nightKey.key).toString('hex');
  const dustHex = Buffer.from(dustKey.key).toString('hex');
  assert(nightHex !== dustHex, 'Different roles should produce different keys');
  hdWallet.clear();
});

test('hd/different-accounts-different-keys', () => {
  const seed = generateRandomSeed();
  const { hdWallet } = HDWallet.fromSeed(seed);
  const key0 = hdWallet.selectAccount(0).selectRole(Roles.NightExternal).deriveKeyAt(0);
  const key1 = hdWallet.selectAccount(1).selectRole(Roles.NightExternal).deriveKeyAt(0);
  assert(key0.type === 'keyDerived' && key1.type === 'keyDerived', 'Both should derive');
  assert(
    Buffer.from(key0.key).toString('hex') !== Buffer.from(key1.key).toString('hex'),
    'Different accounts should produce different keys',
  );
  hdWallet.clear();
});

test('hd/composite-role-keys', () => {
  const seed = generateRandomSeed();
  const { hdWallet } = HDWallet.fromSeed(seed);
  const account = hdWallet.selectAccount(0);
  const composite = account.selectRoles([Roles.NightExternal, Roles.Dust, Roles.Zswap]);
  const result = composite.deriveKeysAt(0);
  assert(result.type === 'keysDerived', `Expected keysDerived, got ${result.type}`);
  assert(result.keys[Roles.NightExternal] instanceof Uint8Array, 'NightExternal key should exist');
  assert(result.keys[Roles.Dust] instanceof Uint8Array, 'Dust key should exist');
  assert(result.keys[Roles.Zswap] instanceof Uint8Array, 'Zswap key should exist');
  hdWallet.clear();
});

test('hd/deterministic-derivation', () => {
  // Same seed → same keys
  const seed = generateRandomSeed();
  const { hdWallet: w1 } = HDWallet.fromSeed(seed);
  const { hdWallet: w2 } = HDWallet.fromSeed(seed);
  const k1 = w1.selectAccount(0).selectRole(Roles.NightExternal).deriveKeyAt(0);
  const k2 = w2.selectAccount(0).selectRole(Roles.NightExternal).deriveKeyAt(0);
  assert(k1.type === 'keyDerived' && k2.type === 'keyDerived', 'Both should derive');
  assert(
    Buffer.from(k1.key).toString('hex') === Buffer.from(k2.key).toString('hex'),
    'Same seed should produce same key',
  );
  w1.clear();
  w2.clear();
});

console.log(JSON.stringify({ results }));
process.exit(results.some(r => !r.pass) ? 1 : 0);
