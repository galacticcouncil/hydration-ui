import { useQueries, useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { useRef } from "react"
import { sleep } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { PingResponse, pingRpc } from "utils/rpc"
import BN from "bignumber.js"
import { pingWorker } from "workers/ping"
import { wsToHttp } from "utils/formatting"

const rpcStatusQueryOptions = (url: string, slotDuration: string) => ({
  queryKey: QUERY_KEYS.rpcStatus(url),
  queryFn: async () => {
    const [ping, status] = await Promise.all([
      pingWorker.getPing(wsToHttp(url)),
      pingRpc(url),
    ])
    return {
      ...status,
      ping,
    }
  },
  retry: 0,
  refetchInterval: BN(slotDuration).div(2).toNumber(),
  keepPreviousData: true,
  refetchIntervalInBackground: true,
})

export const useRpcStatus = (url: string, slotDuration: string) => {
  return useQuery(rpcStatusQueryOptions(url, slotDuration))
}

type RpcsStatusOptions = {
  calculateAvgPing?: boolean
}

export const useRpcsStatus = (
  urls: string[],
  options: RpcsStatusOptions = {},
) => {
  const { slotDurationMs } = useRpcProvider()
  const pingCacheRef = useRef<Map<string, PingResponse["ping"][]>>(new Map())

  return useQueries({
    queries: urls.map((url, index) => ({
      ...rpcStatusQueryOptions(url, slotDurationMs),
      queryFn: async () => {
        const delay = index * 150 // stagger queries for more accurate measurements
        if (delay > 0) await sleep(delay)
        const [ping, status] = await Promise.all([
          pingWorker.getPing(wsToHttp(url)),
          pingRpc(url),
        ])

        const result: PingResponse = {
          ...status,
          ping,
        }

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
          .slice(-10) // Keep only the last 10 pings
          .sort((a, b) => a - b) // Sort pings from lowest to highest

        // Remove outlier
        const trimmedPings =
          sortedPings.length > 1 ? sortedPings.slice(0, -1) : sortedPings

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
