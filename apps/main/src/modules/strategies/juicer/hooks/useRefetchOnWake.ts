import { useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

import { JUICER_QUERY_KEY_PREFIX } from "@/modules/strategies/juicer/utils/queryKeys"

const TICK_MS = 5_000
/** a tick this late means the tab's timers were throttled or asleep */
const WAKE_GAP_MS = 20_000

/**
 * Vault data is polled on timers, and browsers stall timers in background
 * tabs, some while still reporting the tab visible, so capacity, withdrawal
 * progress and estimates can be minutes old when the user looks again.
 * Refetch every Juicer read as soon as the page runs again.
 */
export const useRefetchOnWake = () => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const refetch = () =>
      queryClient.invalidateQueries({
        queryKey: [JUICER_QUERY_KEY_PREFIX],
      })

    let lastTick = Date.now()
    const timer = setInterval(() => {
      const now = Date.now()
      if (now - lastTick > WAKE_GAP_MS) void refetch()
      lastTick = now
    }, TICK_MS)
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") void refetch()
    }
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      clearInterval(timer)
      document.removeEventListener("visibilitychange", onVisibilityChange)
    }
  }, [queryClient])
}
