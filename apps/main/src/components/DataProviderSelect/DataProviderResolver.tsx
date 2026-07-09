import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { PingResponse } from "@galacticcouncil/utils"
import { useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useEffect, useState } from "react"
import { useAsyncFn } from "react-use"
import { prop } from "remeda"

import { PROVIDER_URLS } from "@/api/provider"
import { rpcStatusQueryOptions } from "@/api/rpc"
import { ENV } from "@/config/env"
import { SQUID_URLS } from "@/config/rpc"
import { useProviderRpcUrlStore } from "@/states/provider"
import { pingWorker } from "@/workers/ping"

import {
  fetchIndexerInfo,
  getBestIndexer,
  getBestRpc,
} from "./DataProviderResolver.utils"

declare global {
  interface Window {
    __HYDRATION_BEST_RPCS__?: PingResponse[]
  }
}

export const DataProviderResolver: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const queryClient = useQueryClient()

  const [isBestProviderFound, setIsBestProviderFound] = useState(
    () => !useProviderRpcUrlStore.getState().autoMode,
  )

  const [, fetchBestProvider] = useAsyncFn(async () => {
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

    const indexerInfos = await Promise.all(
      SQUID_URLS.map((indexer) => fetchIndexerInfo(indexer)),
    )

    const bestIndexer = getBestIndexer(
      indexerInfos,
      bestRpc?.blockNumber ?? null,
    )

    if (bestIndexer) {
      const url = bestIndexer.config.graphqlUrl
      queryClient.setQueryData(
        latestBlockHeightQuery(getSquidSdk(url), url).queryKey,
        bestIndexer.blockHeight,
      )
      useProviderRpcUrlStore.setState({
        squidUrl: url,
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
