import { afterEach, describe, expect, it, vi } from "vitest"

import { lpFeeReading, LpFeeYieldMetric } from "@/api/external/lpFee"
import { EXTERNAL_APY_MAX_AGE_MS } from "@/api/external/reading"

const NOW = Date.parse("2026-10-05T12:00:00.000Z")
const AS_OF = "2026-10-05T11:00:00.000Z"

const metrics = (
  asOf: string | null,
  ...items: Array<[poolId: string, feeApyPerc: string | null]>
): LpFeeYieldMetric[] =>
  items.map(([poolId, feeApyPerc]) => ({ poolId, feeApyPerc, asOf }))

const loaded = (data: LpFeeYieldMetric[] | undefined) => ({
  data,
  isPending: false,
})

describe("lpFeeReading", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("is the percent divided by 100 for a present value", () => {
    const data = metrics(AS_OF, ["102", "1.2345"], ["690", "5.6100"])

    expect(lpFeeReading(loaded(data), "102", NOW)).toEqual({
      status: "known",
      apy: "0.012345",
    })
    expect(lpFeeReading(loaded(data), "690", NOW)).toEqual({
      status: "known",
      apy: "0.0561",
    })
  })

  it.each([
    ["a zero value", metrics(AS_OF, ["102", "0.0000"])],
    ["a null value", metrics(AS_OF, ["102", null])],
    ["a pool absent from the list", metrics(AS_OF, ["690", "5.6100"])],
  ])("is known as 0 for %s in a usable response", (_, data) => {
    expect(lpFeeReading(loaded(data), "102", NOW)).toEqual({
      status: "known",
      apy: "0",
    })
  })

  it("is unavailable for a pool whose value fails the bound, and only it", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const data = metrics(
      AS_OF,
      ["102", "100.0001"],
      ["103", "-0.0100"],
      ["104", "abc"],
      ["690", "100.0000"],
    )

    expect(lpFeeReading(loaded(data), "102", NOW)).toEqual({
      status: "unavailable",
    })
    expect(lpFeeReading(loaded(data), "103", NOW)).toEqual({
      status: "unavailable",
    })
    expect(lpFeeReading(loaded(data), "104", NOW)).toEqual({
      status: "unavailable",
    })
    expect(error.mock.calls[0]?.[0]).toContain("yieldMetrics:102")
    expect(lpFeeReading(loaded(data), "690", NOW)).toEqual({
      status: "known",
      apy: "1",
    })
  })

  it("is loading with no data while pending", () => {
    expect(
      lpFeeReading({ data: undefined, isPending: true }, "102", NOW),
    ).toEqual({ status: "loading" })
  })

  it("is unavailable with no data when not pending", () => {
    expect(lpFeeReading(loaded(undefined), "102", NOW)).toEqual({
      status: "unavailable",
    })
  })

  it("is known at exactly 7 days and unavailable just past it", () => {
    const data = metrics(AS_OF, ["102", "1.2345"])
    const asOf = Date.parse(AS_OF)

    expect(
      lpFeeReading(loaded(data), "102", asOf + EXTERNAL_APY_MAX_AGE_MS),
    ).toEqual({ status: "known", apy: "0.012345" })
    expect(
      lpFeeReading(loaded(data), "102", asOf + EXTERNAL_APY_MAX_AGE_MS + 1),
    ).toEqual({ status: "unavailable" })
    // an absent pool is not a zero LP fee once the response is too old
    expect(
      lpFeeReading(loaded(data), "690", asOf + EXTERNAL_APY_MAX_AGE_MS + 1),
    ).toEqual({ status: "unavailable" })
  })

  it.each([
    ["has no items", []],
    ["has a null asOf", metrics(null, ["102", "1.2345"])],
    ["has an unparseable asOf", metrics("soon", ["102", "1.2345"])],
  ])("is unavailable for every pool when the response %s", (_, data) => {
    expect(lpFeeReading(loaded(data), "102", NOW)).toEqual({
      status: "unavailable",
    })
  })
})
