import { useQuery } from "@tanstack/react-query"
import { useApiPromise } from "utils/api"
import { QUERY_KEYS } from "utils/queryKeys"

export const useBestNumber = (disable?: boolean) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.bestNumber,
    async () => {
      const [validationData, parachainBlockNumber, timestamp] =
        await Promise.all([
          api.query.parachainSystem.validationData(),
          api.derive.chain.bestNumber(),
          api.query.timestamp.now(),
        ])
      const relaychainBlockNumber = validationData.unwrap().relayParentNumber
      return { parachainBlockNumber, relaychainBlockNumber, timestamp }
    },
    { enabled: !disable },
  )
}
