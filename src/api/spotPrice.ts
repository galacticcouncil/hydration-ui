import { useQueries, useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { TradeRouter } from "@galacticcouncil/sdk"
import { BN_1, BN_10, BN_NAN } from "utils/constants"
import BN from "bignumber.js"
import { useTradeRouter } from "utils/api"
import { Maybe, undefinedNoop } from "utils/helpers"

export const useSpotPrice = (
  assetA: Maybe<u32 | string>,
  assetB: Maybe<u32 | string>,
) => {
  const tradeRouter = useTradeRouter()
  const tokenIn = assetA?.toString() ?? ""
  const tokenOut = assetB?.toString() ?? ""

  return useQuery(
    QUERY_KEYS.spotPrice(tokenIn, tokenOut),
    !!tradeRouter
      ? getSpotPrice(tradeRouter, tokenIn, tokenOut)
      : undefinedNoop,
    { enabled: !!tradeRouter && !!tokenIn && !!tokenOut },
  )
}

export const useSpotPrices = (
  assetsIn: Maybe<u32 | string>[],
  assetOut: Maybe<u32 | string>,
) => {
  const tradeRouter = useTradeRouter()

  const assets = assetsIn
    .filter((a): a is u32 | string => !!a)
    .map((a) => a.toString())
  const tokenOut = assetOut?.toString() ?? ""

  return useQueries({
    queries: assets.map((tokenIn) => ({
      queryKey: QUERY_KEYS.spotPrice(tokenIn, tokenOut),
      queryFn: !!tradeRouter
        ? getSpotPrice(tradeRouter, tokenIn, tokenOut)
        : undefinedNoop,
      enabled: !!tradeRouter && !!tokenIn && !!tokenOut,
    })),
  })
}

export const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () => {
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut) return { tokenIn, tokenOut, spotPrice: BN_1 }

    // error replies are valid in case token has no spot price
    let spotPrice = BN_NAN
    try {
      const res = await tradeRouter.getBestSpotPrice(tokenIn, tokenOut)
      spotPrice = res.amount.div(BN_10.pow(res.decimals))
    } catch (e) {}

    return { tokenIn, tokenOut, spotPrice }
  }

export type SpotPrice = {
  tokenIn: string
  tokenOut: string
  spotPrice: BN
}
