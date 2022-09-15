import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { useTradeRouter } from "utils/sdk"
import { TradeRouter } from "@galacticcouncil/sdk"
import { Maybe } from "utils/types"

export const useSpotPrice = (
  assetA: Maybe<u32 | string>,
  assetB: Maybe<u32 | string>,
) => {
  const tradeRouter = useTradeRouter()
  const tokenIn = assetA?.toString() ?? ""
  const tokenOut = assetB?.toString() ?? ""

  return useQuery(
    QUERY_KEYS.spotPrice(tokenIn, tokenOut),
    getSpotPrice(tradeRouter, tokenIn, tokenOut),
    { enabled: !!tokenIn && !!tokenOut },
  )
}

export const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () =>
    tradeRouter.getBestSpotPrice(tokenIn, tokenOut)
