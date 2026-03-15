// Type-check evidence: @midnight-ntwrk/wallet-sdk-node-client
// Verifies the Polkadot RPC client API shape.

import {
  PolkadotNodeClient,
  type Config,
  makeConfig,
  DEFAULT_CONFIG,
} from '@midnight-ntwrk/wallet-sdk-node-client';

// --- Config ---
// [evidence: node-client/Config-requires-nodeURL]
// makeConfig requires `nodeURL: URL`, other fields have defaults
const customConfig: Config = makeConfig({ nodeURL: new URL('ws://localhost:9944') });

// DEFAULT_CONFIG has reconnectionTimeout and reconnectionDelay but NOT nodeURL
// (nodeURL is always required when creating a config)

// --- PolkadotNodeClient ---
// [evidence: node-client/PolkadotNodeClient-lifecycle]
// PolkadotNodeClient.init returns a Promise
const initPromise: Promise<PolkadotNodeClient> = PolkadotNodeClient.init(customConfig);

// The client has sendMidnightTransaction and close methods
type HasSend = typeof PolkadotNodeClient.prototype.sendMidnightTransaction;
type HasClose = typeof PolkadotNodeClient.prototype.close;
