import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AccountSummary } from "@/core"
import {
  getMarket,
  readPositions,
  readReserves,
  summarizeAccount,
  summarizeReserves,
} from "@/core"
import {
  fixtureTimestamp,
  fixtureUser,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
  getUserReservesDataFixture,
} from "@/fixtures"
import type { MarketPositions, MarketReserves, ReserveSummary } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

/** A plain fixed-point decimal — never exponent notation. */
const DECIMAL = /^-?\d+(\.\d+)?$/

/** Back to whole base units, so comparisons stay exact. */
const toBaseUnits = (value: string, decimals: number): bigint => {
  const [whole = "0", fraction = ""] = value.split(".")
  return BigInt(whole + fraction.padEnd(decimals, "0").slice(0, decimals))
}

const decimalPlaces = (value: string): number =>
  (value.split(".")[1] ?? "").length

describe("summarizeAccount", () => {
  let chain: MarketReserves
  let summaries: ReserveSummary[]
  let positions: MarketPositions
  let result: AccountSummary

  beforeEach(async () => {
    vi.resetAllMocks()
    mockedReadContract.mockImplementation(async (_config, parameters) => {
      const { functionName } = parameters as { functionName: string }
      if (functionName === "getReservesData") return getReservesDataFixture()
      if (functionName === "getReservesIncentivesData")
        return getReservesIncentivesDataFixture()
      if (functionName === "getUserReservesData")
        return getUserReservesDataFixture()
      throw new Error(`Unexpected call to ${functionName}`)
    })

    chain = await readReserves(config, market)
    summaries = summarizeReserves({
      ...chain,
      currentTimestamp: fixtureTimestamp,
    })
    positions = await readPositions(config, market, fixtureUser)
    result = summarizeAccount({
      reserves: chain,
      summaries,
      positions,
      currentTimestamp: fixtureTimestamp,
    })
  })

  it("summarizes every position whose reserve has a summary", () => {
    expect(result.positions.length).toBe(positions.positions.length)
    expect(result.positions.map((p) => p.underlyingAsset)).toEqual(
      positions.positions.map((p) => p.underlyingAsset),
    )
  })

  it("reports only plain fixed-point decimal strings", () => {
    const text = new Set(["address", "underlyingAsset", "symbol"])
    for (const [field, value] of Object.entries(result.account)) {
      if (typeof value !== "string" || text.has(field)) continue
      expect(value, `account.${field} = ${value}`).toMatch(DECIMAL)
    }
    for (const position of result.positions) {
      for (const [field, value] of Object.entries(position)) {
        if (typeof value !== "string" || text.has(field)) continue
        expect(value, `${position.symbol}.${field} = ${value}`).toMatch(DECIMAL)
      }
    }
  })

  it("accrues a supplied balance at or above its scaled principal", () => {
    const supplied = result.positions.filter(
      (p) => Number(p.underlyingBalance) > 0,
    )
    expect(supplied.length).toBeGreaterThan(0)

    for (const position of supplied) {
      const raw = positions.positions.find(
        (p) => p.underlyingAsset === position.underlyingAsset,
      )
      const reserve = chain.reserves.find(
        (r) => r.underlyingAsset === position.underlyingAsset,
      )
      if (!raw || !reserve) throw new Error("Unjoined position")

      // The liquidity index is at least one ray, so the accrued balance can
      // never be below the scaled one.
      expect(
        toBaseUnits(position.underlyingBalance, reserve.decimals),
      ).toBeGreaterThanOrEqual(BigInt(raw.scaledATokenBalance))
    }
  })

  it("counts only collateral-enabled reserves towards collateral", () => {
    const collateral = result.positions.filter(
      (p) => p.usageAsCollateralEnabledOnUser,
    )
    expect(Number(result.account.totalCollateralUsd)).toBeLessThanOrEqual(
      Number(result.account.totalLiquidityUsd) + 1e-9,
    )
    expect(collateral.length).toBeGreaterThan(0)
  })

  it("keeps the weighted LTV at or below the weighted liquidation threshold", () => {
    const ltv = Number(result.account.currentLoanToValue)
    const threshold = Number(result.account.currentLiquidationThreshold)

    expect(ltv).toBeGreaterThan(0)
    expect(ltv).toBeLessThanOrEqual(threshold)
    expect(threshold).toBeLessThanOrEqual(1)
  })

  it("truncates the weighted LTV and threshold to whole basis points", () => {
    for (const value of [
      result.account.currentLoanToValue,
      result.account.currentLiquidationThreshold,
    ]) {
      expect(decimalPlaces(value)).toBeLessThanOrEqual(4)
    }
  })

  it("reports -1 for a user with collateral and no debt", () => {
    const withoutDebt = summarizeAccount({
      reserves: chain,
      summaries,
      positions: {
        ...positions,
        positions: positions.positions.map((position) => ({
          ...position,
          scaledVariableDebt: "0",
        })),
      },
      currentTimestamp: fixtureTimestamp,
    })

    expect(withoutDebt.account.healthFactor).toBe("-1")
    expect(Number(withoutDebt.account.totalCollateralUsd)).toBeGreaterThan(0)
  })

  it("reports -1 for a user with no positions at all, and zero everywhere else", () => {
    const empty = summarizeAccount({
      reserves: chain,
      summaries,
      positions: { ...positions, positions: [] },
      currentTimestamp: fixtureTimestamp,
    })

    expect(empty.positions).toEqual([])
    // -1 means "no debt", which is true of an untouched account. It never
    // means "no user" — the address is still reported.
    expect(empty.account.healthFactor).toBe("-1")
    expect(empty.account.address).toBe(positions.user)
    expect(empty.account.totalCollateralUsd).toBe("0")
    expect(empty.account.availableBorrowsUsd).toBe("0")
    expect(empty.account.currentLoanToValue).toBe("0")
    expect(empty.account.currentLiquidationThreshold).toBe("0")
  })

  it("leaves borrowing power at zero when nothing is used as collateral", () => {
    const noCollateral = summarizeAccount({
      reserves: chain,
      summaries,
      positions: {
        ...positions,
        positions: positions.positions.map((position) => ({
          ...position,
          usageAsCollateralEnabledOnUser: false,
        })),
      },
      currentTimestamp: fixtureTimestamp,
    })

    expect(noCollateral.account.currentLoanToValue).toBe("0")
    expect(noCollateral.account.availableBorrowsMarketReferenceCurrency).toBe(
      "0",
    )
    expect(Number(noCollateral.account.totalLiquidityUsd)).toBeGreaterThan(0)
  })

  it("skips a position whose reserve has no summary", () => {
    const [first] = positions.positions
    if (!first) throw new Error("The fixture has no positions")

    const partial = summarizeAccount({
      reserves: chain,
      summaries: summaries.filter(
        (s) => s.underlyingAsset !== first.underlyingAsset,
      ),
      positions,
      currentTimestamp: fixtureTimestamp,
    })

    expect(partial.positions.length).toBe(positions.positions.length - 1)
    expect(
      partial.positions.some(
        (p) => p.underlyingAsset === first.underlyingAsset,
      ),
    ).toBe(false)
  })
})
