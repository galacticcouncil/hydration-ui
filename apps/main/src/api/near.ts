import { isNearChain } from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { queryOptions } from "@tanstack/react-query"

export const nearAccountQuery = (chainKey: string, address: string) =>
  queryOptions({
    queryKey: ["near", "account", chainKey, address],
    queryFn: async () => {
      const chain = chainsMap.get(chainKey)

      if (!chain || !isNearChain(chain)) {
        throw new Error("Unsupported chain")
      }

      return !!(await chain.client.viewAccount(address))
    },
    retry: false,
    staleTime: Infinity,
  })
