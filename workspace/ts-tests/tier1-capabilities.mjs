#!/usr/bin/env node
// Tier 1 execution test: Capabilities
// Tests balancer, proving service factories, submission service types.

import {
  InsufficientFundsError,
  CounterOffer,
  getBalanceRecipe,
  chooseCoin,
  Imbalances,
} from '@midnight-ntwrk/wallet-sdk-capabilities/balancer';

import {
  SubmissionError,
  SubmissionEvent,
} from '@midnight-ntwrk/wallet-sdk-capabilities/submission';

import {
  ProvingError,
} from '@midnight-ntwrk/wallet-sdk-capabilities/proving';

import {
  PendingTransactions,
} from '@midnight-ntwrk/wallet-sdk-capabilities/pendingTransactions';

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

// === Balancer ===

test('capabilities/Imbalances-empty', () => {
  const empty = Imbalances.empty();
  assert(empty instanceof Map, 'Imbalances should be a Map');
  assert(empty.size === 0, 'Empty imbalances should have size 0');
});

test('capabilities/Imbalances-fromEntry', () => {
  const imb = Imbalances.fromEntry('NIGHT', 100n);
  assert(imb.size === 1, 'Should have 1 entry');
  assert(Imbalances.getValue(imb, 'NIGHT') === 100n, 'Value should be 100');
});

test('capabilities/Imbalances-merge', () => {
  const a = Imbalances.fromEntry('NIGHT', 100n);
  const b = Imbalances.fromEntry('NIGHT', 50n);
  const merged = Imbalances.merge(a, b);
  assert(Imbalances.getValue(merged, 'NIGHT') === 150n, 'Merged should be 150');
});

test('capabilities/Imbalances-fromEntries', () => {
  const imb = Imbalances.fromEntries([['NIGHT', 100n], ['DUST', 50n]]);
  assert(imb.size === 2, 'Should have 2 entries');
  assert(Imbalances.getValue(imb, 'NIGHT') === 100n, 'NIGHT should be 100');
  assert(Imbalances.getValue(imb, 'DUST') === 50n, 'DUST should be 50');
});

test('capabilities/Imbalances-typeSet', () => {
  const imb = Imbalances.fromEntries([['NIGHT', 100n], ['DUST', 50n]]);
  const types = Imbalances.typeSet(imb);
  assert(types.has('NIGHT'), 'Should have NIGHT');
  assert(types.has('DUST'), 'Should have DUST');
  assert(types.size === 2, 'Should have 2 types');
});

test('capabilities/InsufficientFundsError-construction', () => {
  const err = new InsufficientFundsError('NIGHT');
  assert(err instanceof Error, 'Should be an Error');
  assert(err.tokenType === 'NIGHT', `tokenType should be NIGHT, got ${err.tokenType}`);
});

test('capabilities/chooseCoin-selects-smallest', () => {
  const coins = [
    { type: 'NIGHT', value: 100n },
    { type: 'NIGHT', value: 10n },
    { type: 'NIGHT', value: 50n },
  ];
  const selected = chooseCoin(coins, 'NIGHT');
  assert(selected !== undefined, 'Should select a coin');
  assert(selected.value === 10n, `Should select smallest (10), got ${selected.value}`);
});

test('capabilities/chooseCoin-returns-undefined-for-wrong-type', () => {
  const coins = [{ type: 'NIGHT', value: 100n }];
  const selected = chooseCoin(coins, 'DUST');
  assert(selected === undefined, 'Should return undefined for missing type');
});

test('capabilities/getBalanceRecipe-basic', () => {
  const coins = [
    { type: 'NIGHT', value: 100n },
    { type: 'NIGHT', value: 200n },
  ];
  const recipe = getBalanceRecipe({
    coins,
    initialImbalances: Imbalances.fromEntry('NIGHT', -50n),
    transactionCostModel: { inputFeeOverhead: 0n, outputFeeOverhead: 0n },
    feeTokenType: 'DUST',
    createOutput: (coin) => ({ ...coin }),
    isCoinEqual: (a, b) => a === b,
  });
  assert(Array.isArray(recipe.inputs), 'Recipe should have inputs');
  assert(Array.isArray(recipe.outputs), 'Recipe should have outputs');
});

// === Submission ===

test('capabilities/SubmissionError-construction', () => {
  const err = new SubmissionError({ message: 'failed' });
  assert(err instanceof Error, 'Should be an Error');
  assert(err.message === 'failed', 'Message should match');
});

test('capabilities/SubmissionError-with-cause', () => {
  const cause = new Error('inner');
  const err = new SubmissionError({ message: 'outer', cause });
  assert(err.cause === cause, 'Cause should be preserved');
});

// === Proving ===

test('capabilities/ProvingError-construction', () => {
  const cause = new Error('proof failure');
  const err = new ProvingError({ message: 'prove failed', cause });
  assert(err instanceof Error, 'Should be an Error');
  assert(err.message === 'prove failed', 'Message should match');
  assert(err.cause === cause, 'Cause should be preserved');
});

test('capabilities/ProvingError-tag', () => {
  const err = new ProvingError({ message: 'test', cause: new Error('x') });
  assert(err._tag === 'Wallet.Proving', `Tag should be Wallet.Proving, got ${err._tag}`);
});

// === PendingTransactions ===

test('capabilities/PendingTransactions-namespace-exists', () => {
  assert(PendingTransactions !== undefined, 'PendingTransactions namespace should exist');
});

console.log(JSON.stringify({ results }));
process.exit(results.some(r => !r.pass) ? 1 : 0);
