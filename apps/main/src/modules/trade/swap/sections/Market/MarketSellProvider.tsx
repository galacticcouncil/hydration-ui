import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries } from "@tanstack/react-query"
import { FC } from "react"
import { useFormContext } from "react-hook-form"

import { healthFactorAfterWithdrawQuery } from "@/api/aave"
import { bestSellQuery, bestSellTwapQuery } from "@/api/trade"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { isErc20AToken } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const MarketSellProvider: FC<TradeProviderProps> = ({ children }) => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const form = useFormContext<MarketFormValues>()

  const [sellAsset, buyAsset, sellAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const [
    { data: swapData, isLoading: isSwapLoading },
    { data: twapData, isLoading: isTwapLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      bestSellQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: sellAmount,
      }),
      bestSellTwapQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: sellAmount,
      }),
      healthFactorAfterWithdrawQuery(rpc, {
        address: account?.address ?? "",
        assetId:
          sellAsset && isErc20AToken(sellAsset)
            ? sellAsset.underlyingAssetId
            : "",
        amount: sellAmount,
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
