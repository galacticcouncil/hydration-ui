import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { healthFactorAfterSupplyQuery } from "@/api/aave"
import { bestBuyQuery, bestBuyTwapQuery } from "@/api/trade"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { isErc20AToken } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const MarketBuyProvider: FC<TradeProviderProps> = ({ children }) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const form = useFormContext<MarketFormValues>()

  const [sellAsset, buyAsset, buyAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "buyAmount",
  ])

  const [
    { data: swapData, isLoading: isSwapLoading },
    { data: twapData, isLoading: isTwapLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      bestBuyQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
      }),
      bestBuyTwapQuery(rpc, {
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

  return children({
    swap: swapData,
    twap: twapData,
    healthFactor: healthFactorData,
    isLoading: isSwapLoading || isTwapLoading || isHealthFactorLoading,
  })
}
