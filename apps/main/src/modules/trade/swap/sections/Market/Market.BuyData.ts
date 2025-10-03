import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorAfterSupplyQuery } from "@/api/aave"
import { bestBuyQuery, bestBuyTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { isErc20AToken } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useMarketBuyData = (
  form: UseFormReturn<MarketFormValues>,
): TradeProviderProps => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  const [sellAsset, buyAsset, buyAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "buyAmount",
  ])

  const [
    { data: swapData, isLoading: isSwapLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      bestBuyQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
      }),
      healthFactorAfterSupplyQuery(rpc, {
        address: account?.address ?? "",
        assetId:
          buyAsset && isErc20AToken(buyAsset) ? buyAsset.underlyingAssetId : "",
        amount: buyAmount,
      }),
    ],
  })

  const { data: twapData, isLoading: isTwapLoading } = useQuery(
    bestBuyTwapQuery(
      rpc,
      {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
      },
      isTwapEnabled(swapData),
    ),
  )

  return {
    swap: swapData,
    twap: twapData,
    healthFactor: healthFactorData,
    isLoading: isSwapLoading || isTwapLoading || isHealthFactorLoading,
  }
}
