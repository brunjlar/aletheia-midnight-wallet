# Wallet SDK — Repo Profile

## What This Repo Documents

The Midnight Wallet SDK: 13 TypeScript packages under the
`@midnight-ntwrk/wallet-sdk-*` namespace. The SDK manages all three
Midnight token types (shielded, unshielded, dust) through HD key
derivation, Bech32m address encoding, transaction balancing, chain
synchronization, and ZK proof generation.

## Upstream

- Repo: `midnightntwrk/midnight-wallet`
- Language: TypeScript (Yarn workspaces + Turborepo)
- License: Apache-2.0

## What Counts as Correctness

1. Every exported symbol must be documented
2. Every documented type must pass TypeScript type-checking (Tier 1)
3. Every foundation-layer API must have runtime execution evidence (Tier 1)
4. Infrastructure clients must be tested against devnet (Tier 3)
5. The full wallet lifecycle (create → sync → balance → submit) must be
   demonstrated against devnet (Tier 3)
6. No claims without evidence — if a test doesn't exist, the claim
   must be flagged as unverified

## Oracles

| Oracle | What It Proves | Tier |
|--------|---------------|------|
| TypeScript compiler | Types exist with documented shapes | 1 |
| Runtime execution | Functions behave as documented | 1 |
| Devnet (node + indexer + proof-server) | End-to-end wallet operations work | 3 |

## Coverage Criteria

- 100% of exported symbols mentioned in the reference document
- Every package section has at least one evidence entry
- Tier 3 evidence for the facade lifecycle

## Dependencies

- `@midnight-ntwrk/ledger-v8` (ledger types, not separately documented)
- `effect` (functional programming library, external)
- `rxjs` (observables, external)
