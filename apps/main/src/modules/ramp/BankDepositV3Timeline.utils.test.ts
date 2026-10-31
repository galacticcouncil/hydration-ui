import { describe, expect, it } from "vitest"

import { getBankDepositV3Timeline } from "./BankDepositV3Timeline.utils"

describe("bank deposit V3 timeline", () => {
  it("keeps the exact queued status visible while earlier stages can fold", () => {
    const { completed, remaining } = getBankDepositV3Timeline(
      "Queued on Hydration",
    )
    expect(completed.map((stage) => stage.label)).toEqual([
      "Received by Bridge",
      "Sent to Base",
      "Arrived",
      "Depositing",
    ])
    expect(remaining.map(({ label, state }) => ({ label, state }))).toEqual([
      { label: "Queued on Hydration", state: "current" },
      { label: "Credited", state: "pending" },
    ])
  })

  it("never folds away the final credited outcome", () => {
    const { completed, remaining } = getBankDepositV3Timeline("Credited")
    expect(completed).toHaveLength(5)
    expect(remaining).toMatchObject([{ label: "Credited", state: "confirmed" }])
  })

  it("keeps capacity waiting active without marking depositing complete", () => {
    const { remaining } = getBankDepositV3Timeline("Waiting for deposit limit")
    expect(remaining[0]).toMatchObject({
      label: "Waiting for deposit limit",
      state: "current",
    })
    expect(remaining.find((stage) => stage.label === "Depositing")?.state).toBe(
      "pending",
    )
  })

  it("does not invent successful stages for a returned deposit", () => {
    expect(getBankDepositV3Timeline("Returned")).toEqual({
      completed: [],
      remaining: [],
    })
  })
})
