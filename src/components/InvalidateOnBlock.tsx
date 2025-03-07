import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { QUERY_KEY_PREFIX } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"

export const InvalidateOnBlock = () => {
  const { isLoaded, api } = useRpcProvider()
  const queryClient = useQueryClient()

  useEffect(() => {
    let cancel: () => void

    if (isLoaded) {
      api.rpc.chain
        .subscribeNewHeads(() => {
          queryClient.invalidateQueries([QUERY_KEY_PREFIX])
        })
        .then((newCancel) => (cancel = newCancel))
    }

    return () => cancel?.()
  }, [api, queryClient, isLoaded])

  return null
}
