import { useQueryClient } from "@tanstack/react-query"
import {
  getBestProvider,
  PROVIDER_URLS,
  useProviderRpcUrlStore,
} from "api/provider"
import { PropsWithChildren, useEffect, useState } from "react"
import { useAsyncFn } from "react-use"
import { QUERY_KEYS } from "utils/queryKeys"
import { prop } from "utils/rx"

export const ProviderResolver: React.FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient()

  const [isBestProviderFound, setIsBestProviderFound] = useState(
    () => !useProviderRpcUrlStore.getState().autoMode,
  )

  const [, fetchBestProvider] = useAsyncFn(async () => {
    const result = await getBestProvider()

    const bestRpc = result[0]
    queryClient.setQueryData(QUERY_KEYS.rpcStatus(bestRpc.url), bestRpc)

    // top RPC results are added to the top of the list
    const urls = result.map(prop("url"))
    const sortedRpcList = Array.from(new Set([...urls, ...PROVIDER_URLS]))

    useProviderRpcUrlStore.setState({
      rpcUrl: bestRpc.url,
      rpcUrlList: sortedRpcList,
      updatedAt: Date.now(),
    })

    setIsBestProviderFound(true)
  }, [])

  useEffect(() => {
    if (isBestProviderFound) {
      const loader = window.document.querySelector(".loader-container")
      if (loader) {
        // Removes initial static loader in index.html.
        loader.remove()
      }

      return
    }

    fetchBestProvider()
  }, [fetchBestProvider, isBestProviderFound])

  if (!isBestProviderFound) return null

  return children
}
