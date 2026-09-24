import { useQuery } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"

import { Papi } from "@/api/rpcClient"
import { useRpcProvider } from "@/providers/rpcProvider"

export type TStableswapPool = Awaited<
  ReturnType<Papi["query"]["Stableswap"]["Pools"]["getValue"]>
>

export const useStableswap = (poolId: string) => {
  const { isReady, papi } = useRpcProvider()

  return useQuery({
    queryKey: ["stableswap", poolId],
    queryFn: (): Promise<TStableswapPool> =>
      papi.query.Stableswap.Pools.getValue(Number(poolId)),
    staleTime: millisecondsInHour,
    enabled: isReady,
  })
}

export const useStableSwapTradability = () => {
  const { isReady, papi } = useRpcProvider()

  return useQuery({
    queryKey: ["stableswap", "tradability"],
    queryFn: () => papi.query.Stableswap.AssetTradability.getEntries(),
    staleTime: Infinity,
    enabled: isReady,
  })
}
