import { getBestRpcs } from "@galacticcouncil/utils"
import { useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useEffect, useState } from "react"
import { useAsyncFn } from "react-use"
import { first, prop } from "remeda"

import { PROVIDER_URLS } from "@/api/provider"
import { rpcStatusQueryOptions } from "@/api/rpc"
import { ENV } from "@/config/env"
import { SQUID_URLS } from "@/config/rpc"
import { useProviderRpcUrlStore } from "@/states/provider"

import { fetchIndexerInfo, getBestIndexer } from "./DataProviderResolver.utils"

export const DataProviderResolver: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const queryClient = useQueryClient()

  const [isBestProviderFound, setIsBestProviderFound] = useState(
    () => !useProviderRpcUrlStore.getState().autoMode,
  )

  const [, fetchBestProvider] = useAsyncFn(async () => {
    const indexerInfoPromises = SQUID_URLS.map((indexer) =>
      fetchIndexerInfo(indexer),
    )

    const [bestRpcs, ...indexerInfos] = await Promise.all([
      getBestRpcs(PROVIDER_URLS),
      ...indexerInfoPromises,
    ])

    const bestRpc = first(bestRpcs)

    if (bestRpc) {
      queryClient.setQueryData(
        rpcStatusQueryOptions(bestRpc.url).queryKey,
        bestRpc,
      )
    }

    // top RPC results are added to the top of the list
    const bestRpcsUrls = bestRpcs.map(prop("url"))
    const sortedRpcList = Array.from(
      new Set([...bestRpcsUrls, ...PROVIDER_URLS]),
    )

    const bestIndexer = getBestIndexer(
      indexerInfos,
      bestRpc?.blockNumber ?? null,
    )

    useProviderRpcUrlStore.setState({
      rpcUrl: bestRpc?.url ?? ENV.VITE_PROVIDER_URL,
      rpcUrlList: sortedRpcList,
      updatedAt: Date.now(),
      legacyProvider: bestRpc?.legacy ?? false,
      ...(bestIndexer ? { squidUrl: bestIndexer.config.graphqlUrl } : {}),
    })

    setIsBestProviderFound(true)
  }, [])

  useEffect(() => {
    if (isBestProviderFound) return
    fetchBestProvider()
  }, [fetchBestProvider, isBestProviderFound])

  if (!isBestProviderFound) return null

  return children
}
