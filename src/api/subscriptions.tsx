import { useEffect, useRef } from "react"
import { useSDKPools } from "./pools"
import { useRpcProvider } from "providers/rpcProvider"
import { useQueryClient } from "@tanstack/react-query"
import { QUERY_KEY_PREFIX } from "utils/queryKeys"

export const QuerySubscriptions = () => {
  const { isLoaded } = useRpcProvider()
  if (!isLoaded) return null
  return (
    <>
      <InvalidateOnBlockSubscription />
      <OmnipoolAssetsSubscription />
    </>
  )
}

export const InvalidateOnBlockSubscription = () => {
  const queryClient = useQueryClient()
  const { api, isLoaded } = useRpcProvider()

  const cancelRef = useRef<VoidFunction | null>(null)

  useEffect(() => {
    if (isLoaded) {
      api.rpc.chain
        .subscribeNewHeads(() => {
          queryClient.invalidateQueries([QUERY_KEY_PREFIX])
        })
        .then((cancel) => {
          cancelRef.current = cancel
        })
    }

    return () => {
      cancelRef.current?.()
    }
  }, [isLoaded, api, queryClient])

  return null
}

const OmnipoolAssetsSubscription = () => {
  useSDKPools()

  return null
}
