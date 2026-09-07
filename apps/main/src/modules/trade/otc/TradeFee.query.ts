import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const otcTradeFeeQuery = (rpc: TProviderContext) => {
  const { papi, isReady } = rpc

  return queryOptions({
    queryKey: ["trade", "otc", "fee"],
    queryFn: async (): Promise<string> => {
      const fee = await papi.constants.OTC.Fee()

      return scaleHuman(fee, 6)
    },
    enabled: isReady,
    retry: 0,
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 1,
  })
}
