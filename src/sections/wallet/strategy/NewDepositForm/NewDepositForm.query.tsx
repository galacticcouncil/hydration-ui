import { TradeConfigCursor } from "@galacticcouncil/apps"
import { useQuery } from "@tanstack/react-query"
import BigNumber from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { GIGADOT_ASSET_ID } from "sections/wallet/strategy/strategy.mock"
import { QUERY_KEYS } from "utils/queryKeys"

const calculateSlippage = (amount: string, slippagePct: string): BigNumber => {
  const slippage = new BigNumber(amount).div(100).multipliedBy(slippagePct)

  return slippage.decimalPlaces(0, 1)
}

const getMinAmountOut = (amountOut: string, slippagePct: string): string => {
  const slippage = calculateSlippage(amountOut, slippagePct)

  return new BigNumber(amountOut).minus(slippage).toString()
}

export const useMinReceivedGigadot = (assetInId: string, amountIn: string) => {
  const { tradeRouter, isLoaded } = useRpcProvider()

  const { data: slippageData } = useQuery({
    queryKey: ["slippage"],
    queryFn: () => TradeConfigCursor.deref().slippage,
    enabled: isLoaded,
  })

  const { data } = useQuery({
    queryKey: QUERY_KEYS.bestTradeSell(assetInId, GIGADOT_ASSET_ID, amountIn),
    queryFn: () =>
      tradeRouter.getBestSell(assetInId, GIGADOT_ASSET_ID, amountIn),
    enabled: isLoaded && !!assetInId && !!amountIn,
  })

  return getMinAmountOut(data?.amountOut.toString() || "0", slippageData || "0")
}
