import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAddressFromAssetId } from "utils/evm"
import { normalize, valueToBigNumber } from "@aave/math-utils"
import { useAssets } from "providers/assets"
import { useBifrostVDotApy } from "api/external/bifrost"
import BN from "bignumber.js"

const VDOT_ASSET_ID = "15"

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
  const { getAsset, getErc20 } = useAssets()
  const { reserves } = useAppDataContext()

  const asset = getAsset(assetId)

  const assetReserve = reserves.find(
    ({ underlyingAsset }) => underlyingAsset === getAddressFromAssetId(assetId),
  )

  const assetIds =
    asset?.isStableSwap && asset.meta ? Object.keys(asset.meta) : [assetId]

  const { data: vDotApy } = useBifrostVDotApy({
    enabled: assetIds.includes(VDOT_ASSET_ID),
  })

  const underlyingAssetIds = assetIds.map((assetId) => {
    return getErc20(assetId)?.underlyingAssetId ?? assetId
  })

  const underlyingReserves = reserves.filter((reserve) => {
    return underlyingAssetIds
      .map(getAddressFromAssetId)
      .includes(reserve.underlyingAsset)
  })

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

  const suppliesAPY = underlyingReserves.map((reserve) => {
    const isVdot =
      reserve.underlyingAsset === getAddressFromAssetId(VDOT_ASSET_ID)

    const supplyAPY = isVdot
      ? BN(vDotApy?.apy ?? 0).div(100)
      : BN(reserve.supplyAPY)
    return supplyAPY.div(underlyingReserves.length).toNumber()
  })

  const supplyAPYSum = suppliesAPY.reduce((a, b) => a + b, 0)

  const totalAPR = isIncentivesInfinity
    ? Infinity
    : supplyAPYSum + incentivesNetAPR

  return {
    riskLevel,
    tvl: assetReserve?.totalLiquidityUSD || "0",
    apr: totalAPR === Infinity ? Infinity : totalAPR * 100,
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
