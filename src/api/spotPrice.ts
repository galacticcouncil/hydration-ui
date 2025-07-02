import {
  NotifyOnChangeProps,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { u32 } from "@polkadot/types"
import { TradeRouter } from "@galacticcouncil/sdk"
import { Maybe } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { useDisplaySpotPriceStore } from "state/displayPrice"
import { useShallow } from "hooks/useShallow"
import { useDisplayAssetStore } from "utils/displayAsset"

const TRACKED_PROPS: NotifyOnChangeProps = ["data", "isLoading"]

export const useSpotPrice = (
  assetA: Maybe<u32 | string>,
  assetB: Maybe<u32 | string>,
) => {
  const { sdk, isLoaded } = useRpcProvider()
  const tokenIn = assetA?.toString() ?? ""
  const tokenOut = assetB?.toString() ?? ""

  const { api } = sdk
  const router = api?.router ?? {}

  const routerInitialized = Object.keys(router).length > 0

  return useQuery(
    QUERY_KEYS.spotPriceLive(tokenIn, tokenOut),
    getSpotPrice(router, tokenIn, tokenOut),
    {
      enabled: !!tokenIn && !!tokenOut && routerInitialized && isLoaded,
      notifyOnChangeProps: TRACKED_PROPS,
      staleTime: 10000,
    },
  )
}

export const usePriceSubscriber = () => {
  const { isLoaded, sdk, timestamp } = useRpcProvider()
  const queryClient = useQueryClient()
  const setAssets = useDisplaySpotPriceStore(
    useShallow((state) => state.setAssets),
  )
  const stableCoinId = useDisplayAssetStore(
    useShallow((state) => state.stableCoinId),
  )

  const { api } = sdk

  return useQuery(
    [...QUERY_KEYS.displayPrices(stableCoinId), timestamp],
    async () => {
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
          getSpotPrice(api.router, assetId, stableCoinId ?? "")(),
        ),
      )

      const storeData = prices.map((price) => ({
        id: price.tokenIn,
        price: price.spotPrice,
      }))

      setAssets(storeData)

      return activeAssetsIds
    },
    {
      enabled: isLoaded && !!stableCoinId && !!api.router,
      notifyOnChangeProps: [],
      staleTime: 10000,
    },
  )
}

const getSpotPrice =
  (tradeRouter: TradeRouter, tokenIn: string, tokenOut: string) => async () => {
    // X -> X would return undefined, no need for spot price in such case
    if (tokenIn === tokenOut) return { tokenIn, tokenOut, spotPrice: "1" }

    // error replies are valid in case token has no spot price
    let spotPrice: string = "NaN"

    try {
      const res = await tradeRouter.getBestSpotPrice(tokenIn, tokenOut)

      if (res && res.amount.isFinite()) {
        spotPrice = res.amount
          .shiftedBy(-res.decimals)
          .decimalPlaces(10)
          .toString()
      }
    } catch (e) {
      return { tokenIn, tokenOut, spotPrice }
    }
    return { tokenIn, tokenOut, spotPrice }
  }

export const usePriceKeys = (assetIds: string[]) => {
  const stableCoinId = useDisplayAssetStore(
    useShallow((state) => state.stableCoinId),
  )

  const setAssets = useDisplaySpotPriceStore(
    useShallow((state) => state.setAssets),
  )

  const { isLoaded, sdk } = useRpcProvider()

  const { api } = sdk

  useQueries({
    queries: assetIds.map((assetId) => ({
      queryKey: QUERY_KEYS.spotPriceKey(assetId),
      queryFn: async () => {
        const price = await getSpotPrice(
          api.router,
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
