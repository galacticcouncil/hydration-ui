import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { filter, merge, Observable } from "rxjs"

import { useAccountIntents } from "@/api/intents"
import { useObservable } from "@/hooks/useObservable"
import { useChainScheduleIds } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useChainOrdersData"
import { useRpcProvider } from "@/providers/rpcProvider"

const INVALIDATE_DELAY = 5_000

type EventBatch<T> = {
  readonly events: ReadonlyArray<{ readonly payload: T }>
}

type EventWatcher<T> = {
  readonly watch: () => Observable<EventBatch<T>>
}

// Neither DCA nor Intent events are part of the whitelisted descriptors, so
// they can only be watched through the unsafe api — typed here the same way
// api/dcaStorage.ts types the storage side.
type UnsafeOrderEvents = {
  readonly DCA: {
    readonly TradeExecuted: EventWatcher<{ readonly id: number }>
    readonly TradeFailed: EventWatcher<{ readonly id: number }>
  }
  readonly Intent: {
    readonly DcaTradeExecuted: EventWatcher<{ readonly id: bigint }>
    readonly IntentResovedPartially: EventWatcher<{ readonly id: bigint }>
  }
}

const ownedEvents = <T extends { readonly id: number | bigint }>(
  watcher: EventWatcher<T>,
  ids: () => ReadonlySet<string>,
): Observable<unknown> =>
  watcher
    .watch()
    .pipe(
      filter(({ events }) =>
        events.some(({ payload }) => ids().has(String(payload.id))),
      ),
    )

/**
 * Legacy orders read from chain, indexer and Grafana, and none of them poll.
 * The two papi subscriptions behind them watch presence indexes
 * (DCA.ScheduleOwnership, Intent.AccountIntents), so an execution — which only
 * moves DCA.RemainingAmounts and Intent.Intents — never fires them, and the
 * tables sit frozen until a hard refresh.
 *
 * Two triggers cover it: the id set changing (an order opened or closed, from
 * subscriptions we already pay for) and an execution event for an id that is
 * still open. Completion events are redundant under the first trigger, and
 * leaving them out avoids racing the id removal that happens in the same block.
 */
export const useInvalidateOrdersOnExecution = () => {
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const { papiClient, isApiLoaded, featureFlags } = useRpcProvider()
  const { isIceEnabled } = featureFlags

  const { scheduleIds, isLoading: isSchedulesLoading } = useChainScheduleIds()
  const { data: intents, isLoading: isIntentsLoading } = useAccountIntents(
    account?.address ?? "",
  )

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const invalidate = useCallback(() => {
    if (timeout.current) return

    timeout.current = setTimeout(() => {
      timeout.current = null
      void queryClient.invalidateQueries({ queryKey: ["trade", "orders"] })
      void queryClient.invalidateQueries({ queryKey: ["intents", "values"] })
    }, INVALIDATE_DELAY)
  }, [queryClient])

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current)
    },
    [],
  )

  const scheduleKey = scheduleIds.join(",")
  const intentKey = intents.map(({ id }) => String(id)).join(",")

  const idsRef = useRef<{
    schedules: ReadonlySet<string>
    intents: ReadonlySet<string>
  }>({ schedules: new Set(), intents: new Set() })

  useEffect(() => {
    idsRef.current = {
      schedules: new Set(scheduleKey ? scheduleKey.split(",") : []),
      intents: new Set(intentKey ? intentKey.split(",") : []),
    }
  }, [scheduleKey, intentKey])

  // Trigger 1: an order opened or closed. Skipped while either source is still
  // loading so the initial empty -> populated transition doesn't count.
  const isLoading = isSchedulesLoading || isIntentsLoading
  const seenKey = useRef<string | null>(null)

  useEffect(() => {
    if (isLoading) return

    const key = `${scheduleKey}|${intentKey}`

    if (seenKey.current !== null && seenKey.current !== key) invalidate()

    seenKey.current = key
  }, [isLoading, scheduleKey, intentKey, invalidate])

  // Trigger 2: an execution against an order that is still open. Reads the id
  // sets through a ref so a changing set never resubscribes the watchers.
  const events$ = useMemo(() => {
    if (!isApiLoaded) return

    const { DCA, Intent } = papiClient.getUnsafeApi()
      .event as unknown as UnsafeOrderEvents

    const scheduleSet = () => idsRef.current.schedules
    const intentSet = () => idsRef.current.intents

    return merge(
      ownedEvents(DCA.TradeExecuted, scheduleSet),
      ownedEvents(DCA.TradeFailed, scheduleSet),
      ...(isIceEnabled
        ? [
            ownedEvents(Intent.DcaTradeExecuted, intentSet),
            ownedEvents(Intent.IntentResovedPartially, intentSet),
          ]
        : []),
    )
  }, [isApiLoaded, papiClient, isIceEnabled])

  useObservable(events$, { enabled: isApiLoaded, onUpdate: invalidate })
}
