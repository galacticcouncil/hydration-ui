import { describe, expect, it } from "vitest"

import {
  getQueueWait,
  getQueueWaitSlots,
} from "@/modules/strategies/bil/utils/queueWait"

describe("getQueueWaitSlots", () => {
  it("returns no slots when the queue is fully settled", () => {
    expect(getQueueWaitSlots(16n, 16n)).toEqual([])
  })

  it("returns every slot from the head through the append index", () => {
    expect(getQueueWaitSlots(14n, 16n)).toEqual([14n, 15n, 16n])
  })
})

describe("getQueueWait", () => {
  const now = 1_000n

  it("takes the longest slot wait as the worst case", () => {
    const { worstCaseWaitSec } = getQueueWait({
      waits: [10n, 300n, 0n],
      maturityTime: 0n,
      now,
      idleHollar: 5n,
    })

    expect(worstCaseWaitSec).toBe(300n)
  })

  it("reports no wait and no maturity when nothing is queued and the head position has matured", () => {
    expect(
      getQueueWait({ waits: [], maturityTime: 900n, now, idleHollar: 0n }),
    ).toEqual({ nextMaturitySec: 0n, worstCaseWaitSec: 0n })
  })

  it("floors the worst case on the time until maturity when no HOLLAR is idle", () => {
    expect(
      getQueueWait({
        waits: [0n, 100n],
        maturityTime: 1_500n,
        now,
        idleHollar: 0n,
      }),
    ).toEqual({ nextMaturitySec: 500n, worstCaseWaitSec: 500n })
  })

  it("keeps the slot wait when it already exceeds next maturity", () => {
    const { worstCaseWaitSec } = getQueueWait({
      waits: [800n],
      maturityTime: 1_500n,
      now,
      idleHollar: 0n,
    })

    expect(worstCaseWaitSec).toBe(800n)
  })

  it("does not floor on next maturity while HOLLAR is idle", () => {
    const { worstCaseWaitSec } = getQueueWait({
      waits: [100n],
      maturityTime: 1_500n,
      now,
      idleHollar: 1n,
    })

    expect(worstCaseWaitSec).toBe(100n)
  })
})
