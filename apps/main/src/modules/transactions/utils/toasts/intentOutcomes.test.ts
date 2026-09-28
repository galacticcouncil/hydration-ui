import { Subject } from "rxjs"
import { describe, expect, it } from "vitest"

import {
  IntentOutcome,
  watchIntentOutcomes,
} from "@/modules/transactions/utils/toasts/intentOutcomes"

const flush = () => new Promise((resolve) => setTimeout(resolve, 0))

const setup = () => {
  const blocks$ = new Subject<{ hash: string }>()
  const byBlock: Record<string, { resolved?: bigint; expired?: bigint }> = {
    "0x1": { resolved: 1n },
    "0x2": { expired: 2n },
  }
  const events = {
    IntentResolved: {
      get: async (hash: string) => {
        if (hash === "0xbad") throw new Error("BlockNotPinnedError")
        const id = byBlock[hash]?.resolved
        return id ? [{ payload: { id, amount_out: 10n } }] : []
      },
    },
    IntentExpired: {
      get: async (hash: string) => {
        const id = byBlock[hash]?.expired
        return id ? [{ payload: { id } }] : []
      },
    },
    IntentCanceled: { get: async () => [] },
  }

  const outcomes: IntentOutcome[] = []
  watchIntentOutcomes(blocks$, events).subscribe((o) => outcomes.push(o))

  return { blocks$, outcomes }
}

describe("watchIntentOutcomes", () => {
  it("reads outcomes from each new block", async () => {
    const { blocks$, outcomes } = setup()

    blocks$.next({ hash: "0x1" })
    blocks$.next({ hash: "0x2" })
    await flush()

    expect(outcomes).toEqual([
      { id: 1n, kind: "resolved", amountOut: 10n },
      { id: 2n, kind: "unfilled" },
    ])
  })

  it("skips a block it can't read and keeps going", async () => {
    const { blocks$, outcomes } = setup()

    blocks$.next({ hash: "0xbad" })
    blocks$.next({ hash: "0x1" })
    await flush()

    expect(outcomes).toEqual([{ id: 1n, kind: "resolved", amountOut: 10n }])
  })

  it("ignores a replayed block", async () => {
    const { blocks$, outcomes } = setup()

    blocks$.next({ hash: "0x1" })
    blocks$.next({ hash: "0x1" })
    await flush()

    expect(outcomes).toHaveLength(1)
  })
})
