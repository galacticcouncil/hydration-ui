import { useQuery } from "@tanstack/react-query"
import { BN } from "bn.js"

import { useRpcProvider } from "@/providers/rpcProvider"

export const useOtcTradeFeeQuery = (offerId: string) => {
  const { api, isLoaded: isRpcReady } = useRpcProvider()

  return useQuery({
    queryKey: ["trade", "otc", "offer", offerId, "fee"],
    queryFn: async (): Promise<string> => {
      const fee = await api.consts.otc.fee

      if (!fee) {
        return "0"
      }

      return fee.div(new BN(1000000)).toString()
    },
    enabled: isRpcReady && !!offerId,
    retry: 0,
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 1,
  })
}
