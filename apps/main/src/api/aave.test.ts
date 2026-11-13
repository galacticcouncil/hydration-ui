import { describe, expect, it, vi } from "vitest"

import { formatHealthFactorResult } from "@/api/aave"

vi.mock("@galacticcouncil/sdk-next", () => ({ aave: {} }))
vi.mock("@galacticcouncil/web3-connect", () => ({}))
vi.mock("@/api/assets", () => ({}))
vi.mock("@/api/balances", () => ({}))
vi.mock("@/providers/assetsProvider", () => ({}))
vi.mock("@/providers/rpcProvider", () => ({}))

describe("formatHealthFactorResult", () => {
  it("requires consent when the future HF drops visibly below the risk threshold", () => {
    const result = formatHealthFactorResult({ currentHF: 2, futureHF: 1.05 })

    expect(result.isBelowRiskThreshold).toBe(true)
    expect(result.isSignificantChange).toBe(true)
    expect(result.isUserConsentRequired).toBe(true)
  })

  it("reports no change when both HFs round down to the same 2 decimals", () => {
    const result = formatHealthFactorResult({
      currentHF: "1.501",
      futureHF: "1.509",
    })

    expect(result.hasChanged).toBe(false)
  })

  it("never treats a future HF of -1 as below the risk threshold", () => {
    const result = formatHealthFactorResult({ currentHF: 2, futureHF: -1 })

    expect(result.isBelowRiskThreshold).toBe(false)
    expect(result.isUserConsentRequired).toBe(false)
  })

  it("requires no consent when the future HF rises above the threshold", () => {
    const result = formatHealthFactorResult({ currentHF: 1.5, futureHF: 2 })

    expect(result.isBelowRiskThreshold).toBe(false)
    expect(result.isUserConsentRequired).toBe(false)
  })
})
