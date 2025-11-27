import { useQuery } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"

export type TXYKConsts = NonNullable<ReturnType<typeof useXYKConsts>["data"]>

export const useXYKPoolsLiquidity = (
  poolAddress: string,
  disabled?: boolean,
) => {
  const { isApiLoaded, papi } = useRpcProvider()

  return useQuery({
    enabled: isApiLoaded && !disabled,
    staleTime: Infinity,
    gcTime: Infinity,
    queryKey: ["xykLiquidity", poolAddress],
    queryFn: async () => {
      const data = await papi.query.XYK.TotalLiquidity.getValue(poolAddress)

      return data
    },
  })
}

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
