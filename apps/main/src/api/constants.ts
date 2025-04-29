import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

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

export const insufficientFeeQuery = ({ papi, isLoaded }: TProviderContext) => {
  return queryOptions({
    queryKey: ["insufficientFee"],
    queryFn: async () => {
      const fee = await papi.constants.Balances.ExistentialDeposit()

      return new Big(fee.toString()).times(1.1).toString()
    },
    enabled: isLoaded,
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 1,
  })
}
