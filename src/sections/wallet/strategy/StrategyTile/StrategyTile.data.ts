import { getAddressFromAssetId } from "utils/evm"
import {
  formatUserSummaryAndIncentives,
  normalize,
  UserIncentiveData,
} from "@aave/math-utils"
import { useAssets } from "providers/assets"
import BN from "bignumber.js"
import { useAssetsPrice } from "state/displayPrice"
import {
  useBorrowIncentives,
  useBorrowReserves,
  useBorrowUserIncentives,
  useBorrowUserReserves,
} from "api/borrow"
import { GDOT_ERC20_ASSET_ID } from "utils/constants"
import { useCurrentTimestamp } from "sections/lending/hooks/useCurrentTimestamp"

export type StrategyRiskLevel = "low" | "medium" | "high"

export type AssetOverviewData = {
  readonly tvl: string
  readonly apr: number
}

export const useUserRewards = (assetIds: string[]) => {
  const { getAssetWithFallback } = useAssets()
  const { data: user } = useBorrowUserReserves()
  const { data: reserves } = useBorrowReserves()
  const { data: reserveIncentives } = useBorrowIncentives()
  const { data: userIncentives } = useBorrowUserIncentives()

  const { getAssetPrice } = useAssetsPrice([GDOT_ERC20_ASSET_ID])
  const spotPrice = getAssetPrice(GDOT_ERC20_ASSET_ID).price || "0"

  const currentTimestamp = useCurrentTimestamp(100)
  const gdotIncentiveAddress = getAddressFromAssetId(GDOT_ERC20_ASSET_ID)
  const gdotMeta = getAssetWithFallback(GDOT_ERC20_ASSET_ID)

  const defaultResult = {
    assets: [],
    incentiveControllerAddress: "",
    symbol: gdotMeta.symbol,
    balance: "0",
    balanceUsd: "0",
    rewardTokenAddress: gdotIncentiveAddress,
  }

  if (!user || !reserves || !reserveIncentives || !userIncentives)
    return defaultResult

  const { baseCurrencyData, formattedReserves } = reserves
  const { userEmodeCategoryId, userReserves } = user

  const assets = assetIds.map((assetId) => {
    const id = assetId.toLowerCase()
    const address = getAddressFromAssetId(id)

    return {
      assetId: id,
      reserve: formattedReserves.find(
        (r) => r.underlyingAsset.toLowerCase() === address,
      ),
      reserveIncentive: reserveIncentives.find(
        (i) => i.underlyingAsset.toLowerCase() === address,
      ),
      userIncentive: userIncentives.find(
        (i) => i.underlyingAsset.toLowerCase() === address,
      ),
      userReserve: userReserves.find(
        (r) => r.underlyingAsset.toLowerCase() === address,
      ),
    }
  })

  let totalIncentive: UserIncentiveData | undefined

  for (const {
    reserve,
    reserveIncentive,
    userIncentive,
    userReserve,
  } of assets) {
    if (!reserve || !reserveIncentive || !userIncentive || !userReserve)
      continue

    const summary = formatUserSummaryAndIncentives({
      currentTimestamp,
      marketReferencePriceInUsd:
        reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      marketReferenceCurrencyDecimals:
        baseCurrencyData.marketReferenceCurrencyDecimals,
      userEmodeCategoryId,
      userReserves: [userReserve],
      formattedReserves: [reserve],
      reserveIncentives: [reserveIncentive],
      userIncentives: [userIncentive],
    })

    const incentive = summary.calculatedUserIncentives[gdotIncentiveAddress]

    if (incentive) {
      totalIncentive = {
        ...incentive,
        assets: [...incentive.assets, ...(totalIncentive?.assets ?? [])],
        claimableRewards: incentive.claimableRewards.plus(
          totalIncentive?.claimableRewards ?? 0,
        ),
      }
    }
  }

  if (!totalIncentive) return defaultResult

  const rewardBalance = normalize(
    totalIncentive.claimableRewards,
    totalIncentive.rewardTokenDecimals,
  )

  const rewardBalanceUsd = new BN(spotPrice)
    .times(rewardBalance || "0")
    .toString()

  return {
    assets: totalIncentive.assets,
    incentiveControllerAddress: totalIncentive.incentiveControllerAddress,
    symbol: totalIncentive.rewardTokenSymbol,
    balance: rewardBalance,
    balanceUsd: rewardBalanceUsd.toString(),
    rewardTokenAddress: gdotIncentiveAddress,
  }
}
