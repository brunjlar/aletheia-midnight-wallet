// Type-check evidence: @midnight-ntwrk/wallet-sdk-runtime
// Verifies the wallet builder and runtime API shape.

import {
  WalletBuilder,
  Runtime,
} from '@midnight-ntwrk/wallet-sdk-runtime';

import {
  type Variant,
  type VariantBuilder,
  type WalletLike,
  WalletRuntimeError,
  type StateChange,
  type VersionChangeType,
} from '@midnight-ntwrk/wallet-sdk-runtime/abstractions';

// --- WalletRuntimeError ---
// [evidence: runtime/WalletRuntimeError-is-error]
// WalletRuntimeError is a tagged error with { message, cause? }
const err = new WalletRuntimeError({ message: 'test' });
const isError: boolean = err instanceof Error;

// --- WalletBuilder ---
// [evidence: runtime/WalletBuilder-exists]
type HasInit = typeof WalletBuilder;

// --- Runtime ---
// [evidence: runtime/Runtime-namespace]
type RuntimeNS = typeof Runtime;
