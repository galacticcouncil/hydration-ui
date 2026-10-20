import { isAddressValidOnHydration } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useMemo, useState } from "react"
import { sortBy } from "remeda"

import { useScanJourneys } from "@/modules/xcm/history/useScanJourneys"
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
import { withoutScanTwins } from "@/modules/xcm/history/utils/scan"

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

  // What the transfers scan indexes comes from it, xc-scan has the rest
  const scan = useScanJourneys(address)

  const data = useMemo(() => {
    const indexed = isIndexed ? xcscan.data : NO_JOURNEYS
    // xc-scan's copies of the scan's transfers stand in until it answers
    const journeys = scan.data ? withoutScanTwins(indexed, scan.data) : indexed
    const scanJourneys = scan.data ?? NO_JOURNEYS
    if (!scanJourneys.length) return journeys

    return sortBy(
      [
        ...withoutPlaceholdersOf(journeys, scanJourneys),
        ...(claimableOnly ? getClaimableJourneys(scanJourneys) : scanJourneys),
      ],
      [journeyDate, "desc"],
    )
  }, [claimableOnly, isIndexed, scan.data, xcscan.data])

  return {
    // The scan's rows replace xc-scan's, so the list waits for its first answer
    isLoading: (isIndexed && xcscan.dataUpdatedAt === 0) || scan.isLoading,
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
