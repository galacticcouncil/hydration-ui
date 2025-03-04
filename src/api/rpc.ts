import { useQueries, useQuery } from "@tanstack/react-query"
import { useRef } from "react"
import { PARACHAIN_BLOCK_TIME } from "utils/constants"
import { sleep } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { fetchRpcInfo, pingRpc } from "utils/rpc"

const PARACHAIN_BLOCK_TIME_MS = PARACHAIN_BLOCK_TIME.times(1000).toNumber()

const rpcPingQueryOptions = (url: string, delay = 0) => ({
  queryKey: QUERY_KEYS.rpcPing(url),
  queryFn: async () => {
    if (delay > 0) await sleep(delay) // Stagger queries for more accurate measurment
    return pingRpc(url)
  },
  refetchInterval: PARACHAIN_BLOCK_TIME_MS / 2,
  keepPreviousData: true,
  refetchIntervalInBackground: true,
})

export const useRpcPing = (url: string) => {
  return useQuery(rpcPingQueryOptions(url))
}

export const useRpcsPing = (urls: string[]) => {
  return useQueries({
    queries: urls.map((url, index) => rpcPingQueryOptions(url, index * 150)),
  })
}

export const useRpcsPingAvg = (urls: string[], maxSampleSize = 5) => {
  const pingCacheRef = useRef<Map<string, number[]>>(new Map())

  return useQueries({
    queries: urls.map((url, index) => {
      const currentSampleSize = pingCacheRef.current.get(url)?.length ?? 0
      return {
        ...rpcPingQueryOptions(url),
        enabled: currentSampleSize < maxSampleSize,
        queryKey: QUERY_KEYS.rpcPingAvg(url),
        meta: {},
        queryFn: async () => {
          const delay = index * 150
          if (delay > 0) await sleep(delay)
          const ping = await pingRpc(url)

          const cache = pingCacheRef.current
          const prevPingArr = cache.get(url) ?? []
          const newPingArr = [...prevPingArr, ping]

          cache.set(url, newPingArr)

          // Sort and remove invalid values
          const sortedPings = [...newPingArr]
            .filter(
              (ping) => Number.isFinite(ping) && ping > 0 && ping < Infinity,
            )
            .sort((a, b) => a - b)

          // Remove outlier
          const trimmedPings = sortedPings.slice(
            0,
            sortedPings.length > 1 ? -1 : sortedPings.length,
          )

          const avgPing =
            trimmedPings.reduce((acc, curr) => acc + curr, 0) /
            trimmedPings.length

          return {
            ping,
            avgPing,
          }
        },
      }
    }),
  })
}

export const useRpcsInfo = (urls: string[]) => {
  return useQueries({
    queries: urls.map((url) => ({
      queryKey: QUERY_KEYS.rpcInfo(url),
      queryFn: () => fetchRpcInfo(url),
      refetchInterval: PARACHAIN_BLOCK_TIME_MS / 2,
      keepPreviousData: true,
      refetchIntervalInBackground: true,
    })),
  })
}
