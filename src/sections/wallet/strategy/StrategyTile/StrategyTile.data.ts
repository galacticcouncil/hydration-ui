import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAddressFromAssetId } from "utils/evm"
import { normalize, valueToBigNumber } from "@aave/math-utils"
// import { useAssets } from "providers/assets"

export type StrategyRiskLevel = "low" | "moderate" | "high"

export type AssetOverviewData = {
  readonly riskLevel: StrategyRiskLevel
  readonly tvl: string
  readonly apr: number
}

export const useAssetOverviewData = (
  assetId: string,
  riskLevel: StrategyRiskLevel,
): AssetOverviewData => {
  // const { getAsset } = useAssets()
  const { reserves } = useAppDataContext()

  // const asset = getAsset(assetId)

  const assetReserve = reserves.find(
    ({ underlyingAsset }) => underlyingAsset === getAddressFromAssetId(assetId),
  )

  // TODO: calculate APR based on stableswap assets
  /* const underlyingAssetIds =
    asset?.isStableSwap && asset.meta ? Object.keys(asset.meta) : [assetId]

  const underlyingAssetId = getAddressFromAssetId(assetId)
  const underlyingReserves = reserves.filter((reserve) =>
    underlyingAssetIds.includes(reserve.underlyingAsset),
  ) */

  const incentives = assetReserve?.aIncentivesData ?? []

  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === "Infinity",
  )
  const incentivesAPRSum = isIncentivesInfinity
    ? Infinity
    : incentives.reduce(
        (aIncentive, bIncentive) => aIncentive + +bIncentive.incentiveAPR,
        0,
      )

  const incentivesNetAPR = isIncentivesInfinity
    ? Infinity
    : incentivesAPRSum !== Infinity
      ? valueToBigNumber(incentivesAPRSum || 0).toNumber()
      : Infinity

  return {
    riskLevel,
    tvl: assetReserve?.totalLiquidityUSD || "0",
    // TODO 1075 new APR calculation
    apr: incentivesNetAPR === Infinity ? Infinity : incentivesNetAPR * 100,
  }
}

export const useAssetRewards = (assetId: string): string => {
  const { user } = useAppDataContext()

  const underlyingAssetIdLower =
    getAddressFromAssetId(assetId).toLocaleLowerCase()

  const [, incentive] =
    Object.entries(user.calculatedUserIncentives).find(
      ([rewardTokenAddress]) =>
        rewardTokenAddress.toLocaleLowerCase() === underlyingAssetIdLower,
    ) ?? []

  if (!incentive) {
    return "0"
  }

  return normalize(incentive.claimableRewards, incentive.rewardTokenDecimals)
}
