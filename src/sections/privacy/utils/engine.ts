// Phase 5b — boot the RAILGUN engine in scan-only mode.
//
// scan-only = no proof generation needed (no shield/send/unshield/swap yet),
// so the artifact getter is a stub that throws. quickSync also stubs to empty
// arrays for now: 5d wires the Subsquid indexer. Until then the engine falls
// back to slow `eth_getLogs` against the lark RPC, which is fine for a fresh
// chain at ~250k blocks.
//
// What this proves end-to-end once mounted: package resolution, ethers v6
// FallbackProvider construction, PollingJsonRpcProvider over lark HTTP RPC,
// engine init + loadNetwork against the Phase 0 proxy, scan progress events.

import {
  ArtifactGetter,
  GetLatestValidatedRailgunTxid,
  MerklerootValidator,
  PollingJsonRpcProvider,
  QuickSyncEvents,
  QuickSyncRailgunTransactionsV2,
  RailgunEngine,
  TXIDVersion,
} from "@railgun-community/engine"
import leveljs from "level-js"

import { RailgunChainConfig } from "sections/privacy/utils/networks"

// 16 chars max, lowercase + numerals only — engine enforces.
const WALLET_SOURCE = "hydration"

// Polling interval the engine recommends for non-WS RPCs. 15s matches
// Hydration's ~12s block time + a little slack.
const POLLING_INTERVAL_MS = 15_000

// All hex-zero placeholders — V3 contracts not deployed on Hydration. Engine
// only consumes these when supportsV3 = true, which we set to false.
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000"

const stubArtifactGetter: ArtifactGetter = {
  assertArtifactExists: () => {
    throw new Error(
      "RAILGUN proof artifacts not loaded — scan-only mode. Proof generation lands in Phase 5c (shield).",
    )
  },
  getArtifacts: async () => {
    throw new Error(
      "RAILGUN proof artifacts not loaded — scan-only mode. Proof generation lands in Phase 5c (shield).",
    )
  },
  getArtifactsPOI: async () => {
    throw new Error(
      "RAILGUN POI artifacts not loaded — POI is bypassed on Hydration.",
    )
  },
}

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
    stubArtifactGetter,
    stubQuickSyncEvents,
    stubQuickSyncRailgunTransactionsV2,
    alwaysValidMerkleroot,
    noValidatedTxid,
    undefined,
    false,
  )

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
