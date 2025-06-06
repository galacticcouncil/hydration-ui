import { InterestRate } from "@aave/contract-helpers"
import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { ComputedUserReserveData } from "@/hooks/commonTypes"

export const useBorrowedAssetsData = () => {
  const { user, loading } = useAppDataContext()

  const data = useMemo(() => {
    const borrowPositions =
      user?.userReservesData.reduce(
        (acc, userReserve) => {
          if (userReserve.variableBorrows !== "0") {
            acc.push({
              ...userReserve,
              borrowRateMode: InterestRate.Variable,
            })
          }
          if (userReserve.stableBorrows !== "0") {
            acc.push({
              ...userReserve,
              borrowRateMode: InterestRate.Stable,
            })
          }
          return acc
        },
        [] as (ComputedUserReserveData & { borrowRateMode: InterestRate })[],
      ) || []

    return borrowPositions.map((item) => {
      return {
        ...item,
        totalBorrows:
          item.borrowRateMode === InterestRate.Variable
            ? item.variableBorrows
            : item.stableBorrows,
        totalBorrowsUSD:
          item.borrowRateMode === InterestRate.Variable
            ? item.variableBorrowsUSD
            : item.stableBorrowsUSD,
        borrowAPY:
          item.borrowRateMode === InterestRate.Variable
            ? Number(item.reserve.variableBorrowAPY)
            : Number(item.stableBorrowAPY),
        incentives:
          item.borrowRateMode === InterestRate.Variable
            ? item.reserve.vIncentivesData
            : item.reserve.sIncentivesData,
      }
    })
  }, [user?.userReservesData])

  return {
    data,
    isLoading: loading,
  }
}
