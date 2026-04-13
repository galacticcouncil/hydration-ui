import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorQuery } from "@/api/aave"
import { bestBuyQuery, bestBuyTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"

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

  const [
    { data: swap, isLoading: isSwapLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      bestBuyQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
        debug: true,
      }),
      healthFactorQuery(rpc, {
        fromAsset: sellAsset,
        fromAmount: sellAmount,
        toAsset: buyAsset,
        toAmount: buyAmount,
        address,
      }),
    ],
  })

  const { data: twap, isLoading: isTwapLoading } = useQuery(
    bestBuyTwapQuery(
      rpc,
      {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
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
