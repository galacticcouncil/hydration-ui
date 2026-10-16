import { isAddressValidOnHydration } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sortBy } from "remeda"

import { useNearJourneys } from "@/modules/xcm/history/useNearJourneys"
import { getClaimableJourneys } from "@/modules/xcm/history/utils/claim"
import {
  getVisibleJourneys,
  isXcSwapReceiverJourney,
  journeyDate,
} from "@/modules/xcm/history/utils/journey"
import {
  addJourney,
  mergeLoadedJourneys,
  withoutPlaceholdersOf,
} from "@/modules/xcm/history/utils/optimistic"

import { xcStore } from "./xcScanStore"

export const createXcScanQueryKey = (address: string) => ["xcscan", address]

const NO_JOURNEYS: XcJourney[] = []

// xc-scan answers a NEAR id or a Zcash address with a 500, so only substrate
// and evm accounts are looked up there
export const isXcScanAddress = (address: string) =>
  isAddressValidOnHydration(address)

type XcScanOptions = {
  claimableOnly?: boolean
}

export const useXcScan = (address: string, options: XcScanOptions = {}) => {
  const { claimableOnly } = options
  const isIndexed = isXcScanAddress(address)

  const xcscan = useQuery<XcJourney[]>({
    queryKey: createXcScanQueryKey(address),
    enabled: isIndexed,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    initialDataUpdatedAt: 0,
    initialData: [],
    select: claimableOnly ? getClaimableJourneys : undefined,
    queryFn: () => [],
  })

  // NEAR legs xc-scan doesn't index yet come from Wormholescan
  const near = useNearJourneys(address)

  const data = useMemo(() => {
    const journeys = isIndexed ? xcscan.data : NO_JOURNEYS
    const nearJourneys = near.data ?? NO_JOURNEYS
    if (!nearJourneys.length) return journeys

    return sortBy(
      [
        ...withoutPlaceholdersOf(journeys, nearJourneys),
        ...(claimableOnly ? getClaimableJourneys(nearJourneys) : nearJourneys),
      ],
      [journeyDate, "desc"],
    )
  }, [claimableOnly, isIndexed, near.data, xcscan.data])

  return {
    isLoading: isIndexed ? xcscan.dataUpdatedAt === 0 : near.isLoading,
    data,
  }
}

export const useXcScanSubscription = (address: string) => {
  const queryClient = useQueryClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  useEffect(() => {
    if (!isXcScanAddress(address)) {
      setIsLoading(false)
      return
    }

    function subscribeJourneys() {
      const queryKey = createXcScanQueryKey(address)
      const cachedData = queryClient.getQueryData<XcJourney[]>(queryKey)

      setIsLoading(!cachedData)
      setIsError(false)

      xcStore
        .subscribe(address, {
          onLoad(journeys) {
            queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
              mergeLoadedJourneys(old, getVisibleJourneys(journeys), address),
            )
            setIsLoading(false)
            setIsError(false)
          },
          onNew(journey) {
            if (isXcSwapReceiverJourney(journey)) return

            queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
              addJourney(old ?? [], journey, address),
            )
          },
          onUpdate(journey, prev) {
            queryClient.setQueryData<XcJourney[] | undefined>(
              queryKey,
              (old) => {
                if (!old) return old
                return old.map((item) =>
                  item.correlationId === prev.correlationId ? journey : item,
                )
              },
            )
          },
          onError() {
            setIsError(true)
            setIsLoading(false)
          },
        })
        // The first load rejects instead: onError covers only the stream after it
        .catch(() => {
          setIsError(true)
          setIsLoading(false)
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
