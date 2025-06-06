import Big from "big.js"
import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"

export const useAggregatedMarketStats = () => {
  const { reserves, loading } = useAppDataContext()

  const data = useMemo(() => {
    const stats = reserves.reduce(
      (acc, reserve) => {
        return {
          totalLiquidity: Big(acc.totalLiquidity)
            .plus(reserve.totalLiquidityUSD)
            .toString(),
          totalDebt: Big(acc.totalDebt).plus(reserve.totalDebtUSD).toString(),
        }
      },
      {
        totalLiquidity: "0",
        totalDebt: "0",
      },
    )

    return {
      ...stats,
      totalAvailable: Big(stats.totalLiquidity)
        .minus(stats.totalDebt)
        .toString(),
    }
  }, [reserves])

  return {
    data,
    isLoading: loading,
  }
}
