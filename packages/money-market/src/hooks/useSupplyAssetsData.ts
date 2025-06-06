import { USD_DECIMALS } from "@aave/math-utils"
import { bigMin, bigShift } from "@galacticcouncil/utils"
import { Big } from "big.js"
import { useMemo } from "react"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "@/hooks/app-data-provider/useWalletBalances"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"
import { useRootStore } from "@/store/root"
import { MONEY_MARKET_SUPPLY_BLACKLIST } from "@/ui-config/misc"
import { DashboardReserve } from "@/utils/dashboard"

export const useSupplyAssetsData = ({ showAll }: { showAll: boolean }) => {
  const displayGho = useRootStore((store) => store.displayGho)
  const { currentMarket, currentMarketData } = useProtocolDataContext()
  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext()
  const { walletBalances, loading } = useWalletBalances(currentMarketData)

  const data = useMemo(() => {
    const tokensToSupply = reserves
      .filter(
        (reserve: ComputedReserveData) =>
          !MONEY_MARKET_SUPPLY_BLACKLIST.includes(reserve.underlyingAsset) &&
          !displayGho({ currentMarket, symbol: reserve.symbol }) &&
          !(reserve.isFrozen || reserve.isPaused),
      )
      .map((reserve: ComputedReserveData) => {
        const walletBalance =
          walletBalances[reserve.underlyingAsset]?.amount ?? "0"
        const walletBalanceUSD =
          walletBalances[reserve.underlyingAsset]?.amountUSD ?? "0"
        let availableToDeposit = Big(walletBalance).toString()
        if (reserve.supplyCap !== "0") {
          availableToDeposit =
            availableToDeposit === "NaN"
              ? "0"
              : bigMin(
                  availableToDeposit.toString(),
                  Big(reserve.supplyCap)
                    .minus(reserve.totalLiquidity)
                    .mul("0.995")
                    .toString(),
                ).toString()
        }
        const availableToDepositUSD = bigShift(
          Big(availableToDeposit)
            .mul(reserve.priceInMarketReferenceCurrency)
            .mul(marketReferencePriceInUsd),
          -USD_DECIMALS,
        ).toString()

        const isIsolated = reserve.isIsolated
        const hasDifferentCollateral = user?.userReservesData.find(
          (userRes) =>
            userRes.usageAsCollateralEnabledOnUser &&
            userRes.reserve.id !== reserve.id,
        )

        const usageAsCollateralEnabledOnUser = !user?.isInIsolationMode
          ? reserve.reserveLiquidationThreshold !== "0" &&
            (!isIsolated || (isIsolated && !hasDifferentCollateral))
          : !isIsolated
            ? false
            : !hasDifferentCollateral

        return {
          ...reserve,
          reserve,
          walletBalance,
          walletBalanceUSD,
          availableToDeposit:
            +availableToDeposit <= 0 ? "0" : availableToDeposit.toString(),
          availableToDepositUSD:
            Number(availableToDepositUSD) <= 0
              ? "0"
              : availableToDepositUSD.toString(),
          usageAsCollateralEnabledOnUser,
          detailsAddress: reserve.underlyingAsset,
        }
      })
      .flat()

    const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
      +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1,
    )
    const filteredSupplyReserves = sortedSupplyReserves.filter(
      (reserve) => reserve.availableToDepositUSD !== "0",
    )

    // Filter out reserves
    const supplyReserves: unknown = showAll
      ? sortedSupplyReserves
      : filteredSupplyReserves.length >= 1
        ? filteredSupplyReserves
        : sortedSupplyReserves

    return supplyReserves as DashboardReserve[]
  }, [
    currentMarket,
    displayGho,
    marketReferencePriceInUsd,
    reserves,
    showAll,
    user?.isInIsolationMode,
    user?.userReservesData,
    walletBalances,
  ])

  const isLoading = loadingReserves || loading

  return {
    data,
    isLoading,
  }
}
