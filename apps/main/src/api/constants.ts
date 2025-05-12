import { queryOptions } from "@tanstack/react-query"
import Big from "big.js"

import { TProviderContext } from "@/providers/rpcProvider"
import { NATIVE_ASSET_DECIMALS } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

const GC_TIME = 1000 * 60 * 60 * 24
const STALE_TIME = 1000 * 60 * 60 * 1

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

export const minBudgetNativeQuery = ({ papi, isLoaded }: TProviderContext) => {
  return queryOptions({
    queryKey: ["minBudgetNative"],
    queryFn: async (): Promise<string> => {
      const minBudget = await papi.constants.DCA.MinBudgetInNativeCurrency()

      return scaleHuman(minBudget.toString(), NATIVE_ASSET_DECIMALS)
    },
    enabled: isLoaded,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
}
