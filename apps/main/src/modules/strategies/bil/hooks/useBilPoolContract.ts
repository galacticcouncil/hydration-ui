import { queryOptions, useQuery } from "@tanstack/react-query"
import { getContract } from "viem"

import { BIL_POOL_ABI } from "@/modules/strategies/bil/config/abi"
import { BIL_POOL_ADDRESS } from "@/modules/strategies/bil/config/constants"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const bilPoolContractQuery = (rpc: TProviderContext) => {
  return queryOptions({
    queryKey: bilQueryKeys.poolContract(),
    enabled: rpc.isReady,
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
