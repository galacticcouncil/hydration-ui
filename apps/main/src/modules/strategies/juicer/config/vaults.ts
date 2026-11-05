import {
  ETH_ASSET_ID,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
  WSTETH_ASSET_ID,
} from "@galacticcouncil/utils"
import { type Hex } from "viem"

export interface JuicerVaultConfig {
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

export const JUICER_VAULTS: JuicerVaultConfig[] = [
  {
    assetId: GETH_ASSET_ID,
    vaultAddress: "0xa64e418978482d5de91717cf6c77e1f40105f2ab",
    shareAssetId: "5551",
    shareSymbol: "jETH",
    shareName: "Juicer ETH",
    baseAssetId: ETH_ASSET_ID,
    payAssetIds: [GETH_ERC20_ID, ETH_ASSET_ID, WSTETH_ASSET_ID],
    payoutAssetIds: [ETH_ASSET_ID, GETH_ERC20_ID, WSTETH_ASSET_ID],
    collateralDisplayId: GETH_ERC20_ID,
  },
]

export const JUICER_RISK_PROFILE = "low"

/**
 * The identity the collateral is shown under: a pool-share collateral wears
 * its product token's symbol and logo (2-Pool-GETH displays as GETH).
 */
export const vaultCollateralDisplayId = (vault: JuicerVaultConfig): string =>
  vault.collateralDisplayId ?? vault.assetId

/**
 * The asset every user-facing amount is denominated in: the base asset when
 * the collateral tracks one (GETH shows as ETH), the collateral itself
 * otherwise. Share and collateral units never reach the user.
 */
export const vaultDisplayAssetId = (vault: JuicerVaultConfig): string =>
  vault.baseAssetId ?? vault.assetId
