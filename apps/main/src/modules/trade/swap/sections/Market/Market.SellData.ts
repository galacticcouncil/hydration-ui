import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorAfterWithdrawQuery } from "@/api/aave"
import { bestSellQuery, bestSellTwapQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { isErc20AToken } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

export const useMarketSellData = (
  form: UseFormReturn<MarketFormValues>,
): TradeProviderProps => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const [sellAsset, buyAsset, sellAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])

  const {
    swap: {
      single: { swapSlippage },
      split: { twapSlippage, twapMaxRetries },
    },
  } = useTradeSettings()

  const [
    { data: swapData, isLoading: isSwapLoading },
    { data: healthFactorData, isLoading: isHealthFactorLoading },
  ] = useQueries({
    queries: [
      bestSellQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: sellAmount,
        slippage: swapSlippage,
        address,
      }),
      healthFactorAfterWithdrawQuery(rpc, {
        address,
        assetId:
          sellAsset && isErc20AToken(sellAsset)
            ? sellAsset.underlyingAssetId
            : "",
        amount: sellAmount,
      }),
    ],
  })

  const { data: twapData, isLoading: isTwapLoading } = useQuery(
    bestSellTwapQuery(
      rpc,
      {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountIn: sellAmount,
        slippage: twapSlippage,
        maxRetries: twapMaxRetries,
        address,
      },
      isTwapEnabled(swapData?.swap),
    ),
  )

  return {
    swap: swapData?.swap,
    swapTx: swapData?.tx ?? null,
    twap: twapData?.twap,
    twapTx: twapData?.tx ?? null,
    healthFactor: healthFactorData,
    isLoading: isSwapLoading || isTwapLoading || isHealthFactorLoading,
  }
}
