import { type Hex } from "viem"

// ════════════════════════════════════════════════════════════════════════
//  Propeller Vault — lark-4 deployment
//  ─────────────────────────────────────────────────────────────────────
//  Reference: gc-money-market@ys-propeller-fixes → propeller-vault/
//  Network:   Hydration lark testnet (`node4.lark.hydration.cloud`)
//  Surface:   ERC-4626 (deposit) + ERC-7540-style async redeem queue.
//
//  ⚠ MAINNET CHECKLIST — the constants that must be repointed on redeploy:
//    1. SUBLOOP_ADDRESS      (below)
//    2. VAULT_DEPLOY_BLOCK   (below)
//    3. PROPELLER_VAULTS.eth.vaultAddress   (vaults.ts)
//    4. PROPELLER_VAULTS.tbtc.vaultAddress  (vaults.ts)
//  POOL_ADDRESS, HOLLAR_ADDRESS and PRIME_ADDRESS are mainnet-mirrored on
//  lark and stay as they are.
//
//  Unlike BIL, Propeller has NO user-facing borrow leg. The vault runs a
//  leveraged loop internally (CollateralVault → SubLoop) and the user only
//  ever sees: deposit collateral → hold vault shares → async redeem back.
//
//  Per-collateral CollateralVault addresses live in `vaults.ts`.
// ════════════════════════════════════════════════════════════════════════

// SubLoop — the single leverage engine shared by every CollateralVault.
// Read-only from the UI: `healthFactor()` and `totalEquity()` power the
// optional leverage/HF detail line in the strategy card.
export const SUBLOOP_ADDRESS: Hex = "0x8F790900596a2172F307250389CEEF3923B56ec6"

// First block to scan event logs from. On lark-4 the SubLoop landed at block
// 287138 and the two CollateralVaults at 287140 / 287154; 287000 is a safe
// lower bound. Over-scanning only costs a little time — under-scanning
// silently truncates withdrawal history.
export const VAULT_DEPLOY_BLOCK = 287000n

export const EVM_CALL_GAS = 2_000_000n

// ────────────────────────────────────────────────────────────────────────
// Vault ABI — hand-trimmed from the authoritative artifact
//   aave-v3-deploy/propeller-vault/out/CollateralVault.sol/CollateralVault.json
// Only the functions/events the UI touches are kept.
// ────────────────────────────────────────────────────────────────────────
export const VAULT_ABI = [
  // ERC-20 views / approve ----------------------------------------------
  {
    type: "function",
    name: "totalSupply",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalAssets",
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
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  // ERC-4626 conversions -------------------------------------------------
  {
    type: "function",
    name: "asset",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "exchangeRate",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Synthetic (psHOLLAR) the vault supplies to Aave as collateral, sized
  // debt/LT·1.005. It inflates `getUserAccountData(vault).totalCollateralBase`,
  // which is why the vault's LTV must come from the reserve config, not from
  // that call — see `usePropellerApy`.
  {
    type: "function",
    name: "syntheticSupplied",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "convertToAssets",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "convertToShares",
    inputs: [{ name: "assets", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // State / pause flags / cap -------------------------------------------
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
    name: "tvlCap",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Async redeem queue ---------------------------------------------------
  {
    type: "function",
    name: "queueHead",
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
    name: "totalQueuedShares",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Redemption struct getter.
  //   (owner, shares, collateralOwed, debtShare, synthShare, repaid,
  //    collateralSettled, sharesBurned, active)
  // active stays TRUE until the owner claims; `claim` reverts with
  // RequestNotActive otherwise. Claimable == active && collateralSettled > 0
  // (pokeSettle settles proportionally, so it can be partially filled);
  // active == false means already claimed.
  {
    type: "function",
    name: "redemptions",
    inputs: [{ name: "requestId", type: "uint256" }],
    outputs: [
      { name: "owner", type: "address" },
      { name: "shares", type: "uint256" },
      { name: "collateralOwed", type: "uint256" },
      { name: "debtShare", type: "uint256" },
      { name: "synthShare", type: "uint256" },
      { name: "repaid", type: "uint256" },
      { name: "collateralSettled", type: "uint256" },
      { name: "sharesBurned", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  // Writes ---------------------------------------------------------------
  // ERC-4626 deposit. assets = collateral pulled, receiver = share recipient.
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "assets", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // Async redeem request. shares = vault shares escrowed, owner = source of shares.
  {
    type: "function",
    name: "requestRedeem",
    inputs: [
      { name: "shares", type: "uint256" },
      { name: "owner", type: "address" },
    ],
    outputs: [{ name: "requestId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // Claim a settled request — pays out collateral to `receiver`.
  {
    type: "function",
    name: "claim",
    inputs: [
      { name: "requestId", type: "uint256" },
      { name: "receiver", type: "address" },
    ],
    outputs: [{ name: "amountOut", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  // Events ---------------------------------------------------------------
  {
    type: "event",
    name: "Deposited",
    anonymous: false,
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "assets", type: "uint256", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RedeemRequested",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "owner", type: "address", indexed: true },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "RedeemSettled",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "collateral", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "Claimed",
    anonymous: false,
    inputs: [
      { name: "requestId", type: "uint256", indexed: true },
      { name: "receiver", type: "address", indexed: true },
      { name: "collateral", type: "uint256", indexed: false },
    ],
  },
] as const

// SubLoop read-only ABI — leverage/health-factor detail line. Both return
// WAD-scaled values (1e18).
export const SUBLOOP_ABI = [
  {
    type: "function",
    name: "healthFactor",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalEquity",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "targetHf",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  // Per-vault share of the loop's equity. `requestRedeem` reverts with
  // NoLoopEquity when this is 0 for the calling vault, so the UI must block
  // the withdraw CTA on it — see `useLoopEquity`.
  {
    type: "function",
    name: "equityOf",
    inputs: [{ name: "vault", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const

// Aave main-market pool — for the loop's live carry (PRIME supply − HOLLAR
// borrow) and leverage. The loop's collateral is aPRIME, debt is HOLLAR.
export const POOL_ADDRESS: Hex = "0x1b02E051683b5cfaC5929C25E84adb26ECf87B38"
export const PRIME_ADDRESS: Hex = "0x000000000000000000000000000000010000002B"
export const HOLLAR_ADDRESS: Hex = "0x531a654d1696ED52e7275A8cede955E82620f99a"

// Minimal Aave Pool subset: reserve rates (ray, 1e27) + the loop's account data.
export const POOL_ABI = [
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
  // Packed reserve configuration bitmap. Bits 0–15 are the max LTV in bps.
  {
    type: "function",
    name: "getConfiguration",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReserveData",
    inputs: [{ name: "asset", type: "address" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          {
            name: "configuration",
            type: "tuple",
            components: [{ name: "data", type: "uint256" }],
          },
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

// Static (non-display) metadata for the Propeller strategy. User-visible
// labels and copy live in `i18n/locales/*/propeller.json`.
export const STRATEGY = {
  id: "propeller",
} as const

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
