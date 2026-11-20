import { describe, expect, it } from "vitest"

import { getLooperRecovery } from "@/modules/strategies/multiply/utils/recovery"

const base = { minAmount: "0.01", maxDeposit: 5000, decimals: 6 }

describe("getLooperRecovery", () => {
  it("opens with the whole held amount when it fits", () => {
    expect(getLooperRecovery({ ...base, held: "1000" })).toEqual({
      kind: "open",
      amount: "1000",
      clamped: false,
    })
  })

  it("opens with what the market takes when the held amount is above its room", () => {
    expect(
      getLooperRecovery({ ...base, held: "6000", maxDeposit: 4999.1234567 }),
    ).toEqual({ kind: "open", amount: "4999.123456", clamped: true })
  })

  it("offers no open when the market has no room for even the minimum", () => {
    expect(
      getLooperRecovery({ ...base, held: "6000", maxDeposit: 0.001 }),
    ).toEqual({ kind: "noRoom" })
  })

  it("offers no open when the held amount is below the minimum", () => {
    expect(getLooperRecovery({ ...base, held: "0.001" })).toEqual({
      kind: "tooSmall",
    })
  })

  it("only switches to the collateral when the held amount is unknown", () => {
    expect(getLooperRecovery({ ...base, held: "" })).toEqual({
      kind: "unknown",
    })
  })

  it("opens with the held amount while the room is still loading or uncapped", () => {
    expect(
      getLooperRecovery({ ...base, held: "6000", maxDeposit: null }),
    ).toEqual({ kind: "open", amount: "6000", clamped: false })
  })
})
