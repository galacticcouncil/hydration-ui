import { TradeRouter } from "@galacticcouncil/sdk"
import {
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import Big from "big.js"
import { isNullish, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import {
  useDisplayAssetStore,
  useDisplaySpotPriceStore,
} from "@/states/displayAsset"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

export const usePriceSubscriber = () => {
  const { isApiLoaded, tradeRouter } = useRpcProvider()
  const queryClient = useQueryClient()
  const setAssets = useDisplaySpotPriceStore(prop("setAssets"))
  const stableCoinId = useDisplayAssetStore(prop("stableCoinId"))

  return useQuery({
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "displayPrices", stableCoinId],
    queryFn: async () => {
      const activeAssetsIds = queryClient
        .getQueriesData({
          queryKey: ["spotPriceKey"],
          type: "active",
        })
        .reduce<string[]>((acc, [key, data]) => {
          if (data) acc.push(key[1] as string)

          return acc
        }, [])

      const prices = await Promise.all(
        activeAssetsIds.map((assetId) =>
          getSpotPrice(tradeRouter, assetId, stableCoinId ?? "")(),
        ),
      )

      const storeData = prices.map((price) => ({
        id: price.tokenIn,
        price: price.spotPrice,
      }))

      setAssets(storeData)

      return null
    },
    enabled: isApiLoaded && !isNullish(stableCoinId),
    notifyOnChangeProps: [],
    staleTime: 10000,
  })
}

export const spotPrice = (
  context: TProviderContext,
  assetIn: string,
  assetOut: string,
) => {
  const { isApiLoaded, tradeRouter } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "spotPrice", assetIn, assetOut],
    queryFn: async () => {
      const spotPrice = await getSpotPrice(tradeRouter, assetIn, assetOut)()

      return spotPrice
    },
  })
}

export const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () => {
    const tokenInParam = tokenIn
    const tokenOutParam = tokenOut
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut || tokenInParam === tokenOutParam)
      return { tokenIn, tokenOut, spotPrice: "1" }

    // error replies are valid in case token has no spot price
    let spotPrice: string | null = null

    try {
      const res = await tradeRouter.getBestSpotPrice(
        tokenInParam,
        tokenOutParam,
      )

      if (res) {
        spotPrice = Big(
          scaleHuman(res.amount.toString(), res.decimals),
        ).toFixed(12)
      }
    } catch (e) {
      return { tokenIn, tokenOut, spotPrice }
    }
    return { tokenIn, tokenOut, spotPrice }
  }

export const useSubscribedPriceKeys = (assetIds: string[]) => {
  const stableCoinId = useDisplayAssetStore(
    useShallow((state) => state.stableCoinId),
  )

  const setAssets = useDisplaySpotPriceStore(
    useShallow((state) => state.setAssets),
  )

  const { isLoaded, tradeRouter } = useRpcProvider()

  useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: ["spotPriceKey", assetId],
      queryFn: async () => {
        const price = await getSpotPrice(
          tradeRouter,
          assetId,
          stableCoinId ?? "",
        )()

        setAssets([{ id: assetId, price: price.spotPrice }])

        return true
      },
      notifyOnChangeProps: [],
      staleTime: Infinity,
      enabled: isLoaded,
    })),
  })
}
