import { TradeRouter } from "@galacticcouncil/sdk"
import BigNumber from "bignumber.js"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useTradeRouter } from "utils/api"

export const useBestBuy = (props: BestTradeProps) => {
  const tradeRouter = useTradeRouter()

  return useQuery(QUERY_KEYS.bestBuy(props), getBestBuy(tradeRouter, props))
}

export const useBestSell = (props: BestTradeProps) => {
  const tradeRouter = useTradeRouter()

  return useQuery(QUERY_KEYS.bestSell(props), getBestSell(tradeRouter, props))
}

export const getBestBuy =
  (tradeRouter: TradeRouter, { tokenIn, tokenOut, amount }: BestTradeProps) =>
  async () => {
    return tradeRouter.getBestBuy(tokenIn, tokenOut, amount)
  }

export const getBestSell =
  (tradeRouter: TradeRouter, { tokenIn, tokenOut, amount }: BestTradeProps) =>
  async () => {
    return tradeRouter.getBestSell(tokenIn, tokenOut, amount)
  }

type BestTradeProps = { tokenIn: string; tokenOut: string; amount: BigNumber }
