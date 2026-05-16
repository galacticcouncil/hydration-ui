// Phase 5d — broadcaster (waku relayer) discovery types + mock dataset.
//
// REAL CLIENT WIRING IS PENDING:
//   `yarn add @railgun-community/waku-broadcaster-client` returns 404 from the
//   public registry today, and even when the package is published the discovery
//   loop gates on `NetworkName.Hydration` inside the broadcaster's
//   shared-models import — which doesn't exist until the Phase 3 vendor fork
//   ships. So we expose the same hook + provider surface against a single
//   hard-coded Hydration-team broadcaster. When Phase 3 lands:
//     1. replace `MOCK_BROADCASTERS` with `BroadcasterConnection.findAll(...)`
//        (or whatever the published client exposes)
//     2. swap `broadcastTransactionMock` for the real Waku
//        `transactGasEstimate` + `transactBroadcasterPost` path
//     3. delete this file's `__MOCK__: true` flag from consumers
//
// The shape mirrors @railgun-community/shared-models BroadcasterFeeMessageData
// + SelectedBroadcaster (see hydration-railgun-poc/shared-models/.../broadcaster.ts)
// so the swap is mechanical: keep the same fields, point at real data.

export type BroadcasterTokenFee = {
  /** EVM address of the token the broadcaster accepts as fee payment. */
  tokenAddress: `0x${string}`
  /** Token symbol for display (denormalized from asset registry). */
  symbol: string
  /**
   * Fee per unit of gas, expressed in token base units (10^decimals).
   * Mirrors `CachedTokenFee.feePerUnitGas` — string to dodge JS number range.
   */
  feePerUnitGas: string
  /** Unix seconds; fee quote stops being valid past this point. */
  expiration: number
}

export type Broadcaster = {
  /** 0zk address used to pay the fee transfer into. */
  railgunAddress: string
  /** Free-form human label, surfaced in the picker. */
  identifier: string
  /** Engine version the broadcaster understands. */
  version: string
  /** RelayAdapt contract address the broadcaster relays through. */
  relayAdapt: `0x${string}`
  /** 0..1, broadcaster's self-reported success rate. */
  reliability: number
  /** Concurrent wallets, used to gate "available now" UI. */
  availableWallets: number
  /** Last time we saw a fee message from this broadcaster (unix ms). */
  lastSeenAt: number
  /** Required POI list keys. Empty array => POI gating disabled. */
  requiredPOIListKeys: string[]
  /** Accepted fee tokens. The picker shows one row per token, generally. */
  fees: BroadcasterTokenFee[]
  /**
   * Marker so the picker can flag "MOCK" rows. `true` while the live Waku
   * client hasn't started yet (or failed to start); `false` once a real
   * fee announcement populates this row.
   */
  __MOCK__: boolean
}

// Hydration ETH precompile — see project_hydration_evm_assets memory.
const ETH_PRECOMPILE: `0x${string}` =
  "0x0000000000000000000000000000000000000014"

// Phase 5d placeholder: a single Hydration-operated broadcaster announcing it
// accepts ETH fees. The 0zk address is a syntactically-valid stub; nothing
// dispatches to it.
export const MOCK_BROADCASTERS: Broadcaster[] = [
  {
    railgunAddress:
      "0zk1qyqqqqqqq222222ff7be76052e023ec1a306fcca8f9659d80qq2c0n9r",
    identifier: "Hydration team (mock)",
    version: "9.5.4",
    // Phase 0 relayAdapt address (lark node4) — see networks.ts.
    relayAdapt: "0x273280a6248BFEC57bc7ef2A16E70AEBe065D737",
    reliability: 0.99,
    availableWallets: 4,
    lastSeenAt: Date.now(),
    requiredPOIListKeys: [], // POI gating disabled on Hydration
    fees: [
      {
        tokenAddress: ETH_PRECOMPILE,
        symbol: "ETH",
        // Stub: ~0.000 000 020 ETH per unit gas. Real broadcasters quote a
        // markup over the live gas price; we just need a non-zero value the
        // picker can render.
        feePerUnitGas: "20000000000",
        expiration: Math.floor(Date.now() / 1000) + 5 * 60,
      },
    ],
    __MOCK__: true,
  },
]
