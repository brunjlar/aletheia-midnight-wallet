// Type-check evidence: @midnight-ntwrk/wallet-sdk-prover-client
// Verifies the ZK proof client API shape.

import { HttpProverClient } from '@midnight-ntwrk/wallet-sdk-prover-client';

// --- HttpProverClient ---
// [evidence: prover-client/HttpProverClient-construction]
// HttpProverClient wraps an HTTP connection to the proof server
const client = new HttpProverClient({ url: 'http://localhost:6300' });

// proveTransaction is the main method
type HasProve = typeof HttpProverClient.prototype.proveTransaction;
