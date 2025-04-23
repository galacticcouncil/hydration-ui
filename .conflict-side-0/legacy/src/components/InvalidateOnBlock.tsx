import { useQueryClient } from "@tanstack/react-query"
import { ReactNode, useEffect } from "react"
import { QUERY_KEY_PREFIX } from "utils/queryKeys"
import { useRpcProvider } from "providers/rpcProvider"

export const InvalidateOnBlock = (props: { children: ReactNode }) => {
  const { isLoaded, api } = useRpcProvider()
  const queryClient = useQueryClient()

  useEffect(() => {
    if (isLoaded) {
      let cancel: () => void

      api.rpc.chain
        .subscribeNewHeads(() => {
          queryClient.invalidateQueries([QUERY_KEY_PREFIX])
        })
        .then((newCancel) => (cancel = newCancel))

      return () => cancel?.()
    }
  }, [api, queryClient, isLoaded])

  return <>{props.children}</>
}
