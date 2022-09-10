import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/network"
import { QUERY_KEYS } from "utils/queryKeys"

export const useBestNumber = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.bestNumber, () => {
    return api.derive.chain.bestNumber()
  })
}
