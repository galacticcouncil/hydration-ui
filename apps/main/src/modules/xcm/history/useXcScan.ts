import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { xcStore } from "./xcScanStore"

const createXcScanQueryKey = (address: string) => ["xcscan", address]

export const useXcScan = (address: string) => {
  return useQuery<XcJourney[]>({
    queryKey: createXcScanQueryKey(address),
    enabled: !!address,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    initialData: [],
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
            return [journey, ...old]
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
