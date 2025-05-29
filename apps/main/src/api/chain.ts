import { queryOptions, useQueryClient } from "@tanstack/react-query"

import { usePapiObservableQuery } from "@/hooks/usePapiObservableQuery"
import { TProviderContext } from "@/providers/rpcProvider"
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

  usePapiObservableQuery("System.Number", ["best"], {
    onUpdate: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_BLOCK_PREFIX],
      })
    },
  })
}
