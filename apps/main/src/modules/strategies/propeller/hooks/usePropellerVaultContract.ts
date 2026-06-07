import { queryOptions, useQuery } from "@tanstack/react-query"
import { getContract } from "viem"

import {
  VAULT_ABI,
  VAULT_ADDRESS,
} from "@/modules/strategies/propeller/constants"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

export const propellerVaultContractQuery = (rpc: TProviderContext) => {
  return queryOptions({
    queryKey: ["propeller-vault-contract"],
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
export const usePropellerVaultContract = () => {
  const rpc = useRpcProvider()
  return useQuery(propellerVaultContractQuery(rpc))
}
