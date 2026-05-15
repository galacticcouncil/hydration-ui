// Phase 5b — boot the RAILGUN engine with a real ArtifactGetter so the prover
// can actually generate proofs for Shield / Send / Unshield (and the swap
// flow's inner unshield).
//
// The artifact getter (`createBrowserArtifactGetter()` from `./artifacts.ts`)
// resolves to the wasm+zkey blobs bundled under
// `src/sections/privacy/assets/circuits/` — decompressed from the
// `railgun-circuit-test-artifacts` npm package at build time so the same vkeys
// are used here as on the on-chain Verifier on the lark proxy
// (0x195C5EFAa658Ac3C40DF6138F1C3B948Ed2C83D7).
//
// QuickSync still stubs to empty arrays for now: 5d wires the Subsquid
// indexer. Until then the engine falls back to slow `eth_getLogs` against the
// lark RPC, which is fine for a fresh chain at ~250k blocks.

import {
  GetLatestValidatedRailgunTxid,
  MerklerootValidator,
  PollingJsonRpcProvider,
  QuickSyncEvents,
  QuickSyncRailgunTransactionsV2,
  RailgunEngine,
  TXIDVersion,
} from "@railgun-community/engine"
import leveljs from "level-js"

import { createBrowserArtifactGetter } from "sections/privacy/utils/artifacts"
import { RailgunChainConfig } from "sections/privacy/utils/networks"
import { installSnarkJsGroth16 } from "sections/privacy/utils/snarkjs-setup"

// 16 chars max, lowercase + numerals only — engine enforces.
const WALLET_SOURCE = "hydration"

// Polling interval the engine recommends for non-WS RPCs. 15s matches
// Hydration's ~12s block time + a little slack.
const POLLING_INTERVAL_MS = 15_000

// All hex-zero placeholders — V3 contracts not deployed on Hydration. Engine
// only consumes these when supportsV3 = true, which we set to false.
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const stubQuickSyncEvents: QuickSyncEvents = async () => ({
  commitmentEvents: [],
  unshieldEvents: [],
  nullifierEvents: [],
})

const stubQuickSyncRailgunTransactionsV2: QuickSyncRailgunTransactionsV2 =
  async () => []

// POI is disabled on Hydration (chain.id 222222). Always-true validator keeps
// the engine's sanity checks happy without needing a POI service.
const alwaysValidMerkleroot: MerklerootValidator = async () => true

const noValidatedTxid: GetLatestValidatedRailgunTxid = async () => ({
  txidIndex: undefined,
  merkleroot: undefined,
})

export type BootedEngine = {
  engine: RailgunEngine
  provider: PollingJsonRpcProvider
}

export const bootRailgunEngine = async (
  config: RailgunChainConfig,
): Promise<BootedEngine> => {
  // level-js returns an abstract-leveldown-compatible store on top of
  // IndexedDB. The engine's `Database` class detects this and reaches into
  // `level.db.db.db` to clear namespaces efficiently on rescan.
  const leveldown = leveljs(`railgun-engine-${config.chainId}`)

  const engine = await RailgunEngine.initForWallet(
    WALLET_SOURCE,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    leveldown as any,
    createBrowserArtifactGetter(),
    stubQuickSyncEvents,
    stubQuickSyncRailgunTransactionsV2,
    alwaysValidMerkleroot,
    noValidatedTxid,
    undefined,
    false,
  )

  // Phase 5b-snarkjs — wire snarkjs's Groth16 prover into the engine. Without
  // this the engine throws `Requires groth16 full prover implementation` the
  // moment Shield / Send / Unshield tries to build a proof, even with the
  // ArtifactGetter returning wasm+zkey blobs above.
  installSnarkJsGroth16(engine.prover)

  const provider = new PollingJsonRpcProvider(
    config.rpcUrl,
    config.chainId,
    POLLING_INTERVAL_MS,
  )

  await engine.loadNetwork(
    { type: 0, id: config.chainId },
    config.proxy,
    config.relayAdapt,
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    ZERO_ADDRESS,
    provider,
    provider,
    {
      [TXIDVersion.V2_PoseidonMerkle]: config.deploymentBlock,
      [TXIDVersion.V3_PoseidonMerkle]: config.deploymentBlock,
    },
    undefined,
    false,
  )

  return { engine, provider }
}
