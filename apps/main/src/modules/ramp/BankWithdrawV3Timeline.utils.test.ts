import { describe, expect, it } from "vitest"

import { getBankWithdrawV3Timeline } from "./BankWithdrawV3Timeline.utils"

describe("getBankWithdrawV3Timeline", () => {
  it("folds confirmed stages but keeps the exact processing and future payout stages", () => {
    const { completed, remaining } = getBankWithdrawV3Timeline("processing")
    expect(completed.map(({ key }) => key)).toEqual([
      "redeemed",
      "queued",
      "delivered",
    ])
    expect(remaining).toEqual([
      { key: "processing", state: "current" },
      { key: "submitted", state: "pending" },
      { key: "paid", state: "pending" },
    ])
  })
  it("does not mark the payout paid when only submitted", () => {
    expect(getBankWithdrawV3Timeline("submitted").remaining).toEqual([
      { key: "submitted", state: "current" },
      { key: "paid", state: "pending" },
    ])
  })
  it("keeps paid visible after completing all steps", () => {
    const result = getBankWithdrawV3Timeline("paid")
    expect(result.completed).toHaveLength(5)
    expect(result.remaining).toEqual([{ key: "paid", state: "confirmed" }])
  })
  it.each(["returned", "expired", "checking"] as const)(
    "does not invent progress for %s",
    (status) => {
      expect(getBankWithdrawV3Timeline(status)).toEqual({
        completed: [],
        remaining: [],
      })
    },
  )
})
