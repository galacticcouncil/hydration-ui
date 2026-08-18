import {
  NECKWORK_ACCOUNT_KEY,
  neckworkStatusQuery,
} from "@galacticcouncil/indexer/neckwork"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { neckworkClient } from "@/api/provider"
import { useNeckworkEnabled, useNeckworkSyncStore } from "@/states/neckwork"

const STATUS_POLL_INTERVAL = 10_000

/** Give up waiting for the indexer after this long and refresh anyway. */
const ARM_TIMEOUT = 120_000

/**
 * Bridges the gap between "my tx landed in a block" and "the indexer can see
 * it". While armed, polls the cheap /v1/status endpoint instead of the account
 * queries themselves, then invalidates them once — one small request loop
 * rather than refetching every mounted table on a timer.
 *
 * Mounted once, in __root.
 */
export const useNeckworkSync = () => {
  const queryClient = useQueryClient()
  const neckworkEnabled = useNeckworkEnabled()

  const armedForBlock = useNeckworkSyncStore((state) => state.armedForBlock)
  const armedAt = useNeckworkSyncStore((state) => state.armedAt)
  const disarm = useNeckworkSyncStore((state) => state.disarm)

  const isArmed = armedForBlock !== null

  const { data: status } = useQuery({
    ...neckworkStatusQuery(neckworkClient),
    enabled: neckworkEnabled && isArmed,
    refetchInterval: STATUS_POLL_INTERVAL,
  })

  const indexedBlock = status?.blockHeight
  const isIndexed =
    !!indexedBlock && !!armedForBlock && indexedBlock >= armedForBlock

  // ponytail: evaluated on render, and the poll re-renders every 10s while
  // armed — no separate timer needed
  const isTimedOut = !!armedAt && Date.now() - armedAt >= ARM_TIMEOUT

  useEffect(() => {
    if (!isArmed) return

    // nothing polls while neckwork is off, so nothing would ever disarm us
    if (!neckworkEnabled) {
      disarm()
      return
    }

    if (!isIndexed && !isTimedOut) return

    // on timeout the data may still be stale, but a frozen table is worse than
    // one wasted refetch — the staleTime floor takes over from here
    disarm()
    queryClient.invalidateQueries({ queryKey: NECKWORK_ACCOUNT_KEY })
  }, [isArmed, isIndexed, isTimedOut, neckworkEnabled, disarm, queryClient])
}
