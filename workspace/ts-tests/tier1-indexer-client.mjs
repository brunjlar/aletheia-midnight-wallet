#!/usr/bin/env node
// Tier 1 execution test: Indexer client
// Tests GraphQL query/subscription exports and effect layer types.

import {
  Connect,
  Disconnect,
  BlockHash,
  TransactionStatus,
  FetchTermsAndConditions,
  // Added in upstream 7f824321 (PM-19980), pending npm release:
  // TransactionHistoryDetail,
} from '@midnight-ntwrk/wallet-sdk-indexer-client';

import {
  QueryClient,
  SubscriptionClient,
  ConnectionHelper,
  QueryRunner,
} from '@midnight-ntwrk/wallet-sdk-indexer-client/effect';

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

// === GraphQL Queries ===

test('indexer-client/Connect-query-exists', () => {
  assert(Connect !== undefined, 'Connect mutation should exist');
  assert(typeof Connect === 'object', 'Connect should be a document node');
});

test('indexer-client/Disconnect-query-exists', () => {
  assert(Disconnect !== undefined, 'Disconnect mutation should exist');
});

test('indexer-client/BlockHash-query-exists', () => {
  assert(BlockHash !== undefined, 'BlockHash query should exist');
});

test('indexer-client/TransactionStatus-query-exists', () => {
  assert(TransactionStatus !== undefined, 'TransactionStatus query should exist');
});

test('indexer-client/FetchTermsAndConditions-query-exists', () => {
  assert(FetchTermsAndConditions !== undefined, 'FetchTermsAndConditions query should exist');
  assert(typeof FetchTermsAndConditions === 'object', 'FetchTermsAndConditions should be a query object');
});

// TransactionHistoryDetail query added in upstream 7f824321 (PM-19980),
// pending npm release. Test will be enabled once indexer-client > 1.2.0
// is published.

// === Effect layer ===

test('indexer-client/QueryClient-is-context-tag', () => {
  assert(QueryClient !== undefined, 'QueryClient should exist');
});

test('indexer-client/SubscriptionClient-is-context-tag', () => {
  assert(SubscriptionClient !== undefined, 'SubscriptionClient should exist');
});

test('indexer-client/ConnectionHelper-deriveWebSocketUrl', () => {
  assert(typeof ConnectionHelper.deriveWebSocketUrl === 'function',
    'deriveWebSocketUrl should exist');
});

test('indexer-client/QueryRunner-runPromise', () => {
  assert(typeof QueryRunner.runPromise === 'function',
    'QueryRunner.runPromise should exist');
});

console.log(JSON.stringify({ results }));
process.exit(results.some(r => !r.pass) ? 1 : 0);
