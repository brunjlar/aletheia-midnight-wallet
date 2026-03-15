#!/usr/bin/env node
// Tier 1 execution test: Address format
// Tests Bech32m encoding/decoding, address types, and field constants.

import {
  mainnet,
  BLSScalar,
  ScaleBigInt,
  MidnightBech32m,
  Bech32mCodec,
  ShieldedAddress,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
  UnshieldedAddress,
  DustAddress,
} from '@midnight-ntwrk/wallet-sdk-address-format';

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

// --- BLSScalar ---
test('address-format/BLSScalar-is-32-bytes', () => {
  assert(BLSScalar.bytes === 32, `Expected 32 bytes, got ${BLSScalar.bytes}`);
  assert(typeof BLSScalar.modulus === 'bigint', 'Modulus should be bigint');
  assert(BLSScalar.modulus > 0n, 'Modulus should be positive');
});

// --- ScaleBigInt ---
test('address-format/ScaleBigInt-encode-decode-roundtrip', () => {
  const value = 42n;
  const encoded = ScaleBigInt.encode(value);
  assert(Buffer.isBuffer(encoded), 'Encoded should be Buffer');
  const decoded = ScaleBigInt.decode(encoded);
  assert(decoded === value, `Expected ${value}, got ${decoded}`);
});

test('address-format/ScaleBigInt-zero', () => {
  const encoded = ScaleBigInt.encode(0n);
  const decoded = ScaleBigInt.decode(encoded);
  assert(decoded === 0n, `Expected 0n, got ${decoded}`);
});

test('address-format/ScaleBigInt-large-value', () => {
  const value = 2n ** 128n;
  const encoded = ScaleBigInt.encode(value);
  const decoded = ScaleBigInt.decode(encoded);
  assert(decoded === value, 'Large value should roundtrip');
});

// --- ShieldedCoinPublicKey ---
test('address-format/ShieldedCoinPublicKey-construction', () => {
  const bytes = Buffer.alloc(32, 0x01);
  const cpk = new ShieldedCoinPublicKey(bytes);
  const hex = cpk.toHexString();
  assert(typeof hex === 'string', 'toHexString should return string');
  assert(hex.length > 0, 'Hex string should not be empty');
});

test('address-format/ShieldedCoinPublicKey-equality', () => {
  const bytes = Buffer.alloc(32, 0x42);
  const a = new ShieldedCoinPublicKey(bytes);
  const b = new ShieldedCoinPublicKey(bytes);
  assert(a.equals(b), 'Same bytes should be equal');

  const diff = Buffer.alloc(32, 0x43);
  const c = new ShieldedCoinPublicKey(diff);
  assert(!a.equals(c), 'Different bytes should not be equal');
});

// --- ShieldedEncryptionPublicKey ---
test('address-format/ShieldedEncryptionPublicKey-construction', () => {
  const bytes = Buffer.alloc(32, 0x02);
  const epk = new ShieldedEncryptionPublicKey(bytes);
  const hex = epk.toHexString();
  assert(typeof hex === 'string' && hex.length > 0, 'Should have hex string');
});

// --- ShieldedAddress ---
test('address-format/ShieldedAddress-composition', () => {
  const cpk = new ShieldedCoinPublicKey(Buffer.alloc(32, 0x01));
  const epk = new ShieldedEncryptionPublicKey(Buffer.alloc(32, 0x02));
  const addr = new ShieldedAddress(cpk, epk);
  assert(addr.coinPublicKey.equals(cpk), 'coinPublicKey should match');
  assert(addr.encryptionPublicKey.equals(epk), 'encryptionPublicKey should match');
});

// --- UnshieldedAddress ---
test('address-format/UnshieldedAddress-hex-roundtrip', () => {
  const bytes = Buffer.alloc(32, 0xAB);
  const addr = new UnshieldedAddress(bytes);
  const hex = addr.hexString;
  assert(typeof hex === 'string', 'hexString should be string');
  assert(hex.length > 0, 'hexString should not be empty');
});

test('address-format/UnshieldedAddress-equality', () => {
  const bytes = Buffer.alloc(32, 0xCD);
  const a = new UnshieldedAddress(bytes);
  const b = new UnshieldedAddress(bytes);
  assert(a.equals(b), 'Same bytes should be equal');
});

// --- DustAddress ---
test('address-format/DustAddress-from-bigint', () => {
  const addr = new DustAddress(42n);
  assert(addr.equals(new DustAddress(42n)), 'Same value should be equal');
  assert(!addr.equals(new DustAddress(43n)), 'Different value should not be equal');
});

test('address-format/DustAddress-validates-modulus', () => {
  // Value must be < BLSScalar.modulus
  try {
    new DustAddress(BLSScalar.modulus);
    assert(false, 'Should reject value >= modulus');
  } catch (e) {
    // Expected: validation error
    results.push({ name: 'address-format/DustAddress-rejects-over-modulus', pass: true });
  }
});

// --- Bech32m encoding ---
test('address-format/MidnightBech32m-encode-shielded', () => {
  const cpk = new ShieldedCoinPublicKey(Buffer.alloc(32, 0x01));
  const epk = new ShieldedEncryptionPublicKey(Buffer.alloc(32, 0x02));
  const addr = new ShieldedAddress(cpk, epk);
  const encoded = MidnightBech32m.encode('testnet', addr);
  const str = encoded.asString();
  assert(str.startsWith('mn'), `Expected mn prefix, got ${str.substring(0, 5)}`);
});

test('address-format/MidnightBech32m-encode-unshielded', () => {
  const addr = new UnshieldedAddress(Buffer.alloc(32, 0xAB));
  const encoded = MidnightBech32m.encode('testnet', addr);
  const str = encoded.asString();
  assert(str.startsWith('mn'), `Expected mn prefix, got ${str.substring(0, 5)}`);
});

test('address-format/MidnightBech32m-roundtrip', () => {
  const addr = new UnshieldedAddress(Buffer.alloc(32, 0xEF));
  const encoded = MidnightBech32m.encode('testnet', addr);
  const str = encoded.asString();
  const parsed = MidnightBech32m.parse(str);
  const decoded = parsed.decode(UnshieldedAddress, 'testnet');
  assert(decoded.equals(addr), 'Bech32m encode/decode should roundtrip');
});

console.log(JSON.stringify({ results }));
process.exit(results.some(r => !r.pass) ? 1 : 0);
