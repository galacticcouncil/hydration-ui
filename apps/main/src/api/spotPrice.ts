import { bigShift, QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import {
  QueryClient,
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "@tanstack/react-query"
import Big from "big.js"
import { isNonNullish, isNullish, prop, unique, zipWith } from "remeda"
import { useShallow } from "zustand/shallow"

import { TShareToken, useAssets } from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import {
  useDisplayAssetStore,
  useDisplaySpotPriceStore,
} from "@/states/displayAsset"
import { toDecimal } from "@/utils/formatting"

import { TradeRouter } from "./trade"
import { xykPoolWithLiquidityQuery } from "./xyk"

export const usePriceSubscriber = () => {
  const { isApiLoaded, sdk } = useRpcProvider()
  const queryClient = useQueryClient()
  const setAssets = useDisplaySpotPriceStore(useShallow(prop("setAssets")))
  const stableCoinId = useDisplayAssetStore(prop("stableCoinId"))

  return useQuery({
    queryKey: ["displayPrices", stableCoinId],
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
          getSpotPrice(sdk.api.router, assetId, stableCoinId ?? "")(),
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

export const spotPriceQuery = (
  context: TProviderContext,
  assetIn: string,
  assetOut: string,
) => {
  const { isApiLoaded, sdk } = context

  return queryOptions({
    enabled: isApiLoaded && !!assetIn && !!assetOut,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "spotPrice", assetIn, assetOut],
    queryFn: async () => {
      const spotPrice = await getSpotPrice(sdk.api.router, assetIn, assetOut)()

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
      const res = await tradeRouter.getSpotPrice(
        Number(tokenInParam),
        Number(tokenOutParam),
      )

      if (res) {
        spotPrice = toDecimal(res.amount, res.decimals)
      }
    } catch (e) {
      return { tokenIn, tokenOut, spotPrice }
    }
    return { tokenIn, tokenOut, spotPrice }
  }

export const spotPriceQueryKey = (assetId: string) => ["spotPriceKey", assetId]

export const spotPriceKeyQuery = (
  context: TProviderContext,
  assetId: string,
) => {
  const stableCoinId = useDisplayAssetStore.getState().stableCoinId
  const setAssets = useDisplaySpotPriceStore.getState().setAssets
  const { sdk, isApiLoaded } = context

  return queryOptions({
    queryKey: spotPriceQueryKey(assetId),
    queryFn: async () => {
      const price = await getSpotPrice(
        sdk.api.router,
        assetId,
        stableCoinId ?? "",
      )()

      setAssets([{ id: assetId, price: price.spotPrice }])

      return price.spotPrice
    },
    notifyOnChangeProps: [],
    staleTime: Infinity,
    enabled: isApiLoaded,
  })
}

export const useSubscribedPriceKeys = (assetIds: string[]) => {
  const rpc = useRpcProvider()

  useQueries({
    queries: assetIds.map((assetId) => spotPriceKeyQuery(rpc, assetId)),
  })
}

const combineShareTokenPrices = (
  queries: UseQueryResult<string | undefined, Error>[],
  addresses: Array<string>,
) => {
  const isLoading = queries.some((query) => query.isLoading)

  return {
    data: isLoading
      ? new Map<string, string>()
      : new Map(
          addresses.map((poolAddress, index) => {
            const data = queries[index]?.data

            return [poolAddress, data]
          }),
        ),
    isLoading,
  }
}

const shareTokenPriceQuery = (
  ql: QueryClient,
  rpc: TProviderContext,
  shareToken: TShareToken,
) => {
  const stableCoinId = useDisplayAssetStore.getState().stableCoinId

  return queryOptions({
    queryKey: ["shareTokenPrice", shareToken.poolAddress, stableCoinId],
    queryFn: async () => {
      const { poolAddress, assets } = shareToken
      const pool = await ql.ensureQueryData(
        xykPoolWithLiquidityQuery(rpc, ql, poolAddress),
      )

      if (!pool) return undefined

      const assetsWithPoolBalance = zipWith(
        pool.tokens,
        assets,
        (token, asset) => ({
          balance: token.balance,
          asset,
        }),
      )

      let shareTokenPrice: string | undefined

      for (const { asset, balance } of assetsWithPoolBalance) {
        const spotPriceAsset = await ql.ensureQueryData(
          spotPriceKeyQuery(rpc, asset.id),
        )

        if (spotPriceAsset) {
          const tvl = bigShift(
            Big(balance.toString()).times(2).toString(),
            -asset.decimals,
          )

          shareTokenPrice = tvl
            .times(spotPriceAsset)
            .div(toDecimal(pool.totalLiquidity, shareToken.decimals))
            .toString()

          break
        }
      }

      return shareTokenPrice
    },
  })
}

export const useShareTokenPrices = (poolAddresses: Array<string>) => {
  const { getShareTokensByAddress } = useAssets()
  const queryClient = useQueryClient()
  const rpc = useRpcProvider()

  // should be unique keys, since combine will not trigger with duplications
  const uniquePoolAddresses = unique(poolAddresses)

  const shareTokens =
    getShareTokensByAddress(uniquePoolAddresses).filter(isNonNullish)

  return useQueries({
    queries: shareTokens.map((shareToken) =>
      shareTokenPriceQuery(queryClient, rpc, shareToken),
    ),
    combine: (queries) =>
      combineShareTokenPrices(
        queries,
        shareTokens.map((shareToken) => shareToken.poolAddress),
      ),
  })
}
