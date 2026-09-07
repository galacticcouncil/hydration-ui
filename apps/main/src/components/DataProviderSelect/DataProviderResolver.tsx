import { neckworkStatusQuery } from "@galacticcouncil/indexer/neckwork"
import { PingResponse } from "@galacticcouncil/utils"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useEffect, useState } from "react"
import { useAsyncFn } from "react-use"
import { prop } from "remeda"

import { neckworkClient } from "@/api/neckwork"
import { rpcStatusQueryOptions } from "@/api/rpc"
import { PROVIDER_URLS } from "@/api/rpcConfig"
import { ENV } from "@/config/env"
import { classifyNeckworkProbe, useNeckworkStore } from "@/states/neckwork"
import { useProviderRpcUrlStore } from "@/states/provider"
import { pingWorker } from "@/workers/ping"

import { fetchNeckworkStatus, getBestRpc } from "./DataProviderResolver.utils"

declare global {
  interface Window {
    __HYDRATION_BEST_RPCS__?: PingResponse[]
  }
}

const NECKWORK_HEALTH_POLL_INTERVAL = 60_000

const useNeckworkHealthPoll = () => {
  const queryClient = useQueryClient()

  const { data: probe } = useQuery({
    queryKey: ["neckwork", "health"],
    queryFn: fetchNeckworkStatus,
    refetchInterval: NECKWORK_HEALTH_POLL_INTERVAL,
    refetchIntervalInBackground: false,
    retry: false,
  })

  useEffect(() => {
    if (!probe) return

    useNeckworkStore.setState({ health: classifyNeckworkProbe(probe) })

    if (probe.kind === "ok") {
      queryClient.setQueryData(
        neckworkStatusQuery(neckworkClient).queryKey,
        probe.status,
      )
    }
  }, [probe, queryClient])
}

export const DataProviderResolver: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const queryClient = useQueryClient()

  useNeckworkHealthPoll()

  const [isBestProviderFound, setIsBestProviderFound] = useState(false)

  const [, fetchBestProvider] = useAsyncFn(async () => {
    const { autoMode } = useProviderRpcUrlStore.getState()

    if (autoMode) {
      const bestRpcs =
        window.__HYDRATION_BEST_RPCS__ ??
        (await pingWorker.getBestRpcs(PROVIDER_URLS))

      delete window.__HYDRATION_BEST_RPCS__

      const bestRpc = getBestRpc(bestRpcs)

      if (bestRpc) {
        queryClient.setQueryData(
          rpcStatusQueryOptions(bestRpc.url).queryKey,
          bestRpc,
        )
      }

      const bestRpcsUrls = bestRpcs.map(prop("url"))
      const sortedRpcList = Array.from(
        new Set([...bestRpcsUrls, ...PROVIDER_URLS]),
      )

      const bestRpcUrl = bestRpc?.url ?? ENV.VITE_PROVIDER_URL

      useProviderRpcUrlStore.setState({
        rpcUrl: bestRpcUrl,
        rpcUrlList: sortedRpcList,
        updatedAt: Date.now(),
      })
    }

    setIsBestProviderFound(true)
  }, [queryClient])

  useEffect(() => {
    if (isBestProviderFound) return
    fetchBestProvider()
  }, [fetchBestProvider, isBestProviderFound])

  useEffect(() => {
    return useProviderRpcUrlStore.subscribe((state, prevState) => {
      if (prevState.autoMode || !state.autoMode) return

      fetchBestProvider()
    })
  }, [fetchBestProvider])

  if (!isBestProviderFound) return null

  return children
}
