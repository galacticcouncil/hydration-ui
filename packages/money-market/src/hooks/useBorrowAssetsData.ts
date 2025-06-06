import { InterestRate } from "@aave/contract-helpers"
import { FormattedGhoReserveData, USD_DECIMALS } from "@aave/math-utils"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { ComputedReserveData, ExtendedFormattedUser } from "@/hooks/commonTypes"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"
import { useRootStore } from "@/store/root"
import { DashboardReserve } from "@/utils"
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from "@/utils/getMaxAmountAvailableToBorrow"

export const useBorrowAssetsData = () => {
  const { currentMarket } = useProtocolDataContext()
  const { user, reserves, marketReferencePriceInUsd, ghoReserveData, loading } =
    useAppDataContext()
  const displayGho = useRootStore((store) => store.displayGho)
  const account = useRootStore((store) => store.account)

  const sortedReserves = useMemo(() => {
    const tokensToBorrow = reserves
      .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
      .map((reserve: ComputedReserveData) => {
        const isGho = displayGho({ symbol: reserve.symbol, currentMarket })
        const availableBorrows = account
          ? getAvailableBorrows(user, reserve, isGho ? ghoReserveData : null)
          : 0

        const availableBorrowsInUSD = bigShift(
          Big(availableBorrows)
            .mul(reserve.formattedPriceInMarketReferenceCurrency)
            .mul(marketReferencePriceInUsd),
          -USD_DECIMALS,
        ).toString()

        return {
          ...reserve,
          reserve,
          totalBorrows: reserve.totalDebt,
          availableBorrows,
          availableBorrowsInUSD,
          stableBorrowRate:
            reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
              ? Number(reserve.stableBorrowAPY)
              : -1,
          variableBorrowRate: reserve.borrowingEnabled
            ? Number(reserve.variableBorrowAPY)
            : -1,
        }
      })

    const maxBorrowAmount = Big(
      user?.totalBorrowsMarketReferenceCurrency || "0",
    ).plus(user?.availableBorrowsMarketReferenceCurrency || "0")

    const collateralUsagePercent = maxBorrowAmount.eq(0)
      ? "0"
      : Big(user?.totalBorrowsMarketReferenceCurrency || "0")
          .div(maxBorrowAmount)
          .toString()

    const borrowReserves =
      !account ||
      user?.totalCollateralMarketReferenceCurrency === "0" ||
      +collateralUsagePercent >= 0.98
        ? tokensToBorrow
        : tokensToBorrow.filter(
            ({ availableBorrowsInUSD, totalLiquidityUSD, symbol }) => {
              if (displayGho({ symbol, currentMarket })) {
                return true
              }

              return (
                availableBorrowsInUSD !== "0.00" && totalLiquidityUSD !== "0"
              )
            },
          )

    return borrowReserves as unknown as DashboardReserve[]
  }, [
    account,
    currentMarket,
    displayGho,
    ghoReserveData,
    marketReferencePriceInUsd,
    reserves,
    user,
  ])

  return {
    data: sortedReserves,
    isLoading: loading,
  }
}

const getAvailableBorrows = (
  user: ExtendedFormattedUser,
  reserve: ComputedReserveData,
  ghoReserveData: FormattedGhoReserveData | null,
) => {
  return ghoReserveData
    ? Math.min(
        Number(getMaxGhoMintAmount(user, reserve)),
        ghoReserveData.aaveFacilitatorRemainingCapacity,
      )
    : Number(
        getMaxAmountAvailableToBorrow(reserve, user, InterestRate.Variable),
      )
}
