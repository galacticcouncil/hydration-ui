import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

export const MAX_SAFE_LEVERAGE_FACTOR = 0.95

const STRATEGY_DEBT_ASSET_MAP: Record<string, string> = {}

export const getStrategyDebtAssetId = (collateralAssetId: string): string => {
  return STRATEGY_DEBT_ASSET_MAP[collateralAssetId] ?? HOLLAR_ASSET_ID
}
