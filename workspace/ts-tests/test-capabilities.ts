// Type-check evidence: @midnight-ntwrk/wallet-sdk-capabilities
// Verifies balancer, submission, proving, and pending transactions APIs.

// --- Balancer ---
// [evidence: capabilities/balancer-types]
import {
  InsufficientFundsError,
  type BalanceRecipe,
  type CoinSelection,
  type TransactionCostModel,
  CounterOffer,
  type TokenType,
  type TokenValue,
  type CoinRecipe,
  type Imbalance,
  type Imbalances,
  getBalanceRecipe,
  createCounterOffer,
  chooseCoin,
} from '@midnight-ntwrk/wallet-sdk-capabilities/balancer';

// InsufficientFundsError takes a plain string message
const err = new InsufficientFundsError('not enough');
const isError: boolean = err instanceof Error;

// --- Submission ---
// [evidence: capabilities/submission-lifecycle]
import {
  SubmissionEvent,
  SubmissionError,
  type SubmissionService,
  type SubmissionServiceEffect,
  type DefaultSubmissionConfiguration,
  makeDefaultSubmissionService,
  makeDefaultSubmissionServiceEffect,
  makeSimulatorSubmissionService,
} from '@midnight-ntwrk/wallet-sdk-capabilities/submission';

// SubmissionError is a tagged error with { message, cause? }
const subError = new SubmissionError({ message: 'failed' });

// --- Proving ---
// [evidence: capabilities/proving-service-variants]
import {
  ProvingError,
  type ProvingService,
  type ProvingServiceEffect,
  type UnboundTransaction,
  type ServerProvingConfiguration,
  type WasmProvingConfiguration,
  type DefaultProvingConfiguration,
  makeDefaultProvingService,
  makeServerProvingService,
  makeWasmProvingService,
  makeSimulatorProvingService,
} from '@midnight-ntwrk/wallet-sdk-capabilities/proving';

// ProvingError tagged as 'Wallet.Proving', requires cause: Error
const provErr = new ProvingError({ message: 'proof failed', cause: new Error('inner') });
const isProvError: boolean = provErr instanceof Error;

// --- Pending Transactions ---
// [evidence: capabilities/pendingTransactions-service]
import {
  type PendingTransactionsService,
  PendingTransactionsServiceImpl,
  PendingTransactions,
} from '@midnight-ntwrk/wallet-sdk-capabilities/pendingTransactions';

// --- Simulator (unified in capabilities, PM-22421 / PR #249) ---
// [evidence: capabilities/simulator-unified — source-verified, npm-pending]
// Added in upstream c1ae3695: unified Simulator consolidates per-wallet
// simulator implementations into a single class in capabilities.
// Exports: Simulator (class), SimulatorConfig (type), immediateBlockProducer (const)
// Also re-exported via /simulation sub-path.
// Once npm package is updated, uncomment these:
// import {
//   Simulator,
//   immediateBlockProducer,
//   type SimulatorConfig,
// } from '@midnight-ntwrk/wallet-sdk-capabilities';
// import {
//   Simulator as SimulatorFromSubpath,
//   immediateBlockProducer as immediateBlockProducerFromSubpath,
//   type SimulatorConfig as SimulatorConfigFromSubpath,
// } from '@midnight-ntwrk/wallet-sdk-capabilities/simulation';
// type _SimulatorIsClass = InstanceType<typeof Simulator>;
// const _blockProducer: typeof immediateBlockProducer = immediateBlockProducer;
// type _SubpathMatch = typeof SimulatorFromSubpath extends typeof Simulator ? true : never;
