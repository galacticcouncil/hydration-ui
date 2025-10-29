import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"

import { useObservable } from "@/hooks/useObservable"
import { usePapiObservableQuery } from "@/hooks/usePapiObservableQuery"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

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

export const useRelayChainBlockNumber = () => {
  const { data } = useQuery(bestNumberQuery(useRpcProvider()))

  return data?.relaychainBlockNumber
}

export const useInvalidateOnBlock = () => {
  const queryClient = useQueryClient()
  const { papi, isApiLoaded } = useRpcProvider()

  const observable = useMemo(() => {
    if (!isApiLoaded) return
    return papi.query.System.Number.watchValue("best")
  }, [isApiLoaded, papi])

  useObservable(observable, {
    enabled: isApiLoaded,
    onUpdate: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY_BLOCK_PREFIX],
      })
    },
  })
}

export const blockTimeQuery = (context: TProviderContext) => {
  const { isApiLoaded, sdk } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: ["blockTime"],
    queryFn: () => sdk.api.scheduler.blockTime,
    staleTime: Infinity,
  })
}

export const useEstimateFutureBlockTimestamp = (blocksFromNow: number) => {
  const provider = useRpcProvider()
  const { data } = useQuery(bestNumberQuery(provider))

  const timestamp = data?.timestamp || 0
  const periodMs = provider.slotDurationMs * blocksFromNow

  return timestamp + periodMs
}

export const useBlockTimestamp = () =>
  usePapiObservableQuery("Timestamp.Now", ["best"])
