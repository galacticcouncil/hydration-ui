import { getAddressFromAssetId } from "utils/evm"
import { normalize } from "@aave/math-utils"
import { useAssets } from "providers/assets"
import BN from "bignumber.js"
import { useMemo } from "react"
import { useAssetsPrice } from "state/displayPrice"
import { Reward } from "sections/lending/helpers/types"
import { useUserBorrowSummary } from "api/borrow"

export type StrategyRiskLevel = "low" | "medium" | "high"

export type AssetOverviewData = {
  readonly tvl: string
  readonly apr: number
}

export const useAssetReward = (assetId: string): Reward => {
  const { data: user } = useUserBorrowSummary()
  const { getAssetWithFallback } = useAssets()
  const { getAssetPrice } = useAssetsPrice([assetId])
  const spotPrice = getAssetPrice(assetId).price || "0"
  const asset = getAssetWithFallback(assetId)

  const assetErc20Address = getAddressFromAssetId(assetId)
  const underlyingAssetIdLower = assetErc20Address.toLocaleLowerCase()

  return useMemo(() => {
    const defaultResult = {
      assets: [],
      incentiveControllerAddress: "",
      symbol: asset.symbol,
      balance: "0",
      balanceUsd: "0",
      rewardTokenAddress: assetErc20Address,
    }

    if (!user) return defaultResult

    const [rewardTokenAddress, incentive] =
      Object.entries(user.calculatedUserIncentives).find(
        ([rewardTokenAddress]) =>
          rewardTokenAddress.toLocaleLowerCase() === underlyingAssetIdLower,
      ) ?? []

    if (!incentive || !rewardTokenAddress) {
      return defaultResult
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
  }, [asset.symbol, assetErc20Address, spotPrice, underlyingAssetIdLower, user])
}
