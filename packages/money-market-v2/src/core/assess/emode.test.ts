import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import Big from "big.js"
import type { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AssessEModeRequest } from "@/core"
import {
  assessEMode,
  getMarket,
  hasBlocker,
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
import type { MarketPositions, Position } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

/** E-mode category 1, "Stablecoins": LT 0.9 outside it, 0.93 inside. */
const USDC = "0x0000000000000000000000000000000100000016" as Address
/** E-mode category 1, "Stablecoins". */
const USDT = "0x000000000000000000000000000000010000000a" as Address

describe("assessEMode", () => {
  let request: AssessEModeRequest

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

    const reserves = await readReserves(config, market)
    request = {
      reserves,
      summaries: summarizeReserves({
        ...reserves,
        currentTimestamp: fixtureTimestamp,
      }),
      positions: await readPositions(config, market, fixtureUser),
      categoryId: 1,
      currentTimestamp: fixtureTimestamp,
    }
  })

  /**
   * USDC as the only collateral, `debt` scaled USDT owed and nothing else,
   * in category `eModeCategoryId`.
   */
  const stablecoinAccount = (
    debt: string,
    eModeCategoryId: number,
  ): MarketPositions => ({
    ...request.positions,
    eModeCategoryId,
    positions: request.positions.positions.map(
      (position): Position => ({
        ...position,
        scaledATokenBalance:
          position.underlyingAsset === USDC ? "1000000000000" : "0",
        scaledVariableDebt: position.underlyingAsset === USDT ? debt : "0",
        usageAsCollateralEnabledOnUser: position.underlyingAsset === USDC,
      }),
    ),
  })

  const codes = (overrides: Partial<AssessEModeRequest>) =>
    assessEMode({ ...request, ...overrides }).findings.map(
      (finding) => finding.code,
    )

  describe("projection", () => {
    it("replaces the category and raises the max LTV", () => {
      const positions = stablecoinAccount("0", 0)
      const { projection, findings } = assessEMode({ ...request, positions })

      expect(projection.account.eModeCategoryId).toBe(1)
      expect(projection.account.currentLoanToValue).toBe("0.9")
      expect(hasBlocker(findings)).toBe(false)
    })

    it("accepts category ids beyond 2", () => {
      const positions = stablecoinAccount("0", 0)
      const { projection, findings } = assessEMode({
        ...request,
        positions,
        categoryId: 5,
      })

      expect(projection.account.eModeCategoryId).toBe(5)
      expect(hasBlocker(findings)).toBe(false)
    })
  })

  describe("blockers", () => {
    it("blocks leaving e-mode when the health factor would drop below 1", () => {
      // HF ≈ 1.007 in the category, ≈ 0.974 outside it.
      const positions = stablecoinAccount("880000000000", 1)
      const assessment = assessEMode({ ...request, positions, categoryId: 0 })

      expect(
        Big(
          summarizeAccount({ ...request, positions }).account.healthFactor,
        ).gt(1),
      ).toBe(true)
      expect(Big(assessment.projection.account.healthFactor).lt(1)).toBe(true)
      expect(codes({ positions, categoryId: 0 })).toContain(
        "healthFactorBelowOne",
      )
    })

    it("blocks entering a category a debt is outside of", () => {
      // The fixture user owes PRIME and apyUSD, neither in any category.
      const { findings } = assessEMode(request)

      expect(findings).toContainEqual({
        kind: "blocker",
        code: "borrowsOutsideCategory",
        params: { category: "Stablecoins" },
      })
    })

    it("blocks switching to a category a debt is outside of", () => {
      const positions = stablecoinAccount("100000000000", 1)
      const { findings } = assessEMode({ ...request, positions, categoryId: 3 })

      expect(findings).toContainEqual({
        kind: "blocker",
        code: "borrowsOutsideCategory",
        params: { category: "ETH" },
      })
    })

    it("lets debt inside the target category through", () => {
      const positions = stablecoinAccount("100000000000", 0)

      expect(codes({ positions })).not.toContain("borrowsOutsideCategory")
    })

    it("never checks the categories of debt when leaving e-mode", () => {
      const positions = stablecoinAccount("100000000000", 1)

      expect(codes({ positions, categoryId: 0 })).toEqual([])
    })

    it("blocks choosing the category the account is already in", () => {
      expect(codes({ categoryId: 0 })).toContain("sameEModeCategory")
    })
  })

  describe("health factor", () => {
    it("asks to acknowledge leaving e-mode into a risky health factor", () => {
      // HF ≈ 1.107 in the category, ≈ 1.072 outside it.
      const positions = stablecoinAccount("800000000000", 1)

      expect(codes({ positions, categoryId: 0 })).toContain("healthFactorRisk")
    })

    it("skips the health factor when entering from none", () => {
      const positions = stablecoinAccount("880000000000", 0)

      expect(codes({ positions })).toEqual(["eModeRestrictsBorrowing"])
    })
  })

  describe("notices", () => {
    it("warns that entering e-mode restricts borrowing", () => {
      const positions = stablecoinAccount("0", 0)

      expect(assessEMode({ ...request, positions }).findings).toContainEqual({
        kind: "notice",
        tone: "warning",
        code: "eModeRestrictsBorrowing",
        params: {},
      })
    })

    it("does not warn when switching between categories", () => {
      const positions = stablecoinAccount("0", 1)

      expect(codes({ positions, categoryId: 3 })).toEqual([])
    })

    it("does not warn when entering is blocked", () => {
      expect(codes({})).not.toContain("eModeRestrictsBorrowing")
    })
  })
})
