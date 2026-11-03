import { describe, expect, it } from "vitest"

import { getWithdrawalStateLabel } from "./withdrawalState"

describe("Compact withdrawal status", () => {
  it("offers Claim for settled collateral", () => {
    expect(
      getWithdrawalStateLabel({
        state: "settled",
        collateralSettled: 1,
        surplusHollar: 0,
      }),
    ).toBe("claimable")
  })
  it("offers Claim for HOLLAR recovered after collateral was claimed", () => {
    expect(
      getWithdrawalStateLabel({
        state: "claimed",
        collateralSettled: 0,
        surplusHollar: 1,
      }),
    ).toBe("claimable")
  })
  it("does not offer Claim again without a new payout", () => {
    expect(
      getWithdrawalStateLabel({
        state: "claimed",
        collateralSettled: 0,
        surplusHollar: 0,
      }),
    ).toBe("claimed")
  })
  it("shows the cooldown as queued, like a request waiting for its unwind", () => {
    expect(
      getWithdrawalStateLabel({
        state: "cooldown",
        collateralSettled: 0,
        surplusHollar: 0,
      }),
    ).toBe("pending")
  })
  it("holds a partial claim back until a quarter of the request settles", () => {
    const partial = (settledSoFar: number, collateralSettled: number) =>
      getWithdrawalStateLabel({
        state: "partial",
        collateralOwed: 1,
        settledSoFar,
        collateralSettled,
        surplusHollar: 0,
      })
    expect(partial(0.05, 0.05)).toBe("settling")
    expect(partial(0.25, 0.25)).toBe("claimable")
    // 0.30 claimed: the next claim waits for half, not another 25% on top
    expect(partial(0.45, 0.15)).toBe("settling")
    expect(partial(0.5, 0.2)).toBe("claimable")
    // a claim taken below a quarter (an older rule) still waits for the next
    expect(partial(0.2, 0.15)).toBe("settling")
    expect(partial(0.26, 0.21)).toBe("claimable")
  })
  it("offers the rest once fully repaid, however small", () => {
    expect(
      getWithdrawalStateLabel({
        state: "settled",
        collateralOwed: 1,
        settledSoFar: 1,
        collateralSettled: 0.01,
        surplusHollar: 0,
      }),
    ).toBe("claimable")
  })
  it("shows settling when partial settlement is not currently claimable", () => {
    expect(
      getWithdrawalStateLabel({
        state: "partial",
        collateralSettled: 0,
        surplusHollar: 0,
      }),
    ).toBe("settling")
  })
})
