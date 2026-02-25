import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { getClaimableJourneys } from "@/modules/xcm/history/utils/claim"
import { isOptimisticJourney } from "@/modules/xcm/history/utils/optimistic"

import { xcStore } from "./xcScanStore"

export const createXcScanQueryKey = (address: string) => ["xcscan", address]

type XcScanOptions = {
  claimableOnly?: boolean
}

export const useXcScan = (address: string, options: XcScanOptions = {}) => {
  const { claimableOnly } = options

  return useQuery<XcJourney[]>({
    queryKey: createXcScanQueryKey(address),
    enabled: !!address,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    initialData: [],
    select: claimableOnly ? getClaimableJourneys : undefined,
    queryFn: () => [],
  })
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
          queryClient.setQueryData(queryKey, journeys)
          setIsLoading(false)
          setIsError(false)
        },
        onNew(journey) {
          queryClient.setQueryData<XcJourney[] | undefined>(queryKey, (old) => {
            if (!old) {
              return [journey]
            }
            const prev = old.filter((item) => {
              const isOptimistic =
                isOptimisticJourney(item) &&
                item.originTxPrimary === journey.originTxPrimary
              return !isOptimistic
            })
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
