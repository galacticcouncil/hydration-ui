import { type FileRouteTypes } from "@tanstack/react-router"
import { type Hex } from "viem"

// ════════════════════════════════════════════════════════════════════════
//  Propeller — per-collateral vault registry (lark-4)
//  ─────────────────────────────────────────────────────────────────────
//  One shared SubLoop + Harvester + SyntheticToken back every collateral;
//  each collateral gets its own CollateralVault. Every vault is its own
//  strategy with its own flat route (/strategies/propeller-<asset>); the page
//  is generic and components/hooks read the active PropellerVaultConfig from
//  PropellerVaultProvider instead of hardcoded ETH constants.
//
//  ⚠ MAINNET CHECKLIST — every deployment-specific constant, in one place:
//    1. PROPELLER_VAULTS.eth.vaultAddress   (below)
//    2. PROPELLER_VAULTS.tbtc.vaultAddress  (below)
//    3. SUBLOOP_ADDRESS                     (constants.ts)
//    4. VAULT_DEPLOY_BLOCK                  (constants.ts)
//  POOL_ADDRESS, HOLLAR_ADDRESS and PRIME_ADDRESS are mainnet-mirrored on
//  lark and do NOT change. `assetAddress` values are Substrate asset
//  precompiles (eth_getCode == "0x00"), also identical across networks.
// ════════════════════════════════════════════════════════════════════════

export type PropellerAsset = "eth" | "tbtc"

export interface PropellerVaultConfig {
  /** route key + lookup id */
  key: PropellerAsset
  /** substrate asset id of the underlying collateral */
  assetId: string
  /** EVM address of the underlying collateral token */
  assetAddress: Hex
  /** the CollateralVault (ERC-4626) proxy for this collateral */
  vaultAddress: Hex
  /** collateral display symbol, e.g. "ETH" */
  symbol: string
  /** vault share display symbol, e.g. "pETH" */
  shareSymbol: string
}

export const PROPELLER_VAULTS: Record<PropellerAsset, PropellerVaultConfig> = {
  eth: {
    key: "eth",
    assetId: "34",
    assetAddress: "0x0000000000000000000000000000000100000022",
    vaultAddress: "0x1D7C983Bfd8087BFB1671EF52a157cCad0ba13F8",
    symbol: "ETH",
    shareSymbol: "pETH",
  },
  tbtc: {
    key: "tbtc",
    assetId: "1000765",
    assetAddress: "0x00000000000000000000000000000001000f453d",
    vaultAddress: "0x294862CBfaa0E4fD6d3C29E8d354B680EfCAFEc1",
    symbol: "tBTC",
    shareSymbol: "ptBTC",
  },
}

/**
 * Risk profile shared by every Propeller vault — the loop is self-deleveraging
 * and the user position cannot be liquidated, regardless of the collateral.
 * Resolves to the `strategy.risk.<level>` string in the propeller namespace.
 */
export const PROPELLER_RISK_PROFILE = "low"

/** Flat per-vault route of each strategy. */
export const PROPELLER_VAULT_ROUTE: Record<
  PropellerAsset,
  FileRouteTypes["to"]
> = {
  eth: "/strategies/propeller-eth",
  tbtc: "/strategies/propeller-tbtc",
}
