import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import Big from "big.js"
import type { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AssessCollateralRequest } from "@/core"
import {
  assessCollateral,
  getMarket,
  hasBlocker,
  readPositions,
  readReserves,
  summarizeReserves,
} from "@/core"
import {
  fixtureTimestamp,
  fixtureUser,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
  getUserReservesDataFixture,
} from "@/fixtures"
import type { MarketPositions, Position, ReserveSummary } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

const USDC = "0x0000000000000000000000000000000100000016" as Address
/** Frozen, with an LTV of zero but a liquidation threshold of 0.7. */
const WBTC = "0x0000000000000000000000000000000100000013" as Address
const DOT = "0x0000000000000000000000000000000100000005" as Address
/** Isolated, with a debt ceiling. */
const PRIME = "0x000000000000000000000000000000010000002b" as Address

describe("assessCollateral", () => {
  let request: AssessCollateralRequest

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
      asset: USDC,
      currentTimestamp: fixtureTimestamp,
    }
  })

  const mapPositions = (
    update: (position: Position) => Position,
  ): MarketPositions => ({
    ...request.positions,
    positions: request.positions.positions.map(update),
  })

  /** No debt; each listed asset supplied, flagged as collateral or not. */
  const supplied = (collateral: Record<Address, boolean>) =>
    mapPositions((position) => {
      const flag = collateral[position.underlyingAsset]
      return {
        ...position,
        scaledATokenBalance: flag === undefined ? "0" : "1000000000000",
        scaledVariableDebt: "0",
        usageAsCollateralEnabledOnUser: flag ?? false,
      }
    })

  const withSummary = (
    asset: Address,
    patch: Partial<ReserveSummary>,
  ): ReserveSummary[] =>
    request.summaries.map((summary) =>
      summary.underlyingAsset === asset ? { ...summary, ...patch } : summary,
    )

  const codes = (overrides: Partial<AssessCollateralRequest>) =>
    assessCollateral({ ...request, ...overrides }).findings.map(
      (finding) => finding.code,
    )

  describe("direction and projection", () => {
    it("disables collateral that is enabled", () => {
      const { enable, projection } = assessCollateral(request)

      expect(enable).toBe(false)
      expect(
        projection.positions.find(
          (position) => position.underlyingAsset === USDC,
        )?.usageAsCollateralEnabledOnUser,
      ).toBe(false)
    })

    it("enables collateral that is disabled", () => {
      const positions = supplied({ [USDC]: false })
      const { enable, projection } = assessCollateral({ ...request, positions })

      expect(enable).toBe(true)
      expect(Big(projection.account.totalCollateralUsd).gt(0)).toBe(true)
    })
  })

  describe("blockers", () => {
    it("blocks disabling the only collateral backing debt", () => {
      const assessment = assessCollateral(request)

      expect(codes({})).toContain("healthFactorBelowOne")
      expect(hasBlocker(assessment.findings)).toBe(true)
      expect(Big(assessment.projection.account.healthFactor).lt(1)).toBe(true)
    })

    it("reports no supply for an asset the account does not hold", () => {
      expect(codes({ asset: DOT })).toContain("noSupply")
    })

    it("blocks enabling a non-isolated asset while in isolation mode", () => {
      const positions = supplied({ [PRIME]: true, [USDC]: false })

      expect(codes({ positions })).toContain("isolationCollateralConflict")
    })

    it("blocks enabling an isolated asset beside other collateral", () => {
      const positions = supplied({ [PRIME]: false, [USDC]: true })

      expect(codes({ positions, asset: PRIME })).toContain(
        "isolationCollateralConflict",
      )
    })

    it("allows an isolated asset as the only collateral", () => {
      const positions = supplied({ [PRIME]: false })
      const found = codes({ positions, asset: PRIME })

      expect(found).not.toContain("isolationCollateralConflict")
      expect(found).toContain("enteringIsolationMode")
    })

    it("blocks enabling an asset with a zero LTV or liquidation threshold", () => {
      expect(
        codes({ positions: supplied({ [WBTC]: false }), asset: WBTC }),
      ).toContain("cannotBeCollateral")
      expect(
        codes({
          positions: supplied({ [USDC]: false }),
          summaries: withSummary(USDC, { liquidationThreshold: "0" }),
        }),
      ).toContain("cannotBeCollateral")
    })

    it("blocks disabling while zero-LTV collateral is held", () => {
      const positions = supplied({ [USDC]: true, [DOT]: true, [WBTC]: true })

      expect(codes({ positions })).toContain("zeroLtvCollateralBlocks")
      expect(codes({ positions, asset: WBTC })).not.toContain(
        "zeroLtvCollateralBlocks",
      )
    })

    it("reports an inactive or paused reserve", () => {
      expect(
        codes({ summaries: withSummary(USDC, { isActive: false }) }),
      ).toContain("reserveInactive")
      expect(
        codes({ summaries: withSummary(USDC, { isPaused: true }) }),
      ).toContain("reservePaused")
    })

    it("lets a frozen reserve toggle", () => {
      expect(
        codes({ summaries: withSummary(USDC, { isFrozen: true }) }),
      ).not.toContain("reserveFrozen")
    })
  })

  describe("notices", () => {
    it("says enabling a non-isolated asset adds borrowing power", () => {
      const positions = supplied({ [USDC]: false, [DOT]: true })

      expect(codes({ positions })).toEqual([
        "collateralIncreasesBorrowingPower",
      ])
    })

    it("reports the debt ceiling when enabling a nearly full isolated asset", () => {
      const summaries = withSummary(PRIME, {
        isolationModeTotalDebtUsd: "99",
        debtCeilingUsd: "100",
      })
      const positions = supplied({ [PRIME]: false })

      expect(codes({ positions, summaries, asset: PRIME })).toEqual([
        "enteringIsolationMode",
        "debtCeilingNearlyReached",
      ])
    })

    it("says disabling the isolated collateral exits isolation mode", () => {
      const positions = supplied({ [PRIME]: true })

      expect(codes({ positions, asset: PRIME })).toEqual([
        "exitingIsolationMode",
      ])
    })

    it("reports no health-factor finding when enabling", () => {
      const positions = mapPositions((position) =>
        position.underlyingAsset === USDC
          ? { ...position, usageAsCollateralEnabledOnUser: false }
          : position,
      )

      expect(codes({ positions })).not.toContain("healthFactorRisk")
      expect(codes({ positions })).not.toContain("healthFactorBelowOne")
    })
  })
})
