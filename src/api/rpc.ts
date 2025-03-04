import { useQueries, useQuery } from "@tanstack/react-query"
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
  refetchInterval: 30000,
  staleTime: 30000,
  keepPreviousData: true,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: true,
})

export const useRpcPing = (url: string) => {
  return useQuery(rpcPingQueryOptions(url))
}

export const useRpcsPing = (urls: string[]) => {
  return useQueries({
    queries: urls.map((url, index) => rpcPingQueryOptions(url, index * 100)),
  })
}

export const useRpcsInfo = (urls: string[]) => {
  return useQueries({
    queries: urls.map((url) => ({
      queryKey: QUERY_KEYS.rpcInfo(url),
      queryFn: () => fetchRpcInfo(url),
      refetchInterval: PARACHAIN_BLOCK_TIME_MS / 2,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: true,
    })),
  })
}
