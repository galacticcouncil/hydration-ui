import { type Hex } from "viem"

// ════════════════════════════════════════════════════════════════════════
//  HDCL Vault — lark-2 deployment
//  ─────────────────────────────────────────────────────────────────────
//  Reference: aave-v3-deploy/hdcl-vault/deployments/lark-2.md
//  Network:   Hydration lark testnet (`2.lark.hydration.cloud`, chain 222222)
//  Surface:   ERC-4626 (deposit/mint) + ERC-7540 (async redeem)
// ════════════════════════════════════════════════════════════════════════

export const VAULT_ADDRESS: Hex = "0xbDAFEB92440d8696d6C143bc7e6B086d461e3502"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

// Decentral pool the vault deploys HOLLAR into. Surfaced here only so the
// DepositPanel can read `minimumInvestmentPeriodSeconds` for the "Lockup
// period" copy. Vault uses `activeDepositPool()` to resolve the same value
// on-chain, which is the authoritative source.
export const DECENTRAL_POOL_ADDRESS: Hex =
  "0x207a626c07b73E76134177D1f44B0f32e94ADB5a"

// ────────────────────────────────────────────────────────────────────────
// HDCL Aave V3 money-market layer — live on lark-2.
//
// Deployed against the lark-2 vault and enacted via governance ref #383
// (Root track, block 222762). The Aave pool, deposit-zap, and aToken below
// power the borrow / supply / instant-redeem flows.
//
// Aave layer endpoints:
//   - Supply DCL  → pool.supply(DCL_PRECOMPILE, ..., user, 0)
//   - Borrow HOLLAR → pool.borrow(HOLLAR, ..., 2, 0, user)
//   - Zap deposit (HOLLAR → vault → pool.supply) → zap.depositAndSupply
//   - Instant redeem path uses the HDCL/HOLLAR stableswap (id 10055).
// ────────────────────────────────────────────────────────────────────────
export const HDCL_HAS_AAVE_LAYER = true

export const HDCL_POOL_ADDRESS: Hex =
  "0xEAb87D2aAc4C70AF63D2d9E85876665060e117E2"
export const HDCL_DEPOSIT_ZAP_ADDRESS: Hex =
  "0x146F6C43a0070F42cB532C74c412A34bb55A5729"
export const HDCL_ATOKEN_ADDRESS: Hex =
  "0x8912ff2164655A3406902ee9e802EBb16ec881D9"

// Substrate-asset precompile aliases. Keyed off substrate asset ids, not the
// EVM deploy — unchanged across lark generations.
//   HDCL (asset 55,  0x37 hex) — user-facing aToken receipt; what users hold.
//   DCL  (asset 550, 0x226 hex) — the underlying reserve registered in the
//                                  Aave pool. Use this for pool.getConfiguration
//                                  / pool.getReserveData.
export const HDCL_PRECOMPILE_ADDRESS: Hex =
  "0x0000000000000000000000000000000100000037"
export const DCL_PRECOMPILE_ADDRESS: Hex =
  "0x0000000000000000000000000000000100000226"

// Aave V3 interestRateMode for borrows: 2 = variable (GhoAToken path).
export const AAVE_INTEREST_RATE_MODE_VARIABLE = 2n

// First block at which the lark-2 vault proxy emitted a log. Used as
// `fromBlock` for getLogs queries — public RPCs reject scans from genesis.
// Update on every fresh lark deploy.
//   2.lark proxy deploy: tx in block 138433
export const VAULT_DEPLOY_BLOCK = 138433n

// HDCL/HOLLAR stableswap pool — share-asset id 10055. Used by the
// instant-redeem path which swaps the aToken receipt for HOLLAR via
// the substrate stableswap. Live on lark-2 since ref #399.
export const STABLESWAP_POOL_ID = 10055n
// Asset id of HDCL inside the stableswap pair (the aToken receipt users
// hold). Under the mainnet-aligned naming applied by ref #383, HDCL =
// asset 55. The substrate stableswap pair is (55, 222) = (HDCL, HOLLAR).
export const STABLESWAP_HDCL_ASSET_ID = 55n

export const EVM_CALL_GAS = 5_000_000n

// ────────────────────────────────────────────────────────────────────────
// Vault ABI — current surface as of lark-2 (commit 555abc7).
// ────────────────────────────────────────────────────────────────────────
export const VAULT_ABI = [
  // ERC-20 / state -------------------------------------------------------
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
  // Config / state views -------------------------------------------------
  {
    type: "function",
    name: "activeDepositPool",
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
    name: "minReinvestAmount",
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
    name: "getAPYWad",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Positions ------------------------------------------------------------
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
  // Redemption queue -----------------------------------------------------
  {
    type: "function",
    name: "getRedemptionQueueLength",
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
    name: "getQueueHead",
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
  // Note: tuple shape changed at lark-2.
  // Old: (user, hdclAmount, hdclFulfilled, active) — 4 fields
  // New: (user, hdclAmount, hdclSettled, hollarOwed, active) — 5 fields.
  // `hdclSettled` is the portion already covered by idle HOLLAR;
  // `hollarOwed` is the HOLLAR price-locked for that settled portion.
  {
    type: "function",
    name: "getRedemptionRequest",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [
      { name: "user", type: "address" },
      { name: "hdclAmount", type: "uint256" },
      { name: "hdclSettled", type: "uint256" },
      { name: "hollarOwed", type: "uint256" },
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
  // ERC-7540 spec views --------------------------------------------------
  {
    type: "function",
    name: "pendingRedeemRequest",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "controller", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "claimableRedeemRequest",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "controller", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxRedeem",
    inputs: [{ name: "controller", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "maxWithdraw",
    inputs: [{ name: "controller", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Previews. `previewDeposit` reverts on inputs where `deposit` would
  // revert (ZeroAmount / DepositTooSmall / VaultEmpty); callers must wrap
  // it in a try/catch or guard against the failure modes.
  {
    type: "function",
    name: "previewDeposit",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewMint",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewRedeem",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "previewWithdraw",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "pure",
  },
  // Operator / auto-claim opt-in ----------------------------------------
  {
    type: "function",
    name: "isOperator",
    inputs: [
      { name: "controller", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setOperator",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "autoClaimEnabled",
    inputs: [{ name: "controller", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "setAutoClaim",
    inputs: [{ name: "enabled", type: "bool" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  // Writes --------------------------------------------------------------
  // ERC-4626 deposit. assets = HOLLAR, receiver = hDCL recipient.
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // ERC-4626 mint. shares = exact hDCL output; pulls computed HOLLAR.
  {
    type: "function",
    name: "mint",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // ERC-7540 async redeem request. shares = hDCL escrowed,
  // controller = future claimer, owner = source of the hDCL.
  {
    type: "function",
    name: "requestRedeem",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "controller", type: "address" },
      { name: "owner", type: "address" },
    ],
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
  // ERC-7540 claim — pulls settled HOLLAR by share count.
  {
    type: "function",
    name: "redeem",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "controller", type: "address" },
    ],
    outputs: [{ name: "assets", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // ERC-7540 claim — pulls settled HOLLAR by HOLLAR amount.
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
      { name: "controller", type: "address" },
    ],
    outputs: [{ name: "shares", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // Events ---------------------------------------------------------------
  // Canonical ERC-4626 / 7540 events
  {
    type: "event",
    name: "Deposit",
    anonymous: false,
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "assets", type: "uint256", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Withdraw",
    anonymous: false,
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "receiver", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "assets", type: "uint256", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RedeemRequest",
    anonymous: false,
    inputs: [
      { name: "controller", type: "address", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "requestId", type: "uint256", indexed: true },
      { name: "sender", type: "address", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  // Vault-specific richer events
  {
    type: "event",
    name: "Deposited",
    anonymous: false,
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "hollarAmount", type: "uint256", indexed: false },
      { name: "hdclMinted", type: "uint256", indexed: false },
      { name: "tokenId", type: "uint256", indexed: false },
    ],
  },
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
  {
    type: "event",
    name: "OperatorSet",
    anonymous: false,
    inputs: [
      { name: "controller", type: "address", indexed: true },
      { name: "operator", type: "address", indexed: true },
      { name: "approved", type: "bool", indexed: false },
    ],
  },
  {
    type: "event",
    name: "AutoClaimSet",
    anonymous: false,
    inputs: [
      { name: "controller", type: "address", indexed: true },
      { name: "enabled", type: "bool", indexed: false },
    ],
  },
] as const

// Static (non-display) metadata for the single HDCL strategy ("Decentral").
// User-visible labels and copy live in `i18n/locales/*/hdcl.json` — this
// constant only carries values that don't belong in translation.
//
// `maxLtvPct` / `liquidationLtvPct` are first-paint fallbacks; the live
// values come from `useHdclReserveConfig` (decoded from the HDCL pool's
// reserve configuration bitmap) and replace these on resolve — only
// meaningful when HDCL_HAS_AAVE_LAYER is true.
export const STRATEGY = {
  id: "decentral",
  /** First-paint LTV fallback (pct). Live value from reserve config. */
  maxLtvPct: 80,
  /** First-paint liquidation LTV fallback (pct). Live value from reserve config. */
  liquidationLtvPct: 90,
} as const

// Minimal Aave V3 Pool ABI subset — only the calls the HDCL-strategy page
// actually makes. Inactive on lark-2 until the Aave layer is redeployed
// (HDCL_HAS_AAVE_LAYER = false).
export const HDCL_POOL_ABI = [
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
  {
    type: "function",
    name: "repay",
    inputs: [
      { name: "asset", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interestRateMode", type: "uint256" },
      { name: "onBehalfOf", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
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
  // Subset of Aave V3 reserve data — we only consume `currentVariableBorrowRate`
  // (uint128 ray; annual linear rate) but the tuple shape must match exactly
  // for viem to decode the return value.
  {
    type: "function",
    name: "getReserveData",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "configuration", type: "uint256" },
          { name: "liquidityIndex", type: "uint128" },
          { name: "currentLiquidityRate", type: "uint128" },
          { name: "variableBorrowIndex", type: "uint128" },
          { name: "currentVariableBorrowRate", type: "uint128" },
          { name: "currentStableBorrowRate", type: "uint128" },
          { name: "lastUpdateTimestamp", type: "uint40" },
          { name: "id", type: "uint16" },
          { name: "aTokenAddress", type: "address" },
          { name: "stableDebtTokenAddress", type: "address" },
          { name: "variableDebtTokenAddress", type: "address" },
          { name: "interestRateStrategyAddress", type: "address" },
          { name: "accruedToTreasury", type: "uint128" },
          { name: "unbacked", type: "uint128" },
          { name: "isolationModeTotalDebt", type: "uint128" },
        ],
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
// HOLLAR into. We only need the minimum investment period for the
// "Lockup period" copy.
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
