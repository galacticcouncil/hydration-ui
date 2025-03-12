import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { QUERY_KEYS } from "utils/queryKeys"

export const useExistentialDepositMultiplier = () => {
  const { api, isLoaded } = useRpcProvider()

  return useQuery({
    queryKey: QUERY_KEYS.otcExistentialDepositMultiplier,
    queryFn: () => api.consts.otc.existentialDepositMultiplier.toNumber(),
    enabled: isLoaded,
  })
}
