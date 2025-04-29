import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const uniquesIds = (context: TProviderContext) => {
  const { isApiLoaded, papi } = context

  return queryOptions({
    enabled: isApiLoaded,
    staleTime: Infinity,
    queryKey: ["uniquesIds"],
    queryFn: async () => {
      const [omnipoolNftId, miningNftId, xykMiningNftId] = await Promise.all([
        papi.constants.Omnipool.NFTCollectionId(),
        papi.constants.OmnipoolLiquidityMining.NFTCollectionId(),
        papi.constants.XYKLiquidityMining.NFTCollectionId(),
      ])

      return { omnipoolNftId, miningNftId, xykMiningNftId }
    },
  })
}
