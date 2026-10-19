import { subscribeScanEvents } from "@galacticcouncil/indexer/scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { scanJourneysQuery, transfersScanClient } from "@/api/scan"

// A burst of row changes refetches once
const REFETCH_DEBOUNCE_MS = 500

export const useScanJourneys = (address: string) => {
  const queryClient = useQueryClient()

  return useQuery(scanJourneysQuery(queryClient, address))
}

/**
 * Refetches the account's scan journeys when the scan's transfers change, and
 * on a reconnect, since a dropped stream replays nothing.
 */
export const useScanJourneysSubscription = (address: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!address) return

    const { queryKey } = scanJourneysQuery(queryClient, address)
    let timeout: ReturnType<typeof setTimeout> | undefined
    let isReconnect = false
    const refetch = () => {
      clearTimeout(timeout)
      timeout = setTimeout(
        () => queryClient.invalidateQueries({ queryKey }),
        REFETCH_DEBOUNCE_MS,
      )
    }

    const unsubscribe = subscribeScanEvents(
      transfersScanClient,
      ["ntt", "utxo"],
      {
        onChange: refetch,
        // The first connect finds the journeys just loaded
        onOpen: () => {
          if (isReconnect) refetch()
          isReconnect = true
        },
      },
    )

    return () => {
      clearTimeout(timeout)
      unsubscribe()
    }
  }, [address, queryClient])
}
