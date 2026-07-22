import { useQuery } from "@tanstack/react-query"
import { QueryClient, queryOptions } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour, millisecondsInMinute } from "date-fns/constants"

import { TAssetData } from "@/api/assets"
import { stablePoolsQuery, StableSwapBase } from "@/api/pools"
import { spotPriceKeyQuery } from "@/api/spotPrice"
import { TAssetsContext } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { TProviderContext } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

export type TStableswapPool = Awaited<
  ReturnType<Papi["query"]["Stableswap"]["Pools"]["getValue"]>
>

export const useStableswap = (poolId: string) => {
  const { isLoaded, papi } = useRpcProvider()

  return useQuery({
    queryKey: ["stableswap", poolId],
    queryFn: (): Promise<TStableswapPool> =>
      papi.query.Stableswap.Pools.getValue(Number(poolId)),
    staleTime: millisecondsInHour,
    enabled: isLoaded,
  })
}

export const useStableSwapTradability = () => {
  const { isLoaded, papi } = useRpcProvider()

  return useQuery({
    queryKey: ["stableswap", "tradability"],
    queryFn: () => papi.query.Stableswap.AssetTradability.getEntries(),
    staleTime: Infinity,
    enabled: isLoaded,
  })
}

export type TReserve = {
  asset_id: number
  meta: TAssetData
  amount: string
  amountHuman: string
  displayAmount: string
  proportion: string
}

export type TStablepoolDetails = {
  pool: StableSwapBase
  reserves: TReserve[]
  totalDisplayAmount: string
}

export const stablepoolReservesQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
  stablepoolId: string,
  getAssetWithFallback: TAssetsContext["getAssetWithFallback"],
) =>
  queryOptions<TStablepoolDetails | undefined>({
    queryKey: ["stablepool", "reserves", stablepoolId],
    queryFn: async () => {
      const stablePools = await queryClient.ensureQueryData(
        stablePoolsQuery(rpc.sdk, queryClient),
      )

      const pool = stablePools.find((p) => p.id.toString() === stablepoolId)

      if (!pool) return undefined

      const reserves: TReserve[] = []
      let totalDisplayAmount = Big(0)

      for (const token of pool.tokens) {
        if (token.id === pool.id) continue

        const assetId = token.id.toString()
        const decimals = token.decimals ?? 0
        const amount = token.balance.toString()

        const spotPrice = await queryClient.ensureQueryData(
          spotPriceKeyQuery(rpc, assetId),
        )

        if (!spotPrice) continue

        const amountHuman = toDecimal(amount, decimals)
        const displayAmount = Big(amountHuman).times(spotPrice).toString()

        totalDisplayAmount = totalDisplayAmount.plus(displayAmount)

        reserves.push({
          asset_id: Number(assetId),
          amount,
          amountHuman,
          displayAmount,
          meta: getAssetWithFallback(assetId),
          proportion: "0",
        })
      }

      const reservesWithProportions = reserves.map((reserve) => ({
        ...reserve,
        proportion: Big(reserve.displayAmount)
          .div(totalDisplayAmount)
          .toFixed(4),
      }))

      return {
        pool,
        reserves: reservesWithProportions,
        totalDisplayAmount: totalDisplayAmount.toString(),
      }
    },
    staleTime: millisecondsInMinute,
    gcTime: millisecondsInMinute,
    enabled: rpc.isApiLoaded,
  })
