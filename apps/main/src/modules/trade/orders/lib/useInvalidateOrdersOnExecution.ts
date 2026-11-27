import { NECKWORK_ACCOUNT_KEY } from "@galacticcouncil/indexer/neckwork"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQueryClient } from "@tanstack/react-query"
import { useCallback, useEffect, useMemo, useRef } from "react"
import { filter, map, merge, Observable } from "rxjs"

import { useAccountIntents } from "@/api/intents"
import { useObservable } from "@/hooks/useObservable"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useHasIntentPallet } from "@/states/intents"
import { useNeckworkSyncStore } from "@/states/neckwork"

const INVALIDATE_DELAY = 5_000

type EventBatch<T> = {
  readonly block: { readonly number: number }
  readonly events: ReadonlyArray<{ readonly payload: T }>
}

type EventWatcher<T> = {
  readonly watch: () => Observable<EventBatch<T>>
}

const ownedEvents = <T extends { readonly id: number | bigint }>(
  watcher: EventWatcher<T>,
  ids: () => ReadonlySet<string>,
): Observable<number> =>
  watcher.watch().pipe(
    filter(({ events }) =>
      events.some(({ payload }) => ids().has(String(payload.id))),
    ),
    map(({ block }) => block.number),
  )

/** Invalidate order queries when ids change or an open order executes. Presence subscriptions miss executions. */
export const useInvalidateOrdersOnExecution = () => {
  const queryClient = useQueryClient()
  const { account } = useAccount()
  const { papi, isReady } = useRpcProvider()
  const hasIntentPallet = useHasIntentPallet()
  const armNeckworkSync = useNeckworkSyncStore((state) => state.arm)

  const { data: intents, isLoading: isIntentsLoading } = useAccountIntents(
    account?.address ?? "",
  )

  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const invalidate = useCallback(() => {
    if (timeout.current) return

    timeout.current = setTimeout(() => {
      timeout.current = null
      void queryClient.invalidateQueries({ queryKey: ["intents", "values"] })
      void queryClient.invalidateQueries({ queryKey: NECKWORK_ACCOUNT_KEY })
    }, INVALIDATE_DELAY)
  }, [queryClient])

  useEffect(
    () => () => {
      if (timeout.current) clearTimeout(timeout.current)
    },
    [],
  )

  const intentKey = intents.map(({ id }) => String(id)).join(",")

  const intentIdsRef = useRef<ReadonlySet<string>>(new Set())

  useEffect(() => {
    intentIdsRef.current = new Set(intentKey ? intentKey.split(",") : [])
  }, [intentKey])

  const seenKey = useRef<string | null>(null)

  useEffect(() => {
    if (isIntentsLoading) return

    if (seenKey.current !== null && seenKey.current !== intentKey) invalidate()

    seenKey.current = intentKey
  }, [isIntentsLoading, intentKey, invalidate])

  const events$ = useMemo(() => {
    if (!isReady || !hasIntentPallet) return

    const { Intent } = papi.event
    const intentSet = () => intentIdsRef.current

    return merge(
      ownedEvents(Intent.DcaTradeExecuted, intentSet),
      ownedEvents(Intent.IntentResovedPartially, intentSet),
    )
  }, [isReady, papi, hasIntentPallet])

  const onExecution = useCallback(
    (blockNumber: number) => {
      invalidate()
      armNeckworkSync(blockNumber)
    },
    [invalidate, armNeckworkSync],
  )

  useObservable(events$, { enabled: isReady, onUpdate: onExecution })
}
