// Type-check evidence: @midnight-ntwrk/wallet-sdk-dust-wallet
// Verifies the dust wallet API shape.

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
