import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"

export const useBestNumber = (disable?: boolean) => {
  const { api } = useRpcProvider()
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
