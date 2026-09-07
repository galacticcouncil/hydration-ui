import { useAccount } from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"
import { useDebounce } from "use-debounce"

import { healthFactorQuery } from "@/api/aave"
import { bestBuyQuery, bestSellTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useMarketBuyData = (
  form: UseFormReturn<MarketFormValues>,
): TradeProviderProps => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const [sellAsset, sellAmount, buyAsset, buyAmount] = form.watch([
    "sellAsset",
    "sellAmount",
    "buyAsset",
    "buyAmount",
  ])

  const [debouncedSellAmount] = useDebounce(sellAmount, 300)
  const [debouncedBuyAmount] = useDebounce(buyAmount, 300)

  const [
    { data: swap, isLoading: isSwapLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      bestBuyQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: debouncedBuyAmount,
        debug: true,
      }),
      healthFactorQuery(rpc, {
        fromAsset: sellAsset,
        fromAmount: debouncedSellAmount,
        toAsset: buyAsset,
        toAmount: debouncedBuyAmount,
        address,
      }),
    ],
  })

  // The chain no longer accepts buy schedules, so a buy intent is scheduled as
  // a sell of what the buy quote says it costs
  const twapBudget =
    swap && sellAsset ? scaleHuman(swap.amountIn, sellAsset.decimals) : ""

  const twapEnabled = isTwapEnabled(swap)

  const {
    data: twap,
    isLoading: isTwapLoading,
    isPlaceholderData: isTwapPlaceholderData,
  } = useQuery({
    ...bestSellTwapQuery(
      rpc,
      {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: twapBudget,
      },
      twapEnabled,
    ),
    // The budget is part of the query key, so every quote move would otherwise
    // drop the order back to a skeleton. Without a budget there is nothing to
    // hold on to, so the form collapses as it did before.
    placeholderData: twapBudget ? keepPreviousData : undefined,
  })

  const isTwapPreviousData = twapEnabled && isTwapPlaceholderData
  const isTwapQueryLoading = isTwapLoading || isTwapPreviousData

  const isTwapValid =
    !!twap &&
    String(twap.assetIn) === sellAsset?.id &&
    String(twap.assetOut) === buyAsset?.id

  return {
    swap,
    twap: isTwapValid ? twap : undefined,
    healthFactor: healthFactorData,
    isSwapLoading,
    // The order query only starts once the quote it is budgeted from resolves
    isTwapLoading: isSwapLoading || isTwapQueryLoading,
    isHealthFactorLoading,
  }
}
