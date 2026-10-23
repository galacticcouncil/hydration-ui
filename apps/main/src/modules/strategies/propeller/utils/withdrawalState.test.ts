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
  it("keeps cooldown visible until settlement", () => {
    expect(
      getWithdrawalStateLabel({
        state: "cooldown",
        collateralSettled: 0,
        surplusHollar: 0,
      }),
    ).toBe("cooldown")
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
