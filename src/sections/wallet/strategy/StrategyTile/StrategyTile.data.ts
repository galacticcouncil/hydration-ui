import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { getAddressFromAssetId } from "utils/evm"
import { normalize } from "@aave/math-utils"
import { useAssets } from "providers/assets"
import { useBifrostVDotApy } from "api/external/bifrost"
import BN from "bignumber.js"
import { VDOT_ASSET_ID } from "utils/constants"
import { useMemo } from "react"
import { useAssetsPrice } from "state/displayPrice"
import { Reward } from "sections/lending/helpers/types"

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

  const assetIds = useMemo(
    () =>
      asset?.isStableSwap && asset.meta ? Object.keys(asset.meta) : [assetId],
    [asset, assetId],
  )

  const { data: vDotApy } = useBifrostVDotApy({
    enabled: assetIds.includes(VDOT_ASSET_ID),
  })

  const totalAPR = useMemo(() => {
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
        ? incentivesAPRSum || 0
        : Infinity

    const suppliesAPY = underlyingReserves.map((reserve) => {
      const isVdot =
        reserve.underlyingAsset === getAddressFromAssetId(VDOT_ASSET_ID)

      const supplyAPY = isVdot
        ? BN(reserve.supplyAPY).plus(BN(vDotApy?.apy ?? 0).div(100))
        : BN(reserve.supplyAPY)
      return supplyAPY.div(underlyingReserves.length).toNumber()
    })

    const supplyAPYSum = suppliesAPY.reduce((a, b) => a + b, 0)
    return isIncentivesInfinity ? Infinity : supplyAPYSum + incentivesNetAPR
  }, [
    assetIds,
    assetReserve?.aIncentivesData,
    getErc20,
    reserves,
    vDotApy?.apy,
  ])

  return {
    riskLevel,
    tvl: assetReserve?.totalLiquidityUSD || "0",
    apr: totalAPR === Infinity ? Infinity : totalAPR * 100,
  }
}

export const useAssetReward = (assetId: string): Reward => {
  const { user } = useAppDataContext()
  const { getAssetWithFallback } = useAssets()
  const { getAssetPrice } = useAssetsPrice([assetId])
  const spotPrice = getAssetPrice(assetId).price || "0"
  const asset = getAssetWithFallback(assetId)

  const assetErc20Address = getAddressFromAssetId(assetId)
  const underlyingAssetIdLower = assetErc20Address.toLocaleLowerCase()

  return useMemo(() => {
    const [rewardTokenAddress, incentive] =
      Object.entries(user.calculatedUserIncentives).find(
        ([rewardTokenAddress]) =>
          rewardTokenAddress.toLocaleLowerCase() === underlyingAssetIdLower,
      ) ?? []

    if (!incentive || !rewardTokenAddress) {
      return {
        assets: [],
        incentiveControllerAddress: "",
        symbol: asset.symbol,
        balance: "0",
        balanceUsd: "0",
        rewardTokenAddress: assetErc20Address,
      }
    }

    const rewardBalance = normalize(
      incentive.claimableRewards,
      incentive.rewardTokenDecimals,
    )

    const rewardBalanceUsd = new BN(spotPrice)
      .times(rewardBalance || "0")
      .toString()

    return {
      assets: incentive.assets,
      incentiveControllerAddress: incentive.incentiveControllerAddress,
      symbol: incentive.rewardTokenSymbol,
      balance: rewardBalance,
      balanceUsd: rewardBalanceUsd.toString(),
      rewardTokenAddress,
    }
  }, [
    asset.symbol,
    assetErc20Address,
    spotPrice,
    underlyingAssetIdLower,
    user.calculatedUserIncentives,
  ])
}
