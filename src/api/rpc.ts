import { useQueries, useQuery } from "@tanstack/react-query"
import { useRef } from "react"
import { PARACHAIN_BLOCK_TIME_MS } from "utils/constants"
import { sleep } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { PingResponse, pingRpc } from "utils/rpc"

const rpcStatusQueryOptions = (url: string) => ({
  queryKey: QUERY_KEYS.rpcStatus(url),
  queryFn: () => pingRpc(url),
  retry: 0,
  refetchInterval: PARACHAIN_BLOCK_TIME_MS / 2,
  keepPreviousData: true,
  refetchIntervalInBackground: true,
})

export const useRpcStatus = (url: string) => {
  return useQuery(rpcStatusQueryOptions(url))
}

type RpcsStatusOptions = {
  calculateAvgPing?: boolean
}

export const useRpcsStatus = (
  urls: string[],
  options: RpcsStatusOptions = {},
) => {
  const pingCacheRef = useRef<Map<string, PingResponse["ping"][]>>(new Map())

  return useQueries({
    queries: urls.map((url, index) => ({
      ...rpcStatusQueryOptions(url),
      queryFn: async () => {
        const delay = index * 150 // stagger queries for more accurate measurements
        if (delay > 0) await sleep(delay)
        const result = await pingRpc(url)

        if (!options.calculateAvgPing) return result

        const cache = pingCacheRef.current
        const prevPingArr = cache.get(url) ?? []
        const newPingArr = [...prevPingArr, result.ping]

        cache.set(url, newPingArr)

        // Sort and remove invalid values
        const sortedPings = [...newPingArr]
          .filter(
            (ping): ping is number =>
              typeof ping == "number" && ping > 0 && ping < Infinity,
          )
          .sort((a, b) => a - b)

        // Remove outlier
        const trimmedPings = sortedPings.slice(
          0,
          sortedPings.length > 1 ? -1 : sortedPings.length,
        )

        const avgPing =
          trimmedPings.length > 0
            ? trimmedPings.reduce((acc, curr) => acc + curr, 0) /
              trimmedPings.length
            : null

        return {
          ...result,
          ping: avgPing,
        }
      },
    })),
  })
}
