import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

export const STRATEGY_MAX_LEVERAGE = 4

// Maps collateral assetId -> debt assetId. Defaults to HUSD (Hollar) for all strategies.
const STRATEGY_DEBT_ASSET_MAP: Record<string, string> = {}

export const getStrategyDebtAssetId = (collateralAssetId: string): string => {
  return STRATEGY_DEBT_ASSET_MAP[collateralAssetId] ?? HOLLAR_ASSET_ID
}
