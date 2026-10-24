import { afterEach, describe, expect, it, vi } from "vitest"

import {
  assertPlausibleApy,
  EXTERNAL_APY_MAX_AGE_MS,
  newestBy,
  readingStatus,
} from "@/api/external/reading"

const NOW = 1_800_000_000_000

describe("assertPlausibleApy", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("accepts the bounds 0 and 1", () => {
    expect(assertPlausibleApy(0, "test")).toBe("0")
    expect(assertPlausibleApy(1, "test")).toBe("1")
  })

  it("returns the fraction as a plain decimal string", () => {
    expect(assertPlausibleApy(0.0561, "test")).toBe("0.0561")
    expect(assertPlausibleApy("0.075", "test")).toBe("0.075")
    expect(assertPlausibleApy(1e-7, "test")).toBe("0.0000001")
  })

  it.each([
    ["negative", -0.01],
    ["above 1", 1.0001],
    ["NaN", NaN],
    ["Infinity", Infinity],
    ["an empty string", ""],
    ["a non-numeric string", "abc"],
  ])("rejects %s and logs the source", (_, value) => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})

    expect(() => assertPlausibleApy(value, "kamino:abc")).toThrow()
    expect(error).toHaveBeenCalledTimes(1)
    expect(error.mock.calls[0]?.[0]).toContain("kamino:abc")
  })
})

describe("newestBy", () => {
  it("returns undefined for an empty list", () => {
    expect(newestBy([], () => 0)).toBeUndefined()
  })

  it("returns the newest entry of an unordered list with duplicates", () => {
    const entries = [
      { id: "a", time: 3 },
      { id: "b", time: 7 },
      { id: "c", time: 1 },
      { id: "d", time: 7 },
      { id: "e", time: 5 },
    ]

    expect(newestBy(entries, (entry) => entry.time)?.time).toBe(7)
  })

  it("does not depend on array order", () => {
    const entries = [{ time: 2 }, { time: 9 }, { time: 4 }]

    expect(newestBy(entries, (entry) => entry.time)).toEqual({ time: 9 })
    expect(newestBy([...entries].reverse(), (entry) => entry.time)).toEqual({
      time: 9,
    })
  })
})

describe("readingStatus", () => {
  it("is known at exactly 7 days", () => {
    const data = { apy: "0.05", asOf: NOW - EXTERNAL_APY_MAX_AGE_MS }

    expect(readingStatus({ data, isPending: false }, NOW)).toEqual({
      status: "known",
      reading: data,
    })
  })

  it("is unavailable just past 7 days even though data exists", () => {
    const data = { apy: "0.05", asOf: NOW - EXTERNAL_APY_MAX_AGE_MS - 1 }

    expect(readingStatus({ data, isPending: false }, NOW)).toEqual({
      status: "unavailable",
    })
  })

  it("is loading with no data while pending", () => {
    expect(readingStatus({ data: undefined, isPending: true }, NOW)).toEqual({
      status: "loading",
    })
  })

  it("is unavailable with no data when not pending", () => {
    expect(readingStatus({ data: undefined, isPending: false }, NOW)).toEqual({
      status: "unavailable",
    })
  })
})
