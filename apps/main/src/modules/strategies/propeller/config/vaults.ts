import {
  ETH_ASSET_ID,
  GETH_ASSET_ID,
  GETH_ERC20_ID,
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
  /** the collateral's name in the strategy when its registry symbol is a pool share's */
  collateralSymbol?: string
}

export const PROPELLER_VAULTS: PropellerVaultConfig[] = [
  {
    assetId: GETH_ASSET_ID,
    vaultAddress: "0x79b41c78a2b5ac1ddc3c80877449b1cc8f850c46",
    shareAssetId: "5552",
    shareSymbol: "jETH",
    shareName: "Juicer ETH",
    baseAssetId: ETH_ASSET_ID,
    payAssetIds: [GETH_ERC20_ID, ETH_ASSET_ID],
    collateralSymbol: "GIGAETH",
  },
  {
    assetId: "1000765",
    vaultAddress: "0x2c66100c46d15d6b826ba2a89f2d31e3ca47a153",
    shareAssetId: "5553",
    shareSymbol: "jBTC",
    shareName: "Juicer BTC",
  },
]

export const PROPELLER_RISK_PROFILE = "low"

export const vaultCollateral = <T extends { symbol: string }>(
  vault: PropellerVaultConfig,
  asset: T,
): T =>
  vault.collateralSymbol ? { ...asset, symbol: vault.collateralSymbol } : asset

/**
 * The asset every user-facing amount is denominated in: the base asset when
 * the collateral tracks one (GETH shows as ETH), the collateral itself
 * otherwise. Share and collateral units never reach the user.
 */
export const vaultDisplayAssetId = (vault: PropellerVaultConfig): string =>
  vault.baseAssetId ?? vault.assetId
