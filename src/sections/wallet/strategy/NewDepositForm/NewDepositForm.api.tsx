import { TradeConfigCursor } from "@galacticcouncil/apps"
import { useMutation, useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { useStore } from "state/store"
import { QUERY_KEYS } from "utils/queryKeys"

const calculateSlippage = (amount: string, slippagePct: string): string => {
  const slippage = new BigNumber(amount).div(100).multipliedBy(slippagePct)

  return slippage.decimalPlaces(0, 1).toString()
}

const getMinAmountOut = (amountOut: string, slippagePct: string): string => {
  const slippage = calculateSlippage(amountOut, slippagePct)

  return new BigNumber(amountOut).minus(slippage).toString()
}

export const useBestTrade = (
  assetInId: string,
  assetOutId: string,
  amountIn: string,
) => {
  const { api, tradeRouter, isLoaded } = useRpcProvider()
  const { createTransaction } = useStore()

  const { data: slippageData } = useQuery({
    queryKey: QUERY_KEYS.tradeSlippage,
    queryFn: () => TradeConfigCursor.deref().slippage,
    enabled: isLoaded,
  })

  const { data: tradeData } = useQuery({
    queryKey: QUERY_KEYS.bestTradeSell(assetInId, assetOutId, amountIn),
    queryFn: () => tradeRouter.getBestSell(assetInId, assetOutId, amountIn),
    enabled: isLoaded && !!assetInId && !!assetOutId && !!amountIn,
  })

  const amountOut = tradeData?.amountOut.toString() || "0"
  const minAmountOut = getMinAmountOut(amountOut, slippageData || "0")

  const swapMutation = useMutation(async () => {
    if (!tradeData) {
      return
    }

    const tx = tradeData.toTx(new BigNumber(minAmountOut))

    return createTransaction({
      tx: api.tx(tx.hex),
    })
  })

  return [minAmountOut, swapMutation, amountOut] as const
}
