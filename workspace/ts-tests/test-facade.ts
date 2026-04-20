// Type-check evidence: @midnight-ntwrk/wallet-sdk-facade
// Verifies the unified wallet facade API shape.

import {
  WalletFacade,
  FacadeState,
  BalancingRecipe,
  type FinalizedTransactionRecipe,
  type UnboundTransactionRecipe,
  type UnprovenTransactionRecipe,
  type TokenTransfer,
  type ShieldedTokenTransfer,
  type UnshieldedTokenTransfer,
  type CombinedTokenTransfer,
  type CombinedSwapInputs,
  type CombinedSwapOutputs,
  type DefaultConfiguration,
  // Published in facade@3.0.0:
  type TermsAndConditions,
  type FetchTermsAndConditionsConfiguration,
  // Added in upstream 7f824321 (PM-19980), pending npm release:
  // WalletEntrySchema,
  // type WalletEntry,
} from '@midnight-ntwrk/wallet-sdk-facade';
import type { Observable } from 'rxjs';

// --- BalancingRecipe ---
// [evidence: facade/BalancingRecipe-type-guards]
declare const recipe: BalancingRecipe;
const isRecipe: boolean = BalancingRecipe.isRecipe(recipe);

// --- FacadeState ---
// [evidence: facade/FacadeState-properties]
declare const facadeState: FacadeState;
const synced: boolean = facadeState.isSynced;

// --- WalletFacade ---
// [evidence: facade/WalletFacade-methods]
// Verify init is a static method
type FacadeInit = typeof WalletFacade.init;

// Verify instance methods exist
declare const facade: WalletFacade;
const stateObs: Observable<FacadeState> = facade.state();

// The facade exposes its sub-wallets as public readonly fields
const hasSub = facade.shielded;
const hasUnsub = facade.unshielded;
const hasDust = facade.dust;
const hasSubmission = facade.submissionService;
const hasPending = facade.pendingTransactionsService;
const hasProving = facade.provingService;

// --- Transfer types ---
// [evidence: facade/TokenTransfer-types]
// TokenKind and TokenKindsToBalance are module-private, not exported
// The public API uses ShieldedTokenTransfer and UnshieldedTokenTransfer
declare const shieldedTransfer: ShieldedTokenTransfer;
declare const unshieldedTransfer: UnshieldedTokenTransfer;
declare const combined: CombinedTokenTransfer;

// --- TermsAndConditions ---
// [evidence: facade/TermsAndConditions-type]
// Published in facade@3.0.0: fetches T&C from indexer's system parameters.
declare const tc: TermsAndConditions;
const _tcHash: string = tc.hash;
const _tcUrl: string = tc.url;

// --- FetchTermsAndConditionsConfiguration ---
// [evidence: facade/FetchTermsAndConditionsConfiguration-type]
declare const fetchTcConfig: FetchTermsAndConditionsConfiguration;
const _indexerUrl: string = fetchTcConfig.indexerClientConnection.indexerHttpUrl;

// --- Clock, systemClock, mergeWalletEntries (PR #249 / PM-22421) ---
// [evidence: facade/Clock-type — source-verified, npm-pending]
// Added in upstream c1ae3695: Clock interface for simulation time
// decoupling, systemClock (real-time implementation), and
// mergeWalletEntries helper for tx history consolidation.
// Once npm package is updated, uncomment these:
// import { type Clock, systemClock, mergeWalletEntries } from '@midnight-ntwrk/wallet-sdk-facade';
// declare const clock: Clock;
// const _now: Date = clock.now();
// const _systemClock: Clock = systemClock;
// const _merge: typeof mergeWalletEntries = mergeWalletEntries;

// --- WalletEntry (pending npm release) ---
// Added in upstream 7f824321 (PM-19980): full tx history entry combining
// common fields with optional shielded/unshielded sections.
// WalletEntrySchema and WalletEntry type will be enabled once abstractions
// > 2.0.0 is published (dependency on TransactionHistoryStorage).

// --- Dust section in WalletEntry (pending npm release) ---
// [evidence: facade/WalletEntry-dust-section — source-verified, npm-pending]
// Added in upstream 37638039 (feat: add txHistory to dust wallet #331):
// WalletEntrySchema gains optional `dust` field using DustSectionSchema.
// mergeWalletEntries handles dust section merging via mergeDustSections.
// Once facade 3.1.0+ is published, the WalletEntry test above should also
// verify that WalletEntry has an optional `dust` property.
