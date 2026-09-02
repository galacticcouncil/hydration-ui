import { XcSwapClient } from "@galacticcouncil/xc-swap"
import { useQuery } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"

export const xcSwapDestinationAssetsQueryKey = [
  "xcSwap",
  "destinationAssets",
] as const

export const useXcSwapDestinationAssetsQuery = (xcSwap: XcSwapClient) => {
  const { isApiLoaded } = useRpcProvider()

  return useQuery({
    queryKey: xcSwapDestinationAssetsQueryKey,
    queryFn: () => xcSwap.getDestinationAssets(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })
}
