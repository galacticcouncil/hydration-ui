import { SdkCtx } from "@galacticcouncil/sdk-next"
import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns/constants"
import { useMemo } from "react"

import { useObservable } from "@/hooks/useObservable"
import { usePapiValue } from "@/hooks/usePapiValue"
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

export const useRelayChainBlockNumber = (disableRefetch?: boolean) => {
  const { data } = useQuery({
    ...bestNumberQuery(useRpcProvider()),
    notifyOnChangeProps: disableRefetch ? [] : undefined,
  })

  return data?.relaychainBlockNumber
}

export const useBestNumber = () => {
  return useQuery(bestNumberQuery(useRpcProvider()))
}

export const useInvalidateOnBlock = () => {
  const queryClient = useQueryClient()
  const { papi, isApiLoaded } = useRpcProvider()

  const observable = useMemo(() => {
    if (!isApiLoaded) return
    return papi.query.System.Number.watchValue({ at: "best" })
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

export const useBlockTimestamp = () =>
  usePapiValue("Timestamp.Now", [{ at: "best" }])

export const chainSpecDataQuery = (context: TProviderContext) => {
  const { papi, papiClient, isApiLoaded } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: ["chainSpecData"],
    queryFn: async () => {
      const [chainSpecData, lastRuntimeUpgrade] = await Promise.all([
        papiClient.getChainSpecData(),
        papi.query.System.LastRuntimeUpgrade.getValue(),
      ])

      return {
        chainSpecData,
        lastRuntimeUpgrade,
      }
    },
    staleTime: Infinity,
  })
}

export const useChainSpecData = () => {
  return useQuery(chainSpecDataQuery(useRpcProvider()))
}

export const blockWeightsQuery = (context: TProviderContext) => {
  const { isApiLoaded, papi } = context

  return queryOptions({
    enabled: isApiLoaded,
    queryKey: ["blockWeights"],
    queryFn: () => papi.constants.System.BlockWeights(),
    staleTime: Infinity,
  })
}

export const blockTimeQuery = (sdk: SdkCtx) => {
  return queryOptions({
    queryKey: ["blockTime"],
    enabled: Object.keys(sdk).length > 0,
    queryFn: () => sdk.client.params.getBlockTime(),
    staleTime: millisecondsInHour,
    gcTime: millisecondsInHour,
    refetchOnWindowFocus: false,
  })
}

export const useBlockTime = () => {
  const { sdk } = useRpcProvider()
  return useQuery(blockTimeQuery(sdk))
}

export const useEstimateFutureBlockTimestamp = (blocksFromNow: number) => {
  const provider = useRpcProvider()
  const { data } = useQuery(bestNumberQuery(provider))
  const { data: blockTimeMs } = useBlockTime()

  const timestamp = data?.timestamp
  if (
    !timestamp ||
    !blockTimeMs ||
    !Number.isFinite(timestamp) ||
    !Number.isFinite(blockTimeMs) ||
    !Number.isFinite(blocksFromNow)
  ) {
    return null
  }

  return timestamp + blockTimeMs * blocksFromNow
}
