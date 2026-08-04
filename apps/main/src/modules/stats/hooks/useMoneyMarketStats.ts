import { useMemo } from "react"

import { useBorrowReserves } from "@/api/borrow"

export const useMoneyMarketStats = () => {
  const { data: borrowReserves, isLoading } = useBorrowReserves()

  const stats = useMemo(() => {
    if (!borrowReserves)
      return {
        borrowTvl: 0,
        totalBorrows: 0,
        borrowUtilization: 0,
      }

    const { borrowTvl, totalBorrows } = borrowReserves.formattedReserves.reduce(
      (acc, r) => ({
        borrowTvl: acc.borrowTvl + parseFloat(r.totalLiquidityUSD),
        totalBorrows: acc.totalBorrows + parseFloat(r.totalDebtUSD),
      }),
      { borrowTvl: 0, totalBorrows: 0 },
    )

    const borrowUtilization = (totalBorrows / borrowTvl) * 100

    return {
      borrowTvl,
      totalBorrows,
      borrowUtilization,
    }
  }, [borrowReserves])

  return {
    stats,
    isLoading,
  }
}
