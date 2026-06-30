import Big from "big.js"
import { useMemo } from "react"
import { unique } from "remeda"

import {
  HYDRATION_OCN_URN,
  XcBalance,
  XcOcnUrn,
} from "@/modules/balances/api/xcBalanceTypes"
import {
  filterHydrationTableBalances,
  filterNonZeroBalances,
  resolveXcBalancePriceAssetId,
} from "@/modules/balances/api/xcBalanceUtils"
import { useAssetsPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"

export type BalancesTableRow = XcBalance & {
  readonly balanceHuman: string
  readonly balanceUsd: string
  readonly balanceUsdDisplay: string | undefined
}

export const useBalancesTableData = (
  chainId: XcOcnUrn,
  balances: XcBalance[],
) => {
  const isHydration = chainId === HYDRATION_OCN_URN

  const tableBalances = useMemo(() => {
    const nonZero = filterNonZeroBalances(balances)
    return isHydration ? filterHydrationTableBalances(nonZero) : nonZero
  }, [balances, isHydration])

  const priceAssetIds = useMemo(() => {
    if (!isHydration) return []

    return unique(
      tableBalances.map(
        (balance) =>
          resolveXcBalancePriceAssetId(chainId, balance.assetId) ??
          balance.assetId,
      ),
    )
  }, [tableBalances, chainId, isHydration])

  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(priceAssetIds)

  return useMemo(() => {
    let totalUsd = Big(0)

    const data = tableBalances.map((balance): BalancesTableRow => {
      const balanceHuman = scaleHuman(balance.balance, balance.decimals)

      if (!isHydration) {
        return {
          ...balance,
          balanceHuman,
          balanceUsd: "0",
          balanceUsdDisplay: undefined,
        }
      }

      const priceAssetId =
        resolveXcBalancePriceAssetId(chainId, balance.assetId) ??
        balance.assetId
      const { price, isValid } = getAssetPrice(priceAssetId)
      const balanceUsd =
        isValid && price ? Big(balanceHuman).times(price).toString() : "0"
      const balanceUsdDisplay =
        isValid && price && Big(balanceUsd).gt(0) ? balanceUsd : undefined

      if (balanceUsdDisplay) {
        totalUsd = totalUsd.plus(balanceUsd)
      }

      return {
        ...balance,
        balanceHuman,
        balanceUsd,
        balanceUsdDisplay,
      }
    })

    return {
      data,
      totalUsd: totalUsd.toString(),
      isPriceLoading: isHydration && isPriceLoading,
    }
  }, [tableBalances, chainId, getAssetPrice, isHydration, isPriceLoading])
}
