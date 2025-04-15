import { TradeConfigCursor } from "@galacticcouncil/apps"
import { useQuery } from "@tanstack/react-query"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { QUERY_KEYS } from "utils/queryKeys"

const calculateSlippage = (amount: string, slippagePct: string): string => {
  const slippage = BN(amount).div(100).multipliedBy(slippagePct)

  return slippage.decimalPlaces(0, 1).toString()
}

const getMinAmountOut = (amountOut: string, slippagePct: string): string => {
  const slippage = calculateSlippage(amountOut, slippagePct)

  return BN(amountOut).minus(slippage).toString()
}

export const useBestTradeSell = (
  assetInId: string,
  assetOutId: string,
  amountIn: string,
) => {
  const { api, tradeRouter, isLoaded } = useRpcProvider()

  const slippageData = TradeConfigCursor.deref().slippage

  const { data: tradeData, isInitialLoading } = useQuery({
    queryKey: QUERY_KEYS.bestTradeSell(assetInId, assetOutId, amountIn),
    queryFn: () => tradeRouter.getBestSell(assetInId, assetOutId, amountIn),
    enabled: isLoaded && !!assetInId && !!assetOutId && !!amountIn,
  })

  const amountOut = tradeData?.amountOut.toString() || "0"
  const minAmountOut = getMinAmountOut(amountOut, slippageData || "0")

  const swapTx = useMemo(
    () =>
      tradeData ? api.tx(tradeData.toTx(BN(minAmountOut)).hex) : undefined,
    [api, minAmountOut, tradeData],
  )

  return { minAmountOut, swapTx, amountOut, isLoading: isInitialLoading }
}
