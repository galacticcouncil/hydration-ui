import { type Hex } from "viem"

// ════════════════════════════════════════════════════════════════════════
//  Propeller — per-collateral vault registry (lark-2)
//  ─────────────────────────────────────────────────────────────────────
//  One shared SubLoop + Harvester + SyntheticToken back every collateral;
//  each collateral gets its own CollateralVault. The UI is parameterized by
//  `asset` (route /strategies/propeller/$asset) — components/hooks read the
//  active PropellerVaultConfig instead of hardcoded ETH constants.
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
    vaultAddress: "0x305EE427b94187c5abC68fCCc194E77D82F39921",
    symbol: "ETH",
    shareSymbol: "pETH",
  },
  tbtc: {
    key: "tbtc",
    assetId: "1000765",
    assetAddress: "0x00000000000000000000000000000001000f453d",
    vaultAddress: "0x8E84b6e1eFfdF6C3258854ED2E813b1882b719Bf",
    symbol: "tBTC",
    shareSymbol: "ptBTC",
  },
}

export const DEFAULT_PROPELLER_ASSET: PropellerAsset = "eth"

export const getPropellerVault = (key: string): PropellerVaultConfig =>
  PROPELLER_VAULTS[
    (key as PropellerAsset) in PROPELLER_VAULTS
      ? (key as PropellerAsset)
      : DEFAULT_PROPELLER_ASSET
  ]
