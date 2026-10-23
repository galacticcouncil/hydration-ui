import {
  ETH_ASSET_ID,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
  WSTETH_ASSET_ID,
} from "@galacticcouncil/utils"
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
    assetId: GETH_ASSET_ID,
    vaultAddress: "0x7b200b8c8a5ffd7720a48b0cb5a7f9fc6a512578",
    shareAssetId: "5552",
    shareSymbol: "jETH",
    shareName: "Juicer ETH",
    baseAssetId: ETH_ASSET_ID,
    // every entry the router already handles: ETH wraps to aETH and joins the
    // pool, wstETH joins directly (it is a constituent), GETH unwinds 1:1
    // through the Aave leg, and the raw pool share deposits with no swap
    payAssetIds: [GETH_ERC20_ID, ETH_ASSET_ID, WSTETH_ASSET_ID],
    // GETH is a 1:1 Aave hop; ETH and wstETH are swapped
    payoutAssetIds: [ETH_ASSET_ID, GETH_ERC20_ID, WSTETH_ASSET_ID],
    collateralDisplayId: GETH_ERC20_ID,
  },
  {
    assetId: "1000765",
    vaultAddress: "0x13ad8e687f7d9aab96025497ba5a96968175cc22",
    shareAssetId: "5553",
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
