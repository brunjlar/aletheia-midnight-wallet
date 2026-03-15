// Type-check evidence: @midnight-ntwrk/wallet-sdk-hd
// Verifies HD wallet key derivation API shape.

import {
  HDWallet,
  Roles,
  type Role,
  type AccountKey,
  type RoleKey,
  type CompositeRoleKey,
  generateMnemonicWords,
  joinMnemonicWords,
  mnemonicToWords,
  validateMnemonic,
  generateRandomSeed,
} from '@midnight-ntwrk/wallet-sdk-hd';

// --- Roles ---
// [evidence: hd/Roles-enumeration]
const nightExternal: 0 = Roles.NightExternal;
const nightInternal: 1 = Roles.NightInternal;
const dust: 2 = Roles.Dust;
const zswap: 3 = Roles.Zswap;
const metadata: 4 = Roles.Metadata;
const role: Role = Roles.NightExternal;

// --- MnemonicUtils ---
// [evidence: hd/MnemonicUtils-generate-validate]
const words: string[] = generateMnemonicWords();
const mnemonic: string = joinMnemonicWords(words);
const split: string[] = mnemonicToWords(mnemonic);
const valid: boolean = validateMnemonic(mnemonic);
const randomSeed: Uint8Array = generateRandomSeed();

// --- HDWallet ---
// [evidence: hd/HDWallet-derivation-path]
// m/44'/2400'/{account}'/{role}/{index}
const result = HDWallet.fromSeed(randomSeed);
if (result.type === 'seedOk') {
  const wallet: HDWallet = result.hdWallet;
  const account: AccountKey = wallet.selectAccount(0);
  const roleKey: RoleKey = account.selectRole(Roles.NightExternal);
  const keyResult = roleKey.deriveKeyAt(0);
  if (keyResult.type === 'keyDerived') {
    const key: Uint8Array = keyResult.key;
  }

  // Composite role keys
  const composite: CompositeRoleKey<readonly [0, 1, 2]> =
    account.selectRoles([Roles.NightExternal, Roles.NightInternal, Roles.Dust] as const);
  const compositeResult = composite.deriveKeysAt(0);
  if (compositeResult.type === 'keysDerived') {
    const nightKey: Uint8Array = compositeResult.keys[Roles.NightExternal];
    const dustKey: Uint8Array = compositeResult.keys[Roles.Dust];
  }

  wallet.clear();
}
