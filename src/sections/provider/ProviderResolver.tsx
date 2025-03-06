import { useQueryClient } from "@tanstack/react-query"
import {
  getBestProvider,
  PROVIDER_URLS,
  useProviderRpcUrlStore,
} from "api/provider"
import { PropsWithChildren, useEffect, useRef, useState } from "react"
import { useMount } from "react-use"
import { identity } from "utils/helpers"
import { QUERY_KEYS } from "utils/queryKeys"
import { uniqBy } from "utils/rx"

export const ProviderResolver: React.FC<PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient()

  const stateRef = useRef(useProviderRpcUrlStore.getState())
  const isInitialAutoMode = !!stateRef.current.autoMode

  const [isBestProviderFound, setIsBestRpcFound] = useState(!isInitialAutoMode)

  useMount(() => {
    if (!isInitialAutoMode) return

    getBestProvider((result) => {
      const { url } = result
      queryClient.setQueryData(QUERY_KEYS.rpcStatus(url), result)

      const sortedRpcList = uniqBy(identity, [url, ...PROVIDER_URLS])
      useProviderRpcUrlStore.getState().setRpcUrlList(sortedRpcList, Date.now())

      setIsBestRpcFound(true)
    })
  })

  useEffect(() => {
    if (isBestProviderFound) {
      const loader = window.document.querySelector(".loader-container")
      if (loader) {
        // Removes initial static loader in index.html.
        loader.remove()
      }
    }
  }, [isBestProviderFound])

  if (!isBestProviderFound) return null

  return children
}
