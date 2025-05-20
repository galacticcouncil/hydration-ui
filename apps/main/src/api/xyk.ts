import { useQuery } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"

export const useXYKPoolsLiquidity = (poolAddress: string) => {
  const { isApiLoaded, papi } = useRpcProvider()

  return useQuery({
    enabled: isApiLoaded,
    queryKey: ["xykLiquidity"],
    queryFn: async () => {
      const data = await papi.query.XYK.TotalLiquidity.getValue(poolAddress)

      return data
    },
  })
}
