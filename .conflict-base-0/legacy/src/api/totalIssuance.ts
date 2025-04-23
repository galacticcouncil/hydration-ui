import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"

export const useTotalIssuances = () => {
  const { isLoaded, api } = useRpcProvider()

  return useQuery(QUERY_KEYS.totalIssuances, getTotalIssuances(api), {
    enabled: isLoaded,
  })
}

const getTotalIssuances = (api: ApiPromise) => async () => {
  const res = await api.query.tokens.totalIssuance.entries()

  return new Map(
    res.map(([key, rawData]) => [
      key.args[0].toString(),
      rawData.toBigNumber(),
    ]),
  )
}
