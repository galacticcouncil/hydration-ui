import {
  catchError,
  distinct,
  EMPTY,
  from,
  mergeMap,
  Observable,
  repeat,
  retry,
} from "rxjs"

export type IntentOutcome =
  | {
      readonly id: bigint
      readonly kind: "resolved"
      readonly amountOut: bigint
    }
  | { readonly id: bigint; readonly kind: "unfilled" }

type EventGetter<T> = {
  readonly get: (
    blockHash: string,
  ) => Promise<ReadonlyArray<{ readonly payload: T }>>
}

/** The slice of `papi.event.Intent` the intent toasts read. */
export type IntentEventSource = {
  readonly IntentResolved: EventGetter<{
    readonly id: bigint
    readonly amount_out: bigint
  }>
  readonly IntentExpired: EventGetter<{ readonly id: bigint }>
  readonly IntentCanceled: EventGetter<{ readonly id: bigint }>
}

const RESUBSCRIBE_DELAY_MS = 1_000

const readBlockOutcomes = async (
  events: IntentEventSource,
  blockHash: string,
): Promise<IntentOutcome[]> => {
  const [resolved, expired, canceled] = await Promise.all([
    events.IntentResolved.get(blockHash),
    events.IntentExpired.get(blockHash),
    events.IntentCanceled.get(blockHash),
  ])

  return [
    ...resolved.map(
      ({ payload }): IntentOutcome => ({
        id: payload.id,
        kind: "resolved",
        amountOut: payload.amount_out,
      }),
    ),
    // Expired and canceled intents both return the funds
    ...[...expired, ...canceled].map(
      ({ payload }): IntentOutcome => ({ id: payload.id, kind: "unfilled" }),
    ),
  ]
}

/**
 * Terminal outcome of every intent, read from each new block as it's imported
 * (best, not finalized). `event.*.watch()` only follows finalized blocks and
 * dies for good on a `BlockNotPinnedError`; here a block that can't be read is
 * skipped, and `blocks$` is resubscribed when papi completes or errors it.
 */
export const watchIntentOutcomes = (
  blocks$: Observable<{ readonly hash: string }>,
  events: IntentEventSource,
): Observable<IntentOutcome> =>
  blocks$.pipe(
    repeat({ delay: RESUBSCRIBE_DELAY_MS }),
    retry({ delay: RESUBSCRIBE_DELAY_MS }),
    // ponytail: a resubscribe replays known blocks; the seen-set grows for the
    // subscription's life, which only lasts while an intent toast is pending
    distinct(({ hash }) => hash),
    mergeMap(({ hash }) =>
      from(readBlockOutcomes(events, hash)).pipe(catchError(() => EMPTY)),
    ),
    mergeMap((outcomes) => outcomes),
  )
