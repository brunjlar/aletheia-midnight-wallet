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
