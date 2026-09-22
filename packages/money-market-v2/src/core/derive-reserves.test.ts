import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getMarket, readReserves, summarizeReserves } from "@/core"
import {
  fixtureTimestamp,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
} from "@/fixtures"
import type { MarketReserves, ReserveSummary } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

/** A plain fixed-point decimal — never exponent notation (ADR-0006). */
const DECIMAL = /^-?\d+(\.\d+)?$/

const find = (summaries: ReserveSummary[], symbol: string) => {
  const summary = summaries.find((s) => s.symbol === symbol)
  if (!summary) throw new Error(`No ${symbol} reserve in the fixture`)
  return summary
}

describe("summarizeReserves", () => {
  let chain: MarketReserves
  let summaries: ReserveSummary[]

  beforeEach(async () => {
    vi.resetAllMocks()
    mockedReadContract.mockImplementation(async (_config, parameters) => {
      const { functionName } = parameters as { functionName: string }
      if (functionName === "getReservesData") return getReservesDataFixture()
      if (functionName === "getReservesIncentivesData")
        return getReservesIncentivesDataFixture()
      throw new Error(`Unexpected call to ${functionName}`)
    })

    chain = await readReserves(config, market)
    summaries = summarizeReserves({
      ...chain,
      currentTimestamp: fixtureTimestamp,
    })
  })

  it("summarizes every reserve the market returned", () => {
    expect(summaries.length).toBe(chain.reserves.length)
    expect(summaries.map((s) => s.underlyingAsset)).toEqual(
      chain.reserves.map((r) => r.underlyingAsset),
    )
  })

  it("reports only plain fixed-point decimal strings", () => {
    for (const summary of summaries) {
      for (const [field, value] of Object.entries(summary)) {
        if (typeof value !== "string") continue
        if (field === "underlyingAsset") continue
        if (field === "name" || field === "symbol" || field === "eModeLabel")
          continue
        expect(value, `${summary.symbol}.${field}`).toMatch(DECIMAL)
      }
    }
  })

  it("derives liquidity as debt plus what is left unborrowed", () => {
    const hollar = find(summaries, "HOLLAR")
    const reserve = chain.reserves.find(
      (r) => r.underlyingAsset === hollar.underlyingAsset,
    )!

    expect(Number(hollar.totalLiquidity)).toBeCloseTo(
      Number(hollar.totalDebt) +
        Number(reserve.availableLiquidity) / 10 ** reserve.decimals,
      6,
    )
  })

  it("accrues debt forward — a later timestamp owes more", () => {
    const later = summarizeReserves({
      ...chain,
      currentTimestamp: fixtureTimestamp + 86400,
    })

    const borrowed = summaries.filter((s) => Number(s.totalDebt) > 0)
    expect(borrowed.length).toBeGreaterThan(0)

    for (const summary of borrowed) {
      const accrued = find(later, summary.symbol)
      expect(Number(accrued.totalDebt)).toBeGreaterThan(
        Number(summary.totalDebt),
      )
    }
  })

  it("compounds APR into a strictly larger APY wherever a rate is set", () => {
    const earning = summaries.filter((s) => Number(s.supplyApr) > 0)
    expect(earning.length).toBeGreaterThan(0)

    for (const summary of earning) {
      expect(Number(summary.supplyApy)).toBeGreaterThan(
        Number(summary.supplyApr),
      )
      expect(Number(summary.variableBorrowApy)).toBeGreaterThan(
        Number(summary.variableBorrowApr),
      )
    }
  })

  it("keeps utilisation between zero and one", () => {
    for (const summary of summaries) {
      const borrow = Number(summary.borrowUsageRatio)
      expect(borrow, summary.symbol).toBeGreaterThanOrEqual(0)
      expect(borrow, summary.symbol).toBeLessThanOrEqual(1)
      expect(Number(summary.supplyUsageRatio)).toBeLessThanOrEqual(borrow)
    }
  })

  it("normalizes the risk parameters out of basis points", () => {
    const hollar = find(summaries, "HOLLAR")
    const reserve = chain.reserves.find(
      (r) => r.underlyingAsset === hollar.underlyingAsset,
    )!

    expect(hollar.ltv).toBe(String(Number(reserve.baseLTVasCollateral) / 1e4))
    expect(hollar.liquidationThreshold).toBe(
      String(Number(reserve.reserveLiquidationThreshold) / 1e4),
    )
    // A bonus is stored as a multiplier over par; the summary reports the premium.
    expect(Number(hollar.liquidationBonus)).toBeLessThan(1)
  })

  it("prices every reserve in USD consistently with its own price feed", () => {
    for (const summary of summaries) {
      if (Number(summary.totalLiquidity) === 0) continue
      expect(Number(summary.totalLiquidityUsd)).toBeCloseTo(
        Number(summary.totalLiquidity) * Number(summary.priceInUsd),
        2,
      )
    }
  })

  it("reports no debt ceiling for a reserve that is not isolated", () => {
    const open = summaries.filter((s) => !s.isIsolated)
    expect(open.length).toBeGreaterThan(0)

    for (const summary of open) {
      expect(summary.debtCeilingUsd).toBe("0")
      expect(summary.isolationModeTotalDebtUsd).toBe("0")
      expect(summary.availableDebtCeilingUsd).toBe("0")
    }
  })

  it("keeps incentive APRs separate, never folding them into the base APY", () => {
    const incentivised = summaries.filter((s) => s.supplyIncentives.length > 0)
    expect(incentivised.length).toBeGreaterThan(0)

    for (const summary of incentivised) {
      // The base APY is the interest-rate model's alone: it is the compounded
      // supply APR and nothing else, whatever rewards the reserve pays.
      expect(Number(summary.supplyApy)).toBeGreaterThanOrEqual(
        Number(summary.supplyApr),
      )
      expect(Number(summary.supplyApy)).toBeLessThan(
        Number(summary.supplyApr) +
          Number(summary.supplyIncentives[0]!.rewardApr),
      )
    }
  })

  it("reads no clock — the same timestamp gives the same answer", () => {
    expect(
      summarizeReserves({ ...chain, currentTimestamp: fixtureTimestamp }),
    ).toEqual(summaries)
  })
})
