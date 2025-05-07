import { queryOptions, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export const bestNumberQuery = (context: TProviderContext) => {
  const { isApiLoaded, papi, endpoint } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: [QUERY_KEY_BLOCK_PREFIX, "bestNumber", endpoint],
    queryFn: async () => {
      const [validationData, blockNumber, timestamp] = await Promise.all([
        papi.query.ParachainSystem.ValidationData.getValue({
          at: "best",
        }),
        papi.query.System.Number.getValue({
          at: "best",
        }),
        papi.query.Timestamp.Now.getValue({
          at: "best",
        }),
      ])

      return {
        parachainBlockNumber: blockNumber,
        relaychainBlockNumber: validationData?.relay_parent_number,
        timestamp: Number(timestamp),
      }
    },
  })
}

export const useInvalidateOnBlock = () => {
  const queryClient = useQueryClient()
  const { isLoaded, papi } = useRpcProvider()

  useEffect(() => {
    if (!isLoaded) return

    const sub = papi.query.System.Number.watchValue("best").subscribe({
      next: () => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY_BLOCK_PREFIX],
        })
      },
    })

    return () => {
      sub.unsubscribe()
    }
  }, [isLoaded, papi, queryClient])
}
