#!/usr/bin/env node
// Tier 1 execution test: Utilities
// Tests SafeBigInt, DateOps, ArrayOps, BlobOps, networking errors.

import {
  SafeBigInt,
  DateOps,
  ArrayOps,
  BlobOps,
} from '@midnight-ntwrk/wallet-sdk-utilities';

import {
  InvalidProtocolSchemeError,
  FailedToDeriveWebSocketUrlError,
  ClientError,
  ServerError,
} from '@midnight-ntwrk/wallet-sdk-utilities/networking';

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

// === SafeBigInt ===

test('utilities/SafeBigInt-namespace-exists', () => {
  assert(SafeBigInt !== undefined, 'SafeBigInt should exist');
});

// === DateOps ===

test('utilities/DateOps-namespace-exists', () => {
  assert(DateOps !== undefined, 'DateOps should exist');
});

// === ArrayOps ===

test('utilities/ArrayOps-namespace-exists', () => {
  assert(ArrayOps !== undefined, 'ArrayOps should exist');
});

// === BlobOps ===

test('utilities/BlobOps-namespace-exists', () => {
  assert(BlobOps !== undefined, 'BlobOps should exist');
});

// === Networking errors ===

test('utilities/InvalidProtocolSchemeError-construction', () => {
  const err = new InvalidProtocolSchemeError({ message: 'bad', invalidScheme: 'ftp' });
  assert(err instanceof Error, 'Should be Error');
  assert(err.invalidScheme === 'ftp', 'Should have invalidScheme');
  assert(err._tag === 'InvalidProtocolSchemeError', `Tag: ${err._tag}`);
});

test('utilities/FailedToDeriveWebSocketUrlError-construction', () => {
  const err = new FailedToDeriveWebSocketUrlError({ message: 'cannot derive' });
  assert(err instanceof Error, 'Should be Error');
  assert(err._tag === 'FailedToDeriveWebSocketUrlError', `Tag: ${err._tag}`);
});

test('utilities/ClientError-construction', () => {
  const err = new ClientError({ message: 'bad request' });
  assert(err instanceof Error, 'Should be Error');
  assert(err._tag === 'ClientError', `Tag: ${err._tag}`);
});

test('utilities/ServerError-construction', () => {
  const err = new ServerError({ message: 'internal error' });
  assert(err instanceof Error, 'Should be Error');
  assert(err._tag === 'ServerError', `Tag: ${err._tag}`);
});

console.log(JSON.stringify({ results }));
process.exit(results.some(r => !r.pass) ? 1 : 0);
