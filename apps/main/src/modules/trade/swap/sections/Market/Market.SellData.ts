import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"
import { useDebounce } from "use-debounce"

import { healthFactorQuery } from "@/api/aave"
import { bestSellQuery, bestSellTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useMarketSellData = (
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
      bestSellQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: debouncedSellAmount,
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

  const { data: twap, isLoading: isTwapLoading } = useQuery(
    bestSellTwapQuery(
      rpc,
      {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: debouncedSellAmount,
      },
      isTwapEnabled(swap),
    ),
  )

  return {
    swap,
    twap,
    healthFactor: healthFactorData,
    isSwapLoading,
    isTwapLoading,
    isHealthFactorLoading,
  }
}
