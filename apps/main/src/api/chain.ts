import { queryOptions, useQueryClient } from "@tanstack/react-query"
import { useEffect, useRef } from "react"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const bestNumberQuery = (context: TProviderContext) => {
  const { isApiLoaded, api, endpoint } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "bestNumber", endpoint],
    queryFn: async () => {
      const [validationData, parachainBlockNumber, timestamp] =
        await Promise.all([
          api.query.parachainSystem.validationData(),
          api.derive.chain.bestNumber(),
          api.query.timestamp.now(),
        ])

      const relaychainBlockNumber = validationData.unwrap().relayParentNumber
      return {
        parachainBlockNumber: parachainBlockNumber.toNumber(),
        relaychainBlockNumber: relaychainBlockNumber.toNumber(),
        timestamp: timestamp.toNumber(),
      }
    },
  })
}

export const useInvalidateOnBlock = () => {
  const queryClient = useQueryClient()
  const { api, isLoaded } = useRpcProvider()

  const cancelRef = useRef<VoidFunction | null>(null)

  useEffect(() => {
    if (isLoaded) {
      api.rpc.chain
        .subscribeNewHeads(() => {
          queryClient.invalidateQueries({
            queryKey: [QUERY_KEY_BLOCK_PREFIX],
          })
        })
        .then((cancel) => {
          cancelRef.current = cancel
        })
    }

    return () => {
      cancelRef.current?.()
    }
  }, [isLoaded, api, queryClient])
}
