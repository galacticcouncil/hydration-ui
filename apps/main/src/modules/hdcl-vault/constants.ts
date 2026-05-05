import { createPublicClient, type Hex, http } from "viem"

export const VAULT_ADDRESS: Hex = "0xB82cF8A62EB1b51a2f2A9d71C120E2fB8ae548D8"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

// HDCL Aave V3 pool — separate Aave instance from the main money market.
// HDCL is supply-only collateral; HOLLAR is borrow-only via the GhoAToken
// facilitator. ProviderId 22222255.
//   0.lark Pool-Proxy: 0x7d78C0d9c8F6635b2bc481b674bd74E2917392e8
//   mainnet: TODO update on launch (Phase 9)
export const HDCL_POOL_ADDRESS: Hex =
  "0x7d78C0d9c8F6635b2bc481b674bd74E2917392e8"

// Atomic helper that bundles HOLLAR.transferFrom + vault.deposit +
// pool.supply into one EVM call. Replaces the previous off-chain
// `previewDeposit` prediction (which was lossy due to yield accruing
// between read and execution) with the exact `vault.deposit` return value
// passed straight to `pool.supply` on-chain.
//
// Source: aave-v3-deploy/contracts/HDCLDepositZap.sol
// Deploy task: aave-v3-deploy/tasks/misc/deploy-HDCLDepositZap.ts
//   HARDHAT_NETWORK=lark MARKET_NAME=HDCL npx hardhat deploy-HDCLDepositZap \
//     --hollar 0x531a... --vault 0xB82c... --pool 0x7d78... --precompile 0x0000...0037
//
// TODO Phase 9: replace with mainnet deployment address.
//   0.lark: 0x75d09AbAF2005b0ba06abE6a49796D0180D9a375
export const HDCL_DEPOSIT_ZAP_ADDRESS: Hex =
  "0x75d09AbAF2005b0ba06abE6a49796D0180D9a375"

// aToken receipt for HDCL supplied as collateral on the HDCL pool.
// In the post-registry world this aToken is what users see as their "HDCL"
// balance — VAULT_ADDRESS becomes the underlying reserve asset.
//   0.lark AToken-HDCL proxy: 0x9cd4410c27977CD5e400e43B7B1aB5ADD845ada2
//   mainnet: TODO update on launch (Phase 9)
export const HDCL_ATOKEN_ADDRESS: Hex =
  "0x9cd4410c27977CD5e400e43B7B1aB5ADD845ada2"

// Substrate-asset precompile that the HDCL Aave reserve is registered under.
// Hydration treats EVM tokens that are also substrate-side assets as having a
// precompile alias at `0x000…01000000XX` where XX is the substrate asset ID.
// HDCL is asset ID 55 (= 0x37), per `assetRegistry.register(55, ...)` in the
// handover's governance proposal.
//
// Aave's `getReservesList()` returns this precompile, NOT the HDCLVault
// contract address — so all `pool.supply` / `pool.withdraw` / `pool.borrow`
// calls that operate on HDCL must pass this address as the asset argument
// (and approvals must be set on this address too — Aave calls
// `IERC20(precompile).transferFrom(...)` to pull collateral in).
//
// `vault.balanceOf(user)` and `precompile.balanceOf(user)` return the same
// number (they're aliases for the same substrate balance), so balance
// reads on the vault contract still work for the "raw HDCL" display.
export const HDCL_PRECOMPILE_ADDRESS: Hex =
  "0x0000000000000000000000000000000100000037"

// Aave V3 interestRateMode for borrows: 1=stable (deprecated), 2=variable.
// The HOLLAR borrow on this pool flows through the GhoAToken facilitator
// which uses variable rate; a stable-rate borrow would revert.
export const AAVE_INTEREST_RATE_MODE_VARIABLE = 2n

// Block at which the vault proxy was deployed on the configured network.
// Used as `fromBlock` for getLogs queries — scanning from genesis is too
// wide for public RPC nodes. Update when redeploying / switching networks.
//   0.lark proxy deploy: block 0x12623 (75299)
//   mainnet: TODO update on launch
export const VAULT_DEPLOY_BLOCK = 75299n

// HDCL/HOLLAR stableswap pool — share-asset id 10055. Underlying assets:
//   - HOLLAR (substrate id 222)
//   - aHDCL on lark (substrate id 550) / HDCL on mainnet after the rename (id 55)
// The stablepool launch proposal `hdcl-stablepool-lark.ts` registered this
// pool. Used here to wire the instant-redeem path — users swap their
// aToken for HOLLAR via this pool instead of waiting for the queue.
export const STABLESWAP_POOL_ID = 10055n

// User-held aToken substrate id used by the stableswap. Lark naming has
// the aToken at asset 550 (named "aHDCL"); after the mainnet rename it
// will be at asset 55 (named "HDCL"). See HDCL-MAINNET-HANDOVER.md
// "Lark vs mainnet asset id divergence" for full context.
//
// TODO Phase 9: switch to 55n once mainnet runs the asset-rename.
export const STABLESWAP_HDCL_ASSET_ID = 550n

// HOLLAR substrate asset id — destination of the instant-redeem swap.
export const HOLLAR_ASSET_ID = 222n

export const EVM_CALL_GAS = 5_000_000n

// Dedicated HTTP viem client for vault EVM reads.
// The app's papi custom transport (WebSocket) returns empty data for eth_call
// to contracts deployed on the Lark fork, so we use a direct HTTP transport.
const rpcUrl =
  import.meta.env.VITE_PROVIDER_URL?.replace("wss://", "https://").replace(
    "ws://",
    "http://",
  ) || "https://0.lark.hydration.cloud"

export const vaultEvmClient = createPublicClient({
  transport: http(rpcUrl),
})

export const VAULT_ABI = [
  // Read functions
  {
    type: "function",
    name: "totalAssets",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "exchangeRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "withdrawalDelay",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decentralPool",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minRedeemAmount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAPYWad",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRedemptionQueuePending",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "queueTail",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "tvlCap",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "depositsPaused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "minReinvestAmount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Positions
  {
    type: "function",
    name: "getPositionCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPositionHead",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPosition",
    inputs: [{ name: "positionIndex", type: "uint256" }],
    outputs: [
      { name: "tokenId", type: "uint256" },
      { name: "principal", type: "uint256" },
      { name: "apyWad", type: "uint256" },
      { name: "depositTime", type: "uint256" },
      { name: "maturityTime", type: "uint256" },
      { name: "state", type: "uint8" },
    ],
    stateMutability: "view",
  },
  // Redemption queue
  {
    type: "function",
    name: "getRedemptionQueueLength",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getQueueHead",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRedemptionRequest",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [
      { name: "user", type: "address" },
      { name: "hdclAmount", type: "uint256" },
      { name: "hdclFulfilled", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getTotalQueuedHdcl",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getIdleHollar",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getEstimatedWaitTime",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [{ name: "estimatedSeconds", type: "uint256" }],
    stateMutability: "view",
  },
  // Preview
  {
    type: "function",
    name: "previewDeposit",
    inputs: [{ name: "hollarAmount", type: "uint256" }],
    outputs: [{ name: "hdclAmount", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewRedeem",
    inputs: [{ name: "hdclAmount", type: "uint256" }],
    outputs: [{ name: "hollarAmount", type: "uint256" }],
    stateMutability: "view",
  },
  // APY
  {
    type: "function",
    name: "getActiveAPYCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getActiveAPY",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Write functions
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "hollarAmount", type: "uint256" }],
    outputs: [{ name: "hdclMinted", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "requestRedeem",
    inputs: [{ name: "hdclAmount", type: "uint256" }],
    outputs: [{ name: "requestId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelRedeem",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Events — needed for redemption history (request timestamps, fulfilled/cancelled states).
  // Logs filtered by indexed `user`; block timestamps fetched per log.
  {
    type: "event",
    name: "RedemptionRequested",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "hdclAmount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RedemptionFulfilled",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "hollarAmount", type: "uint256", indexed: false },
      { name: "hdclBurned", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RedemptionPartiallyFulfilled",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "user", type: "address", indexed: true },
      { name: "hollarAmount", type: "uint256", indexed: false },
      { name: "hdclBurned", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RedemptionCancelled",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "hdclReturned", type: "uint256", indexed: false },
    ],
  },
] as const

// Static (non-display) metadata for the single HDCL strategy ("Decentral").
// User-visible labels and copy live in `i18n/locales/*/hdcl.json` — this
// constant only carries values that don't belong in translation.
//
// `maxLtvPct` / `liquidationLtvPct` are first-paint fallbacks; the live
// values come from `useHdclReserveConfig` (decoded from the HDCL pool's
// reserve configuration bitmap) and replace these on resolve.
export const STRATEGY = {
  id: "decentral",
  /** First-paint LTV fallback (pct). Live value from reserve config. */
  maxLtvPct: 80,
  /** First-paint liquidation LTV fallback (pct). Live value from reserve config. */
  liquidationLtvPct: 90,
  /** Subscan-style explorer URL for the vault contract. TODO confirm convention. */
  explorerUrl: `https://hydration.subscan.io/account/${VAULT_ADDRESS}`,
} as const

// Minimal Aave V3 Pool ABI subset — only the calls the HDCL-strategy page
// actually makes. The full Pool interface is much larger; we reuse the same
// `vaultEvmClient` http transport since the HDCL pool sits on the same RPC.
export const HDCL_POOL_ABI = [
  // getUserAccountData returns everything the AvailableToBorrowCard +
  // BorrowHollarModal need in one call: borrowable USD, health factor,
  // user's effective LTV / liquidation threshold.
  // All "Base" fields are USD denominated with 1e8 decimals (Aave convention).
  // healthFactor is 1e18.
  {
    type: "function",
    name: "getUserAccountData",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "totalCollateralBase", type: "uint256" },
      { name: "totalDebtBase", type: "uint256" },
      { name: "availableBorrowsBase", type: "uint256" },
      { name: "currentLiquidationThreshold", type: "uint256" },
      { name: "ltv", type: "uint256" },
      { name: "healthFactor", type: "uint256" },
    ],
    stateMutability: "view",
  },
  // Borrow against supplied collateral. interestRateMode must be 2 (variable)
  // for the HOLLAR / GhoAToken facilitator path on this pool.
  {
    type: "function",
    name: "borrow",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" },
      { name: "referralCode", type: "uint16" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Supply collateral to the pool. Used inside the batched deposit flow:
  // vault.deposit mints raw HDCL into the user's wallet; this call hands
  // that HDCL to the pool and mints the aToken receipt back. Aave V3's
  // supply() requires an exact amount (uint256.max is NOT a sweep here —
  // that's repay's behaviour, not supply's).
  {
    type: "function",
    name: "supply",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
      { name: "referralCode", type: "uint16" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Pull supplied collateral back out — burns the user's aToken and returns
  // the underlying. Used inside the batched withdraw flow:
  // pool.withdraw → user has raw HDCL → vault.requestRedeem queues it for
  // HOLLAR redemption. Aave V3 returns the actual amount withdrawn.
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // Reserve configuration as a packed uint256 bitmap. Bits we care about:
  //   0-15:  LTV (basis points)
  //   16-31: liquidation threshold (basis points)
  // Used to display the live Max LTV / Liquidation LTV in the strategy
  // overview, instead of static `STRATEGY` config (which can drift from chain).
  {
    type: "function",
    name: "getConfiguration",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [{ name: "data", type: "uint256" }],
      },
    ],
    stateMutability: "view",
  },
] as const

// HDCLDepositZap ABI — only the entrypoint we call.
export const HDCL_DEPOSIT_ZAP_ABI = [
  {
    type: "function",
    name: "depositAndSupply",
    inputs: [{ name: "hollarAmount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const

// Subset of IDecentralPool — the underlying RWA pool the vault deploys
// HOLLAR into. We only need the minimum investment period, which is the
// shortest a position must run before it can mature and be redeemed. This
// drives the deposit panel's "Lockup period: up to N days" copy.
export const DECENTRAL_POOL_ABI = [
  {
    type: "function",
    name: "minimumInvestmentPeriodSeconds",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const

export const ERC20_ABI = [
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "value", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const
