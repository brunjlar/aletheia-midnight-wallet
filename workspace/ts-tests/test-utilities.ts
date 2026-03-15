// Type-check evidence: @midnight-ntwrk/wallet-sdk-utilities
// Verifies utility namespace exports.

import {
  ArrayOps,
  BlobOps,
  DateOps,
  EitherOps,
  Fluent,
  HList,
  LedgerOps,
  ObservableOps,
  Poly,
  RecordOps,
  SafeBigInt,
} from '@midnight-ntwrk/wallet-sdk-utilities';

// --- Namespace existence ---
// [evidence: utilities/namespace-exports]
type HasArrayOps = typeof ArrayOps;
type HasBlobOps = typeof BlobOps;
type HasDateOps = typeof DateOps;
type HasSafeBigInt = typeof SafeBigInt;

// --- Networking ---
// [evidence: utilities/networking-error-types]
import {
  HttpURL,
  WsURL,
  InvalidProtocolSchemeError,
  FailedToDeriveWebSocketUrlError,
  ClientError,
  ServerError,
} from '@midnight-ntwrk/wallet-sdk-utilities/networking';

// All errors are tagged errors with object constructors
const httpUrlErr = new InvalidProtocolSchemeError({ message: 'bad scheme', invalidScheme: 'ftp' });
const wsUrlErr = new FailedToDeriveWebSocketUrlError({ message: 'cannot derive ws url' });
const clientErr = new ClientError({ message: 'bad request' });
const serverErr = new ServerError({ message: 'internal error' });

// --- Types ---
// [evidence: utilities/type-utilities]
import type {
  CanAssign,
  Expect,
  ItemType,
  Equal,
} from '@midnight-ntwrk/wallet-sdk-utilities/types';

// Compile-time type equality check
type _CheckEqual = Expect<Equal<string, string>>;
