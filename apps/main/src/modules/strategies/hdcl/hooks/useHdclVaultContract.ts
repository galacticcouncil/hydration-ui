import { queryOptions, useQuery } from "@tanstack/react-query"
import { getContract } from "viem"

import { VAULT_ABI, VAULT_ADDRESS } from "@/modules/strategies/hdcl/constants"
import { hdclQueryKeys } from "@/modules/strategies/hdcl/utils/queryKeys"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const hdclVaultContractQuery = (rpc: TProviderContext) => {
  return queryOptions({
    queryKey: hdclQueryKeys.vaultContract(),
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
export const useHdclVaultContract = () => {
  const rpc = useRpcProvider()
  return useQuery(hdclVaultContractQuery(rpc))
}
