import { queryOptions, useQuery } from "@tanstack/react-query"
import { getContract } from "viem"

import { VAULT_ABI, VAULT_ADDRESS } from "@/modules/strategies/bil/constants"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const bilVaultContractQuery = (rpc: TProviderContext) => {
  return queryOptions({
    queryKey: bilQueryKeys.vaultContract(),
    enabled: rpc.isLoaded,
    staleTime: Infinity,
    gcTime: Infinity,
    queryFn: () => {
      return getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: rpc.evm,
      })
    },
  })
}
export const useBilVaultContract = () => {
  const rpc = useRpcProvider()
  return useQuery(bilVaultContractQuery(rpc))
}
