import { useQuery } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"

import { Papi, useRpcProvider } from "@/providers/rpcProvider"

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
