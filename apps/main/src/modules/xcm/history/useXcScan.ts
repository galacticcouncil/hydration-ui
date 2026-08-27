import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { getClaimableJourneys } from "@/modules/xcm/history/utils/claim"
import {
  addJourney,
  mergeLoadedJourneys,
} from "@/modules/xcm/history/utils/optimistic"

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

  return {
    isLoading: xcscan.dataUpdatedAt === 0,
    data: xcscan.data,
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
            mergeLoadedJourneys(old, journeys, address),
          )
          setIsLoading(false)
          setIsError(false)
        },
        onNew(journey) {
          queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
            addJourney(old ?? [], journey, address),
          )
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
