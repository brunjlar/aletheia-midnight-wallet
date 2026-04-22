// Type-check evidence: @midnight-ntwrk/wallet-sdk-address-format
// Verifies Bech32m address encoding and all address types.

import {
  mainnet,
  type FormatContext,
  type Field,
  BLSScalar,
  ScaleBigInt,
  MidnightBech32m,
  Bech32mCodec,
  ShieldedAddress,
  ShieldedEncryptionSecretKey,
  ShieldedCoinPublicKey,
  ShieldedEncryptionPublicKey,
  UnshieldedAddress,
  DustAddress,
} from '@midnight-ntwrk/wallet-sdk-address-format';

// NetworkId is no longer exported as a type (removed in #344).
// Use FormatContext['networkId'] to access the type, or inline
// as `string | typeof mainnet`.
type NetworkId = FormatContext['networkId'];

// --- Field constants ---
// [evidence: address-format/BLSScalar-field-definition]
const field: Field = BLSScalar;
const fieldBytes: number = field.bytes; // 32
const fieldModulus: bigint = field.modulus;

// --- ScaleBigInt codec ---
// [evidence: address-format/ScaleBigInt-encode-decode]
const encoded: Buffer = ScaleBigInt.encode(42n);
const decoded: bigint = ScaleBigInt.decode(encoded);

// --- Network IDs ---
// [evidence: address-format/NetworkId-mainnet-symbol]
const netId: NetworkId = mainnet;
const strNetId: NetworkId = 'testnet';

// --- Address types use Buffer, not Uint8Array ---

// --- ShieldedCoinPublicKey ---
// [evidence: address-format/ShieldedCoinPublicKey-from-buffer]
const cpkBytes = Buffer.alloc(32);
const cpk = new ShieldedCoinPublicKey(cpkBytes);
const cpkHex: string = cpk.toHexString();
const cpkEqual: boolean = cpk.equals(cpk);

// --- ShieldedEncryptionPublicKey ---
// [evidence: address-format/ShieldedEncryptionPublicKey-from-buffer]
const epkBytes = Buffer.alloc(32);
const epk = new ShieldedEncryptionPublicKey(epkBytes);
const epkHex: string = epk.toHexString();

// --- ShieldedAddress ---
// [evidence: address-format/ShieldedAddress-composition]
const shielded = new ShieldedAddress(cpk, epk);
const addressCpk: ShieldedCoinPublicKey = shielded.coinPublicKey;
const addressEpk: ShieldedEncryptionPublicKey = shielded.encryptionPublicKey;

// --- UnshieldedAddress ---
// [evidence: address-format/UnshieldedAddress-buffer-roundtrip]
const uaBytes = Buffer.alloc(32);
const ua = new UnshieldedAddress(uaBytes);
const uaHex: string = ua.hexString;
const uaEqual: boolean = ua.equals(ua);

// --- DustAddress ---
// [evidence: address-format/DustAddress-bigint-validated]
// DustAddress validates that data < BLSScalar.modulus
const da = new DustAddress(42n);
const daEqual: boolean = da.equals(da);
