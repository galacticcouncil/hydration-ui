import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const otcExistentialDepositorMultiplierQuery = (
  rpc: TProviderContext,
) => {
  const { papi, isReady } = rpc

  return queryOptions({
    queryKey: ["trade", "otc", "constants", "existentialDepositorMultiplier"],
    queryFn: () => papi.constants.OTC.ExistentialDepositMultiplier(),
    enabled: isReady,
    staleTime: Infinity,
  })
}
