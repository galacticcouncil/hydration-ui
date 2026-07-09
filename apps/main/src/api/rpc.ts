import { PingResponse, sleep } from "@galacticcouncil/utils"
import {
  keepPreviousData,
  queryOptions,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { useRef } from "react"

import { pingWorker } from "@/workers/ping"

const RPC_STATUS_POLL_INTERVAL = 10_000
const RPC_PING_TIMEOUT_MS = 10_000

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
    queryFn: async ({ client }) => {
      const result = await pingWorker.getBlock(url, RPC_PING_TIMEOUT_MS)
      const previous = client.getQueryData<PingResponse>(["rpcStatus", url])
      const isInvalid = result.ping === Infinity
      const isPrevInvalid = !previous || previous.ping === Infinity

      if (!isInvalid || isPrevInvalid) {
        return result
      }

      return previous
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
  const queryClient = useQueryClient()
  const pingCacheRef = useRef<Map<string, PingResponse["ping"][]>>(new Map())

  return useQueries({
    queries: urls.map((url, index) => ({
      ...rpcStatusQueryOptions(url, {
        poll: options.poll,
      }),
      queryFn: async () => {
        const delay = index * 200 // stagger queries for more accurate measurements
        if (delay > 0) await sleep(delay)
        const result = await pingWorker.getBlock(url, RPC_PING_TIMEOUT_MS)
        const previous = queryClient.getQueryData<PingResponse>([
          "rpcStatus",
          url,
        ])
        const isInvalid = result.ping === Infinity
        const isPrevInvalid = !previous || previous.ping === Infinity

        if (!options.calculateAvgPing) {
          if (!isInvalid || isPrevInvalid) {
            return result
          }

          return { ...previous, ping: result.ping ?? previous.ping }
        }

        if (!isInvalid) {
          const cache = pingCacheRef.current
          const prevPingArr = cache.get(url) ?? []
          const newPingArr = [...prevPingArr, result.ping]

          cache.set(url, newPingArr)

          const sortedPings = [...newPingArr]
            .filter(
              (ping): ping is number =>
                typeof ping === "number" && ping > 0 && ping < Infinity,
            )
            .sort((a, b) => a - b)

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
        }

        const cache = pingCacheRef.current
        const prevPingArr = cache.get(url) ?? []
        const sortedPings = [...prevPingArr]
          .filter(
            (ping): ping is number =>
              typeof ping === "number" && ping > 0 && ping < Infinity,
          )
          .sort((a, b) => a - b)
        const trimmedPings = sortedPings.slice(
          0,
          sortedPings.length > 1 ? -1 : sortedPings.length,
        )
        const avgPing =
          trimmedPings.length > 0
            ? trimmedPings.reduce((acc, curr) => acc + curr, 0) /
              trimmedPings.length
            : null

        const failedResult = { ...result, ping: avgPing }

        if (!isInvalid || isPrevInvalid) {
          return failedResult
        }

        return previous
      },
    })),
  })
}
