import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const otcExistentialDepositorMultiplierQuery = (
  rpc: TProviderContext,
) => {
  const { papi, isApiLoaded } = rpc

  return queryOptions({
    queryKey: ["trade", "otc", "constants", "existentialDepositorMultiplier"],
    queryFn: () => papi.constants.OTC.ExistentialDepositMultiplier(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })
}
