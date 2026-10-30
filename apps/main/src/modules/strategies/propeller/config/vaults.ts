import { type Hex } from "viem"

export interface PropellerVaultConfig {
  assetId: string
  vaultAddress: Hex
  /** Registry id of the vault share token. */
  shareAssetId: string
  shareSymbol: string
  shareName: string
  /** asset the collateral tracks; deposits can pay with it and amounts show its equivalent */
  baseAssetId?: string
  /** assets a deposit can pay with through a swap; the base asset when unset */
  payAssetIds?: string[]
  /** assets a claim can pay out in through a sell of the collateral; the collateral when unset */
  payoutAssetIds?: string[]
  /**
   * The asset whose identity (symbol, logo) represents the collateral in the
   * UI when the collateral itself is a pool share — the same convention as
   * the money market's reserve display (2-Pool-GETH wears GETH's face).
   */
  collateralDisplayId?: string
}

export const PROPELLER_VAULTS: PropellerVaultConfig[] = [
  {
    assetId: "1000765",
    vaultAddress: "0x79b41c78a2b5ac1ddc3c80877449b1cc8f850c46",
    shareAssetId: "5552",
    shareSymbol: "jBTC",
    shareName: "Juicer BTC",
  },
]

export const PROPELLER_RISK_PROFILE = "low"

/**
 * The identity the collateral is shown under: a pool-share collateral wears
 * its product token's symbol and logo (2-Pool-GETH displays as GETH).
 */
export const vaultCollateralDisplayId = (vault: PropellerVaultConfig): string =>
  vault.collateralDisplayId ?? vault.assetId

/**
 * The asset every user-facing amount is denominated in: the base asset when
 * the collateral tracks one (GETH shows as ETH), the collateral itself
 * otherwise. Share and collateral units never reach the user.
 */
export const vaultDisplayAssetId = (vault: PropellerVaultConfig): string =>
  vault.baseAssetId ?? vault.assetId
