import { useQuery } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

export const useOtcTradeFeeQuery = () => {
  const { papi, isLoaded: isRpcReady } = useRpcProvider()

  return useQuery({
    queryKey: ["trade", "otc", "offer", "fee"],
    queryFn: async (): Promise<string> => {
      const fee = await papi.constants.OTC.Fee()

      return scaleHuman(fee, 6)
    },
    enabled: isRpcReady,
    retry: 0,
    gcTime: 1000 * 60 * 60 * 24,
    staleTime: 1000 * 60 * 60 * 1,
  })
}
