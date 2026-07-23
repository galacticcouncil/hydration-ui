import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query"
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

// Block-tagged query domains (the second key segment after QUERY_KEY_BLOCK_PREFIX)
// that are only relevant on a specific route. Off their route there is no observer
// to render the data, so refetching them on every block is pure waste. They are
// invalidated per block only while the matching route is mounted; everywhere else
// they refetch lazily on next mount.
const ROUTE_SCOPED_BLOCK_DOMAINS: Record<string, string> = {
  trade: "/trade",
  xcm: "/cross-chain",
}

// domains that are driven by their own cadence (spotPrice: 10s self-refresh via
// spotPriceQuery; see api/spotPrice.ts) and must not be force-refetched every block.
const SELF_REFRESHING_BLOCK_DOMAINS = new Set(["spotPrice"])

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
      // skip the per-block refetch storm entirely while the tab is hidden;
      // queries refetch on focus (refetchOnWindowFocus) when the user returns.
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "hidden"
      ) {
        return
      }

      const pathname =
        typeof window !== "undefined" ? window.location.pathname : ""

      queryClient.invalidateQueries({
        predicate: (query) => {
          const [prefix, domain] = query.queryKey as [unknown, unknown]
          if (prefix !== QUERY_KEY_BLOCK_PREFIX) return false

          const domainKey = typeof domain === "string" ? domain : ""

          // prices refresh on their own 10s cadence, never per block
          if (SELF_REFRESHING_BLOCK_DOMAINS.has(domainKey)) return false

          // route-scoped domains only refetch while on their route
          const routePrefix = ROUTE_SCOPED_BLOCK_DOMAINS[domainKey]
          if (routePrefix) return pathname.startsWith(routePrefix)

          // everything else (bestNumber, tx-flow previews, wallet, etc.) stays
          // fresh — these are either app-wide or gated by their own `enabled`.
          return true
        },
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
