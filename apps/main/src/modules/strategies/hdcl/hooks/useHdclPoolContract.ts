import { queryOptions, useQuery } from "@tanstack/react-query"
import { getContract } from "viem"

import {
  HDCL_POOL_ABI,
  HDCL_POOL_ADDRESS,
} from "@/modules/strategies/hdcl/constants"
import { hdclQueryKeys } from "@/modules/strategies/hdcl/utils/queryKeys"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const hdclPoolContractQuery = (rpc: TProviderContext) => {
  return queryOptions({
    queryKey: hdclQueryKeys.poolContract(),
    enabled: rpc.isLoaded,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: () => {
      return getContract({
        address: HDCL_POOL_ADDRESS,
        abi: HDCL_POOL_ABI,
        client: rpc.evm,
      })
    },
  })
}
export const useHdclPoolContract = () => {
  const rpc = useRpcProvider()
  return useQuery(hdclPoolContractQuery(rpc))
}
