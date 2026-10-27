import { describe, expect, it } from "vitest"

import { Ladder, Stall } from "@/modules/strategies/multiply/config/abi"
import {
  getMultiplyPositionStatus,
  getMultiplyProgress,
} from "@/modules/strategies/multiply/utils/status"

const NOW = 1_000_000
const idle = {
  ladder: Ladder.None,
  closing: false,
  stalled: Stall.None,
  pendingKind: 0,
  pendingDeadline: 0,
}
const inFlight = { pendingKind: 1, pendingDeadline: NOW + 60_000 }

describe("getMultiplyPositionStatus", () => {
  it("is active at target with nothing running", () => {
    expect(getMultiplyPositionStatus(idle, NOW)).toBe("active")
  })

  it("follows the ladder while a rung is in flight", () => {
    expect(
      getMultiplyPositionStatus(
        { ...idle, ...inFlight, ladder: Ladder.Ramp },
        NOW,
      ),
    ).toBe("building")
    expect(
      getMultiplyPositionStatus(
        { ...idle, ...inFlight, ladder: Ladder.Unwind },
        NOW,
      ),
    ).toBe("withdrawing")
    expect(
      getMultiplyPositionStatus(
        { ...idle, ...inFlight, ladder: Ladder.Unwind, closing: true },
        NOW,
      ),
    ).toBe("closing")
  })

  it("is paused on any stall", () => {
    expect(
      getMultiplyPositionStatus(
        { ...idle, ladder: Ladder.Ramp, stalled: Stall.FeeBudgetLow },
        NOW,
      ),
    ).toBe("paused")
    expect(
      getMultiplyPositionStatus(
        {
          ...idle,
          ladder: Ladder.Unwind,
          closing: true,
          stalled: Stall.TailUnfunded,
        },
        NOW,
      ),
    ).toBe("paused")
  })

  it("is paused when the rung in flight is past its deadline", () => {
    expect(
      getMultiplyPositionStatus(
        {
          ...idle,
          ladder: Ladder.Ramp,
          pendingKind: 1,
          pendingDeadline: NOW - 1,
        },
        NOW,
      ),
    ).toBe("paused")
  })
})

describe("getMultiplyProgress", () => {
  it("climbs from 1× to the target while building", () => {
    expect(getMultiplyProgress("building", 2, 3)).toBeCloseTo(0.5)
  })

  it("comes back down while closing", () => {
    expect(getMultiplyProgress("closing", 1.5, 3)).toBeCloseTo(0.75)
  })

  it("clamps overshoot and has no bar for the other statuses", () => {
    expect(getMultiplyProgress("building", 3.01, 3)).toBe(1)
    expect(getMultiplyProgress("withdrawing", 2, 3)).toBeNull()
    expect(getMultiplyProgress("active", 3, 3)).toBeNull()
  })
})
