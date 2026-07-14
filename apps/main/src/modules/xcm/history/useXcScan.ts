import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"

import { getClaimableJourneys } from "@/modules/xcm/history/utils/claim"
import { mergeJourneys } from "@/modules/xcm/history/utils/journey"
import {
  clearPendingHop,
  isIndexedTransferJourney,
  mergeLoadedJourneysWithOptimistic,
  shouldIgnoreIncomingJourney,
  shouldRemoveJourneyForIncoming,
} from "@/modules/xcm/history/utils/optimistic"

import { useBasejumpScan } from "./useBasejumpScan"
import { xcStore } from "./xcScanStore"

export const createXcScanQueryKey = (address: string) => ["xcscan", address]

type XcScanOptions = {
  claimableOnly?: boolean
}

export const useXcScan = (address: string, options: XcScanOptions = {}) => {
  const { claimableOnly } = options

  const xcscan = useQuery<XcJourney[]>({
    queryKey: createXcScanQueryKey(address),
    enabled: !!address,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    initialDataUpdatedAt: 0,
    initialData: [],
    select: claimableOnly ? getClaimableJourneys : undefined,
    queryFn: () => [],
  })

  const bjscan = useBasejumpScan(address)

  const isLoadingXcScan = xcscan.dataUpdatedAt === 0
  const isLoading = claimableOnly
    ? isLoadingXcScan
    : isLoadingXcScan || bjscan.isLoading

  const data = useMemo(() => {
    if (claimableOnly) return xcscan.data
    if (bjscan.isSuccess && xcscan.isSuccess)
      return mergeJourneys(bjscan.data, xcscan.data)
    return xcscan.data
  }, [
    bjscan.data,
    bjscan.isSuccess,
    claimableOnly,
    xcscan.data,
    xcscan.isSuccess,
  ])

  return {
    isLoading,
    data,
  }
}

export const useXcScanSubscription = (address: string) => {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!address) {
      setIsLoading(false)
      return
    }

    function subscribeJourneys() {
      const queryKey = createXcScanQueryKey(address)
      const cachedData = queryClient.getQueryData<XcJourney[]>(queryKey)

      setIsLoading(!cachedData)
      setIsError(false)

      xcStore.subscribe(address, {
        onLoad(journeys) {
          queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
            mergeLoadedJourneysWithOptimistic(address, old, journeys),
          )
          setIsLoading(false)
          setIsError(false)
        },
        onNew(journey) {
          queryClient.setQueryData<XcJourney[] | undefined>(queryKey, (old) => {
            if (!old) {
              return [journey]
            }

            const ignore = shouldIgnoreIncomingJourney(old, journey, address)
            if (ignore) {
              return old
            }

            const prev: XcJourney[] = []

            for (const item of old) {
              if (shouldRemoveJourneyForIncoming(item, journey, address)) {
                // Pending hop is resolved once the indexed journey supersedes the hop leg.
                if (item.originTxPrimary && isIndexedTransferJourney(journey)) {
                  clearPendingHop(address, item.originTxPrimary)
                }
              } else {
                prev.push(item)
              }
            }

            return [journey, ...prev]
          })
        },
        onUpdate(journey, prev) {
          queryClient.setQueryData<XcJourney[] | undefined>(queryKey, (old) => {
            if (!old) return old
            return old.map((item) =>
              item.correlationId === prev.correlationId ? journey : item,
            )
          })
        },
        onError() {
          setIsError(true)
          setIsLoading(false)
        },
      })
    }

    subscribeJourneys()

    return () => {
      xcStore.unsubscribe()
    }
  }, [address, queryClient])

  return {
    isLoading,
    isError,
  }
}
