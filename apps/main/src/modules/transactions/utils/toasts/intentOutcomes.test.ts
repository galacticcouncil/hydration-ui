import { concat, defer, Observable, of, Subject, throwError } from "rxjs"
import { afterEach, describe, expect, it, onTestFinished, vi } from "vitest"

import {
  IntentOutcome,
  watchIntentOutcomes,
} from "@/modules/transactions/utils/toasts/intentOutcomes"

type Block = { hash: string }

const byBlock: Record<
  string,
  { resolved?: bigint; expired?: bigint; canceled?: bigint }
> = {
  "0x1": { resolved: 1n },
  "0x2": { expired: 2n },
  "0x3": { canceled: 3n },
}

const payloads = <T>(id: bigint | undefined, payload: T) =>
  id === undefined ? [] : [{ payload }]

const events = {
  IntentResolved: {
    get: async (hash: string) => {
      if (hash === "0xbad") throw new Error("BlockNotPinnedError")
      const id = byBlock[hash]?.resolved
      return payloads(id, { id: id ?? 0n, amount_out: 10n })
    },
  },
  IntentExpired: {
    get: async (hash: string) => {
      const id = byBlock[hash]?.expired
      return payloads(id, { id: id ?? 0n })
    },
  },
  IntentCanceled: {
    get: async (hash: string) => {
      const id = byBlock[hash]?.canceled
      return payloads(id, { id: id ?? 0n })
    },
  },
}

const watch = (blocks$: Observable<Block>) => {
  const outcomes: IntentOutcome[] = []
  const sub = watchIntentOutcomes(blocks$, events).subscribe((o) =>
    outcomes.push(o),
  )
  onTestFinished(() => sub.unsubscribe())
  return outcomes
}

const flush = () => vi.advanceTimersByTimeAsync(0)

describe("watchIntentOutcomes", () => {
  vi.useFakeTimers()
  afterEach(() => vi.clearAllTimers())

  it("reads outcomes from each new block", async () => {
    const blocks$ = new Subject<Block>()
    const outcomes = watch(blocks$)

    blocks$.next({ hash: "0x1" })
    blocks$.next({ hash: "0x2" })
    blocks$.next({ hash: "0x3" })
    await flush()

    expect(outcomes).toHaveLength(3)
    expect(outcomes).toEqual(
      expect.arrayContaining([
        { id: 1n, kind: "resolved", amountOut: 10n },
        { id: 2n, kind: "unfilled" },
        { id: 3n, kind: "unfilled" },
      ]),
    )
  })

  it("skips a block it can't read and keeps going", async () => {
    const blocks$ = new Subject<Block>()
    const outcomes = watch(blocks$)

    blocks$.next({ hash: "0xbad" })
    blocks$.next({ hash: "0x1" })
    await flush()

    expect(outcomes).toEqual([{ id: 1n, kind: "resolved", amountOut: 10n }])
  })

  it("resubscribes after the stream dies without replaying seen blocks", async () => {
    const connections: Observable<Block>[] = [
      concat(
        of({ hash: "0x1" }),
        throwError(() => new Error("dropped")),
      ),
      of({ hash: "0x1" }, { hash: "0x2" }),
    ]
    let connection = 0
    const outcomes = watch(
      defer(() => connections[connection++] ?? new Subject<Block>()),
    )

    await flush()
    expect(outcomes).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(1_000)
    expect(outcomes).toEqual([
      { id: 1n, kind: "resolved", amountOut: 10n },
      { id: 2n, kind: "unfilled" },
    ])
  })
})
