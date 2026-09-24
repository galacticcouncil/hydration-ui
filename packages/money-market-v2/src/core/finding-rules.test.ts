import type { Address } from "viem"
import { describe, expect, it } from "vitest"

import {
  borrowCapFindings,
  debtCeilingFindings,
  healthFactorFindings,
  supplyCapFindings,
  zeroLtvLockFindings,
} from "@/core/finding-rules"

describe("healthFactorFindings", () => {
  it("blocks a projected HF below 1 with debt", () => {
    expect(
      healthFactorFindings({ current: "2", projected: "0.99", hasDebt: true }),
    ).toEqual([{ kind: "blocker", code: "healthFactorBelowOne", params: {} }])
  })

  it("does not block a projected HF of exactly 1, but asks to acknowledge it", () => {
    expect(
      healthFactorFindings({ current: "2", projected: "1", hasDebt: true }),
    ).toEqual([
      { kind: "acknowledgement", code: "healthFactorRisk", params: {} },
    ])
  })

  it("does not block a projected HF below 1 without debt", () => {
    const findings = healthFactorFindings({
      current: "2",
      projected: "0.5",
      hasDebt: false,
    })
    expect(findings.some((finding) => finding.kind === "blocker")).toBe(false)
  })

  it("asks to acknowledge a projected HF just below 1.1", () => {
    expect(
      healthFactorFindings({
        current: "2",
        projected: "1.0999",
        hasDebt: true,
      }),
    ).toEqual([
      { kind: "acknowledgement", code: "healthFactorRisk", params: {} },
    ])
  })

  it("reports nothing for a projected HF of exactly 1.1", () => {
    expect(
      healthFactorFindings({ current: "2", projected: "1.1", hasDebt: true }),
    ).toEqual([])
  })

  it("reports nothing for the no-debt sentinel", () => {
    expect(
      healthFactorFindings({ current: "2", projected: "-1", hasDebt: false }),
    ).toEqual([])
  })

  it("reports nothing when the HF does not change at two decimals", () => {
    expect(
      healthFactorFindings({
        current: "1.0599",
        projected: "1.05",
        hasDebt: true,
      }),
    ).toEqual([])
  })

  it("asks to acknowledge taking on debt from the no-debt sentinel", () => {
    expect(
      healthFactorFindings({ current: "-1", projected: "1.05", hasDebt: true }),
    ).toEqual([
      { kind: "acknowledgement", code: "healthFactorRisk", params: {} },
    ])
  })
})

describe("cap findings", () => {
  const supply = (totalLiquidity: string, supplyCap = "100") =>
    supplyCapFindings({ totalLiquidity, supplyCap })

  it("reports nothing at 97.99%", () => {
    expect(supply("97.99")).toEqual([])
  })

  it("warns at exactly 98%", () => {
    expect(supply("98")).toEqual([
      {
        kind: "notice",
        tone: "warning",
        code: "supplyCapNearlyReached",
        params: { percent: 98 },
      },
    ])
  })

  it("truncates the percent below 99.99%", () => {
    expect(supply("99.989")[0]?.params).toEqual({ percent: 99.98 })
  })

  it("treats 99.99% as reached", () => {
    expect(supply("99.99")[0]?.params).toEqual({ percent: 100 })
  })

  it("reports a cap exceeded as reached", () => {
    expect(supply("150")[0]?.params).toEqual({ percent: 100 })
  })

  it("reports nothing when the reserve has no cap", () => {
    expect(supply("1000000", "0")).toEqual([])
  })

  it("warns on the borrow cap", () => {
    expect(borrowCapFindings("98", "100")).toEqual([
      {
        kind: "notice",
        tone: "warning",
        code: "borrowCapNearlyReached",
        params: { percent: 98 },
      },
    ])
    expect(borrowCapFindings("97.99", "100")).toEqual([])
  })

  it("warns on the debt ceiling", () => {
    expect(
      debtCeilingFindings({
        isolationModeTotalDebtUsd: "99.99",
        debtCeilingUsd: "100",
      }),
    ).toEqual([
      {
        kind: "notice",
        tone: "warning",
        code: "debtCeilingNearlyReached",
        params: { percent: 100 },
      },
    ])
    expect(
      debtCeilingFindings({
        isolationModeTotalDebtUsd: "0",
        debtCeilingUsd: "0",
      }),
    ).toEqual([])
  })
})

describe("zeroLtvLockFindings", () => {
  const WBTC = "0x0000000000000000000000000000000100000013" as Address
  const USDC = "0x0000000000000000000000000000000100000016" as Address
  const RETIRED = "0x0000000000000000000000000000000100000099" as Address

  const reserves = [
    { underlyingAsset: WBTC, ltv: "0", liquidationThreshold: "0.7" },
    { underlyingAsset: USDC, ltv: "0.8", liquidationThreshold: "0.85" },
    { underlyingAsset: RETIRED, ltv: "0", liquidationThreshold: "0" },
  ]

  const position = (
    underlyingAsset: Address,
    symbol: string,
    underlyingBalance = "1",
    usageAsCollateralEnabledOnUser = true,
  ) => ({
    underlyingAsset,
    symbol,
    underlyingBalance,
    usageAsCollateralEnabledOnUser,
  })

  it("blocks on zero-LTV collateral with a liquidation threshold", () => {
    expect(
      zeroLtvLockFindings({
        asset: USDC,
        positions: [position(WBTC, "WBTC"), position(USDC, "USDC")],
        reserves,
      }),
    ).toEqual([
      {
        kind: "blocker",
        code: "zeroLtvCollateralBlocks",
        params: { symbols: ["WBTC"] },
      },
    ])
  })

  it("excludes the asset being acted on, whatever its address case", () => {
    expect(
      zeroLtvLockFindings({
        asset: WBTC.toUpperCase().replace("0X", "0x") as Address,
        positions: [position(WBTC, "WBTC")],
        reserves,
      }),
    ).toEqual([])
  })

  it("ignores an empty position", () => {
    expect(
      zeroLtvLockFindings({
        asset: USDC,
        positions: [position(WBTC, "WBTC", "0")],
        reserves,
      }),
    ).toEqual([])
  })

  it("ignores a position not used as collateral", () => {
    expect(
      zeroLtvLockFindings({
        asset: USDC,
        positions: [position(WBTC, "WBTC", "1", false)],
        reserves,
      }),
    ).toEqual([])
  })

  it("ignores a reserve whose liquidation threshold is zero", () => {
    expect(
      zeroLtvLockFindings({
        asset: USDC,
        positions: [position(RETIRED, "RETIRED")],
        reserves,
      }),
    ).toEqual([])
  })
})
