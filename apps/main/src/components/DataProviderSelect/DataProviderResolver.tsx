import { neckworkStatusQuery } from "@galacticcouncil/indexer/neckwork"
import { PingResponse } from "@galacticcouncil/utils"
import { useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useEffect, useState } from "react"
import { useAsyncFn } from "react-use"
import { prop } from "remeda"

import { neckworkClient, PROVIDER_URLS } from "@/api/provider"
import { rpcStatusQueryOptions } from "@/api/rpc"
import { ENV } from "@/config/env"
import { useNeckworkStore } from "@/states/neckwork"
import { useProviderRpcUrlStore } from "@/states/provider"
import { pingWorker } from "@/workers/ping"

import { fetchNeckworkStatus, getBestRpc } from "./DataProviderResolver.utils"

declare global {
  interface Window {
    __HYDRATION_BEST_RPCS__?: PingResponse[]
  }
}

export const DataProviderResolver: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const queryClient = useQueryClient()

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

    const neckworkStatus = await fetchNeckworkStatus()

    useNeckworkStore.setState({ alive: !!neckworkStatus })

    if (neckworkStatus) {
      queryClient.setQueryData(
        neckworkStatusQuery(neckworkClient).queryKey,
        neckworkStatus,
      )
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
