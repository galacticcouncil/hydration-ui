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
import { useTradeSettings } from "@/states/tradeSettings"

export const useMarketBuyData = (
  form: UseFormReturn<MarketFormValues>,
): TradeProviderProps => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const [sellAsset, buyAsset, buyAmount] = form.watch([
    "sellAsset",
    "buyAsset",
    "buyAmount",
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
      bestBuyQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
        slippage: swapSlippage,
        address,
      }),
      healthFactorAfterSupplyQuery(rpc, {
        address,
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
        slippage: twapSlippage,
        maxRetries: twapMaxRetries,
        address: address,
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
