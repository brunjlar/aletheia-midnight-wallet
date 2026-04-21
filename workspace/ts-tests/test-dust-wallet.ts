// Type-check evidence: @midnight-ntwrk/wallet-sdk-dust-wallet
// Verifies the dust wallet API shape.
//
// NOTE: upstream commit eba8e08d adds CustomDustWallet, CustomizedDustWallet,
// and CustomizedDustWalletClass (dust wallet builder pattern, matching
// shielded/unshielded). These exports are not yet available in the published
// npm package (3.0.0). Type-check tests for them will be enabled once
// the patch release (3.0.1+) is published.

import {
  DustWallet,
  DustWalletState,
  type DustWalletAPI,
  type DustWalletClass,
  type DefaultDustConfiguration,
  type DustWalletCapabilities,
} from '@midnight-ntwrk/wallet-sdk-dust-wallet';
import type { Observable } from 'rxjs';
import type { DustAddress } from '@midnight-ntwrk/wallet-sdk-address-format';

// --- DustWalletState ---
// [evidence: dust/DustWalletState-properties]
declare const state: DustWalletState;
const address: DustAddress = state.address;
// balance() returns bigint (aliased as Balance)
const balance: bigint = state.balance(new Date());

// --- DustWalletAPI ---
// [evidence: dust/DustWalletAPI-methods]
declare const api: DustWalletAPI;
const stateObs: Observable<DustWalletState> = api.state;
const feePromise: Promise<bigint> = api.calculateFee([] as any);
const stopPromise: Promise<void> = api.stop();

// --- DustWalletServices ---
// [evidence: dust/DustWalletServices-type — source-verified, npm-pending]
// Added in upstream 37638039 (feat: add txHistory to dust wallet #331).
// Fixed in upstream 8383f7bc (fix: double exporting of transactionhistory.js #336):
//   DustSectionSchema, mergeDustSections, DustTransactionHistoryEntry moved from
//   v1 subpath to main package path. DustUtxoInfoSchema removed from v1 re-exports.
// DustWalletState now exposes a `services` property containing transactionHistory.
// Once npm package is updated (3.1.0+), uncomment these:
// import { type DustWalletServices, type DustTransactionHistoryEntry, DustSectionSchema, mergeDustSections } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
// import { TransactionHistory } from '@midnight-ntwrk/wallet-sdk-dust-wallet/v1';
// declare const services: DustWalletServices;
// const _txHistory: services.transactionHistory;
// const _dustSchema: typeof DustSectionSchema = DustSectionSchema;
// const _merge: typeof mergeDustSections = mergeDustSections;

// --- CustomDustWallet builder pattern (pending npm publish) ---
// [evidence: dust/CustomDustWallet-types — source-verified, npm-pending]
// Once npm package is updated, uncomment these:
// import { CustomDustWallet, type CustomizedDustWallet, type CustomizedDustWalletClass } from '@midnight-ntwrk/wallet-sdk-dust-wallet';
// type _CheckDustWalletIsCustomized = DustWallet extends CustomizedDustWallet ? true : never;
// type _CheckClassIsCustomized = DustWalletClass extends CustomizedDustWalletClass ? true : never;
// const _customDustWalletFactory: typeof CustomDustWallet = CustomDustWallet;
