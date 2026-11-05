import { describe, expect, it } from "vitest"

import { getBankDepositProgress } from "./BankDepositProgress.utils"
import { depositSteps } from "./deposit.mock"

describe("observed bank deposit progress", () => {
  it("does not imply a wallet credit while funds are queued or in transit", () => {
    for (const status of [
      ...depositSteps.filter((s) => s !== "Credited"),
      "Waiting for deposit limit",
    ] as const) {
      const rows = getBankDepositProgress(status)
      expect(rows.find((row) => row.label === "Credited")?.state).toBe(
        "pending",
      )
      expect(rows.filter((row) => row.state === "current")).toHaveLength(1)
    }
    const queued = getBankDepositProgress("Waiting for deposit limit")
    expect(queued.find((row) => row.label === "Depositing")?.state).toBe(
      "pending",
    )
  })
  it("marks credit confirmed only after credit is observed", () => {
    expect(
      getBankDepositProgress("Credited").every(
        (row) => row.state === "confirmed",
      ),
    ).toBe(true)
  })
  it("does not invent progress for an undetected transfer or a return", () => {
    expect(getBankDepositProgress()).toEqual([])
    expect(getBankDepositProgress("Returned")).toEqual([])
  })
})
