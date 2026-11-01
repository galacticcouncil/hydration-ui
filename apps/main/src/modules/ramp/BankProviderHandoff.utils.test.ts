import { describe, expect, it } from "vitest"

import { getBankProviderHandoffAction } from "./BankProviderHandoff.utils"

const action = getBankProviderHandoffAction

describe("bank provider handoff boundaries", () => {
  it("requires provider onboarding even if the initial currency is available", () => {
    expect(
      action({ state: "idle", status: "available", verified: false }),
    ).toBe("launch")
  })

  it("returns from the hosted flow without interpreting that as approval", () => {
    expect(
      action({ state: "away", status: "available", verified: false }),
    ).toBe("return")
    expect(
      action({ state: "returned", status: "in review", verified: false }),
    ).toBe("check")
    expect(
      action({ state: "returned", status: "in review", verified: true }),
    ).toBe("check")
  })

  it("continues only when both profile setup and currency are ready", () => {
    expect(
      action({ state: "returned", status: "available", verified: false }),
    ).toBe("launch")
    expect(
      action({ state: "returned", status: "available", verified: true }),
    ).toBe("continue")
    expect(action({ state: "idle", status: "in review", verified: true })).toBe(
      "check",
    )
  })

  it("sends missing details back to Bridge and blocks unavailable currencies", () => {
    expect(
      action({ state: "returned", status: "more info needed", verified: true }),
    ).toBe("launch")
    for (const status of ["rejected", "not offered in region"] as const) {
      expect(action({ state: "returned", status, verified: true })).toBe(
        "blocked",
      )
    }
  })
})
