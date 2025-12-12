import {
  QueryClient,
  queryOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

import { PoolBase, xykPoolQuery } from "./pools"

export type TXYKConsts = NonNullable<ReturnType<typeof useXYKConsts>["data"]>
export type XYKPoolWithLiquidity = PoolBase & { totalLiquidity: bigint }

export const xykPoolWithLiquidityQuery = (
  { papi, sdk, isApiLoaded }: TProviderContext,
  queryClient: QueryClient,
  address: string,
) =>
  queryOptions<XYKPoolWithLiquidity | undefined>({
    queryKey: ["xyk", "totalLiquidity", address],
    enabled: isApiLoaded && !!address,

    queryFn: async () => {
      const xykPool = await queryClient.ensureQueryData(
        xykPoolQuery(queryClient, sdk, address),
      )

      const totalLiquidity =
        await papi.query.XYK.TotalLiquidity.getValue(address)

      if (!xykPool || !totalLiquidity) return undefined

      return { ...xykPool, totalLiquidity }
    },
  })

export const useXYKPoolWithLiquidity = (poolAddress: string) =>
  useQuery(
    xykPoolWithLiquidityQuery(useRpcProvider(), useQueryClient(), poolAddress),
  )

export const useXYKConsts = () => {
  const { papi, isApiLoaded } = useRpcProvider()

  return useQuery({
    enabled: isApiLoaded,
    staleTime: Infinity,
    gcTime: Infinity,
    queryKey: ["xykConsts"],
    queryFn: async () => {
      const [fee, minPoolLiquidity] = await Promise.all([
        papi.constants.XYK.GetExchangeFee(),
        papi.constants.XYK.MinPoolLiquidity(),
      ])

      return {
        fee,
        minPoolLiquidity,
      }
    },
  })
}

export const useXykShareTokenEntries = () => {
  const { isApiLoaded, papi } = useRpcProvider()

  return useQuery({
    queryKey: ["xyk", "shareTokenEntries"],
    queryFn: async () => {
      const pools = await papi.query.XYK.ShareToken.getEntries()

      return new Map(pools.map((pool) => [pool.keyArgs[0], pool.value]))
    },
    staleTime: Infinity,
    enabled: isApiLoaded,
    notifyOnChangeProps: [],
  })
}
