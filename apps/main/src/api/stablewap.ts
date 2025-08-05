import { useQuery } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"

import { useRpcProvider } from "@/providers/rpcProvider"

export const useStableswap = (poolId: string) => {
  const { isLoaded, papi } = useRpcProvider()

  return useQuery({
    queryKey: ["stableswap", poolId],
    queryFn: () => papi.query.Stableswap.Pools.getValue(Number(poolId)),
    staleTime: millisecondsInHour,
    enabled: isLoaded,
  })
}
