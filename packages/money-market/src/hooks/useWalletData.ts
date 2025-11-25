import { InterestRate } from "@aave/contract-helpers"
import Big from "big.js"

import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "@/hooks/app-data-provider/useWalletBalances"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { useReserveActionState } from "@/hooks/useReserveActionState"
import { useRootStore } from "@/store/root"
import { amountToUsd } from "@/utils"
import {
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from "@/utils/getMaxAmountAvailableToBorrow"
import { getMaxAmountAvailableToSupply } from "@/utils/getMaxAmountAvailableToSupply"

export const useWalletData = (reserve: ComputedReserveData) => {
  const currentMarket = useRootStore((store) => store.currentMarket)

  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const {
    ghoReserveData,
    user,
    loading: loadingReserves,
    marketReferencePriceInUsd,
  } = useAppDataContext()
  const { walletBalances, loading: loadingWalletBalance } =
    useWalletBalances(currentMarketData)

  const [minRemainingBaseTokenBalance, displayGho] = useRootStore((store) => [
    store.poolComputed.minRemainingBaseTokenBalance,
    store.displayGho,
  ])
  const balance = walletBalances[reserve.underlyingAsset]

  let maxAmountToBorrow = "0"
  let maxAmountToSupply = "0"
  const isGho = displayGho({ symbol: reserve.symbol, currentMarket })

  if (isGho) {
    const maxMintAmount = getMaxGhoMintAmount(user, reserve)
    maxAmountToBorrow = Big.min(
      maxMintAmount,
      ghoReserveData.aaveFacilitatorRemainingCapacity,
    ).toString()
    maxAmountToSupply = "0"
  } else {
    maxAmountToBorrow = getMaxAmountAvailableToBorrow(
      reserve,
      user,
      InterestRate.Variable,
    ).toString()

    maxAmountToSupply = getMaxAmountAvailableToSupply(
      balance?.amount || "0",
      reserve,
      reserve.underlyingAsset,
      minRemainingBaseTokenBalance,
    ).toString()
  }

  const maxAmountToBorrowUsd = amountToUsd(
    maxAmountToBorrow,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString()

  const maxAmountToSupplyUsd = amountToUsd(
    maxAmountToSupply,
    reserve.formattedPriceInMarketReferenceCurrency,
    marketReferencePriceInUsd,
  ).toString()

  const { disableSupplyButton, disableBorrowButton, alerts } =
    useReserveActionState({
      balance: balance?.amount || "0",
      maxAmountToSupply: maxAmountToSupply.toString(),
      maxAmountToBorrow: maxAmountToBorrow.toString(),
      reserve,
    })

  return {
    balance,
    maxAmountToBorrowUsd,
    maxAmountToSupplyUsd,
    maxAmountToBorrow,
    maxAmountToSupply,
    disableSupplyButton,
    disableBorrowButton,
    alerts,
    isLoading: loadingReserves || loadingWalletBalance,
  }
}
