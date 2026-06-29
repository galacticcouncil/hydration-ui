import { queryOptions, useQuery } from "@tanstack/react-query"
import { getContract } from "viem"

import {
  BIL_POOL_ABI,
  BIL_POOL_ADDRESS,
} from "@/modules/strategies/bil/constants"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const bilPoolContractQuery = (rpc: TProviderContext) => {
  return queryOptions({
    queryKey: bilQueryKeys.poolContract(),
    enabled: rpc.isLoaded,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: () => {
      return getContract({
        address: BIL_POOL_ADDRESS,
        abi: BIL_POOL_ABI,
        client: rpc.evm,
      })
    },
  })
}
export const useBilPoolContract = () => {
  const rpc = useRpcProvider()
  return useQuery(bilPoolContractQuery(rpc))
}
