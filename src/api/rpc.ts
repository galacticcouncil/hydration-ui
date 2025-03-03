import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { fetchRpcInfo, pingRpc, RpcInfoResult } from "utils/rpc"

const getRpcInfo = (url: string) => async () => {
  const [ping, info] = await Promise.allSettled([
    pingRpc(url),
    fetchRpcInfo(url),
  ])
  return {
    ping: ping.status === "fulfilled" ? ping.value : null,
    timestamp: info.status === "fulfilled" ? info.value.timestamp : null,
    blockNumber: info.status === "fulfilled" ? info.value.blockNumber : null,
  }
}

export const useRpcInfo = (
  url: string,
  options: UseQueryOptions<RpcInfoResult & { ping: number | null }>,
) => {
  return useQuery({
    queryKey: QUERY_KEYS.pingRpc(url),
    queryFn: getRpcInfo(url),
    ...options,
  })
}
