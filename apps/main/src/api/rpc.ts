import { PingResponse, pingRpc, sleep, wsToHttp } from "@galacticcouncil/utils"
import {
  keepPreviousData,
  queryOptions,
  useQueries,
  useQuery,
} from "@tanstack/react-query"
import { useRef } from "react"

import { pingWorker } from "@/workers/ping"

const RPC_STATUS_POLL_INTERVAL = 10_000

export type RpcStatusQueryOptions = {
  poll?: boolean
}

export const rpcStatusQueryOptions = (
  url: string,
  { poll = false }: RpcStatusQueryOptions = {},
) => {
  return queryOptions({
    enabled: !!url,
    queryKey: ["rpcStatus", url],
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
    refetchInterval: poll ? RPC_STATUS_POLL_INTERVAL : false,
    placeholderData: keepPreviousData,
    refetchIntervalInBackground: poll,
  })
}

export const useRpcStatus = (url: string, options?: RpcStatusQueryOptions) => {
  return useQuery(rpcStatusQueryOptions(url, options))
}

type RpcsStatusOptions = {
  calculateAvgPing?: boolean
  poll?: boolean
}

export const useRpcsStatus = (
  urls: string[],
  options: RpcsStatusOptions = {},
) => {
  const pingCacheRef = useRef<Map<string, PingResponse["ping"][]>>(new Map())

  return useQueries({
    queries: urls.map((url, index) => ({
      ...rpcStatusQueryOptions(url, {
        poll: options.poll,
      }),
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
              typeof ping === "number" && ping > 0 && ping < Infinity,
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
