import { getBestRpcs } from "@galacticcouncil/utils"
import { useQueryClient } from "@tanstack/react-query"
import { PropsWithChildren, useEffect, useState } from "react"
import { useAsyncFn } from "react-use"
import { first, prop } from "remeda"

import { PROVIDER_URLS } from "@/api/provider"
import { rpcStatusQueryOptions } from "@/api/rpc"
import { useProviderRpcUrlStore } from "@/states/provider"

export const ProvideRpcResolver: React.FC<PropsWithChildren> = ({
  children,
}) => {
  const queryClient = useQueryClient()

  const [isBestProviderFound, setIsBestProviderFound] = useState(
    () => !useProviderRpcUrlStore.getState().autoMode,
  )

  const [, fetchBestProvider] = useAsyncFn(async () => {
    const result = await getBestRpcs(PROVIDER_URLS)

    const bestRpc = first(result)

    if (bestRpc) {
      console.log(bestRpc)
      queryClient.setQueryData(
        rpcStatusQueryOptions(bestRpc.url).queryKey,
        bestRpc,
      )
    }

    // top RPC results are added to the top of the list
    const urls = result.map(prop("url"))
    const sortedRpcList = Array.from(new Set([...urls, ...PROVIDER_URLS]))

    useProviderRpcUrlStore.setState({
      rpcUrl: bestRpc?.url ?? import.meta.env.VITE_PROVIDER_URL,
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
