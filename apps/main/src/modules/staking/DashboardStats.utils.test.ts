import { describe, expect, it } from "vitest"

import {
  getAccumulatedRpsFromBlock,
  splitAccumulatedRpsEvents,
} from "./DashboardStats.utils"

const WEEK_AGO_BLOCK = 1000

const event = (blockHeight: number) => ({ blockHeight })

describe("splitAccumulatedRpsEvents", () => {
  it("takes the newest event older than one week as the before event", () => {
    const events = [event(800), event(900), event(1000), event(1100)]

    expect(splitAccumulatedRpsEvents(events, WEEK_AGO_BLOCK)).toEqual({
      before: event(900),
      after: [event(1000), event(1100)],
    })
  })

  it("falls back to the oldest event when none is older than one week", () => {
    const events = [event(1000), event(1100), event(1200)]

    expect(splitAccumulatedRpsEvents(events, WEEK_AGO_BLOCK)).toEqual({
      before: event(1000),
      after: events,
    })
  })

  it("returns no before event for an empty list", () => {
    expect(splitAccumulatedRpsEvents([], WEEK_AGO_BLOCK)).toEqual({
      before: undefined,
      after: [],
    })
  })
})

describe("getAccumulatedRpsFromBlock", () => {
  it("goes two weeks back and rounds down", () => {
    // one week of 6 s blocks is 100,800 blocks
    expect(getAccumulatedRpsFromBlock(15_523_982, 6000)).toBe(15_322_000)
  })

  it("does not go below the first block", () => {
    expect(getAccumulatedRpsFromBlock(100, 6000)).toBe(0)
  })
})
