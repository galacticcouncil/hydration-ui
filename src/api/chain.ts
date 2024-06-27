import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"
import { useActiveProvider } from "api/provider"

export const useBestNumber = (disable?: boolean) => {
  const { api } = useRpcProvider()
  const activeProvider = useActiveProvider()
  return useQuery(
    QUERY_KEYS.bestNumber(activeProvider?.url ?? ""),
    async () => {
      const [validationData, parachainBlockNumber] = await Promise.all([
        api.query.parachainSystem.validationData(),
        api.derive.chain.bestNumber(),
      ])
      const relaychainBlockNumber = validationData.unwrap().relayParentNumber
      return { parachainBlockNumber, relaychainBlockNumber }
    },
    {
      enabled: "query" in api && !!activeProvider?.url && !disable,
    },
  )
}
