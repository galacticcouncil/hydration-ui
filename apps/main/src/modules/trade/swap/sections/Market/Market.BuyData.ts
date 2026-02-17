import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueries, useQuery } from "@tanstack/react-query"
import { UseFormReturn } from "react-hook-form"

import { healthFactorQuery } from "@/api/aave"
import { bestBuyTwapWithTxQuery, bestBuyWithTxQuery } from "@/api/trade"
import { isTwapEnabled } from "@/modules/trade/swap/sections/Market/lib/isTwapEnabled"
import { TradeProviderProps } from "@/modules/trade/swap/sections/Market/lib/tradeProvider"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"

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
      bestBuyWithTxQuery(rpc, {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
        slippage: swapSlippage,
        address,
        dryRun: form.formState.isValid,
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

  const { data: twapData, isLoading: isTwapLoading } = useQuery(
    bestBuyTwapWithTxQuery(
      rpc,
      {
        assetIn: sellAsset?.id ?? "",
        assetOut: buyAsset?.id ?? "",
        amountOut: buyAmount,
        slippage: twapSlippage,
        maxRetries: twapMaxRetries,
        address,
        dryRun: form.formState.isValid,
      },
      isTwapEnabled(swapData?.swap),
    ),
  )

  return {
    swap: swapData?.swap,
    swapTx: swapData?.tx ?? null,
    swapDryRunError: swapData?.dryRunError ?? null,
    twap: twapData?.twap,
    twapTx: twapData?.tx ?? null,
    twapDryRunError: twapData?.dryRunError ?? null,
    healthFactor: healthFactorData,
    isSwapLoading,
    isTwapLoading,
    isHealthFactorLoading,
  }
}
