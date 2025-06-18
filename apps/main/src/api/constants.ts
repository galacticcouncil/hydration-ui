import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { TProviderContext } from "@/providers/rpcProvider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"

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
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
}
