import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import Big from "big.js"
import type { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AssessBorrowRequest } from "@/core"
import {
  assessBorrow,
  getMarket,
  HF_MAX_TARGET,
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
import type {
  MarketPositions,
  MarketReserves,
  Position,
  Reserve,
  ReserveSummary,
} from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

/** E-mode category 1, "Stablecoins". */
const USDC = "0x0000000000000000000000000000000100000016" as Address
/** Frozen. */
const WBTC = "0x0000000000000000000000000000000100000013" as Address
/** E-mode category 2. */
const DOT = "0x0000000000000000000000000000000100000005" as Address
/** Borrowing disabled. */
const GDOT = "0x00000000000000000000000000000001000002b2" as Address
/** Isolated, with a debt ceiling; the fixture user owes a little of it. */
const PRIME = "0x000000000000000000000000000000010000002b" as Address
/** Isolated; the fixture user's main debt. */
const APY_USD = "0x000000000000000000000000000000010000002e" as Address
/** Borrowable in isolation, with no borrow cap of its own. */
const HOLLAR = "0x531a654d1696ed52e7275a8cede955e82620f99a" as Address

describe("assessBorrow", () => {
  let request: AssessBorrowRequest

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
      amount: "",
      currentTimestamp: fixtureTimestamp,
    }
  })

  const mapPositions = (
    update: (position: Position) => Position,
  ): MarketPositions => ({
    ...request.positions,
    positions: request.positions.positions.map(update),
  })

  /** The fixture user's collateral, with every debt repaid. */
  const withoutDebt = () =>
    mapPositions((position) => ({ ...position, scaledVariableDebt: "0" }))

  /** Only `asset` supplied, as collateral, and nothing owed. */
  const onlyCollateral = (asset: Address) =>
    mapPositions((position) => ({
      ...position,
      scaledATokenBalance:
        position.underlyingAsset === asset ? "1000000000000" : "0",
      scaledVariableDebt: "0",
      usageAsCollateralEnabledOnUser: position.underlyingAsset === asset,
    }))

  const withSummary = (
    asset: Address,
    patch: Partial<ReserveSummary>,
  ): ReserveSummary[] =>
    request.summaries.map((summary) =>
      summary.underlyingAsset === asset ? { ...summary, ...patch } : summary,
    )

  /** Re-derives the summaries so account and summaries share the patch. */
  const withReserve = (
    asset: Address,
    patch: Partial<Reserve>,
  ): Pick<AssessBorrowRequest, "reserves" | "summaries"> => {
    const reserves: MarketReserves = {
      ...request.reserves,
      reserves: request.reserves.reserves.map((reserve) =>
        reserve.underlyingAsset === asset ? { ...reserve, ...patch } : reserve,
      ),
    }
    return {
      reserves,
      summaries: summarizeReserves({
        ...reserves,
        currentTimestamp: fixtureTimestamp,
      }),
    }
  }

  const codes = (overrides: Partial<AssessBorrowRequest>) =>
    assessBorrow({ ...request, ...overrides }).findings.map(
      (finding) => finding.code,
    )

  describe("max", () => {
    it("is the account's borrowing power in the asset when LTV binds", () => {
      const { max } = assessBorrow(request)
      const { account } = summarizeAccount(request)
      const price = request.summaries.find(
        (summary) => summary.underlyingAsset === USDC,
      )!.priceInMarketReferenceCurrency

      expect(max).toBe(
        Big(account.availableBorrowsMarketReferenceCurrency)
          .div(price)
          .round(6, Big.roundDown)
          .toFixed(),
      )

      const { projection } = assessBorrow({ ...request, amount: max })
      expect(Big(projection.account.healthFactor).gte(HF_MAX_TARGET)).toBe(true)
    })

    it("stops at the target health factor when it binds before LTV", () => {
      // An LTV this close to the liquidation threshold would let a borrow at
      // full borrowing power land below the target.
      const patched = withReserve(USDC, { baseLTVasCollateral: "8950" })
      const { max } = assessBorrow({ ...request, ...patched })
      const { account } = summarizeAccount({ ...request, ...patched })

      expect(Big(max).gt(0)).toBe(true)
      expect(
        Big(max).lt(Big(account.availableBorrowsMarketReferenceCurrency)),
      ).toBe(true)

      const { projection } = assessBorrow({
        ...request,
        ...patched,
        amount: max,
      })
      const healthFactor = Big(projection.account.healthFactor)
      expect(healthFactor.gte(HF_MAX_TARGET)).toBe(true)
      expect(healthFactor.lt("1.011")).toBe(true)
    })

    it("is bounded by the reserve's available liquidity", () => {
      const summaries = withSummary(USDC, { availableLiquidity: "12.3456789" })
      expect(assessBorrow({ ...request, summaries }).max).toBe("12.345678")
    })

    it("bounds Hollar by the facilitator's remaining capacity", () => {
      const { max } = assessBorrow({
        ...request,
        asset: HOLLAR,
        hollarFacilitator: { level: "1000", maxCapacity: "1100.5" },
      })
      expect(max).toBe("100.5")
    })

    it("ignores Hollar's aToken balance once the facilitator is known", () => {
      const hollar = request.summaries.find(
        (summary) => summary.underlyingAsset === HOLLAR,
      )!
      const { max } = assessBorrow({
        ...request,
        asset: HOLLAR,
        hollarFacilitator: { level: "0", maxCapacity: "100000000" },
      })
      expect(Big(max).gt(hollar.availableLiquidity)).toBe(true)
    })

    it("is zero whenever a blocker applies", () => {
      expect(assessBorrow({ ...request, asset: WBTC }).max).toBe("0")
      expect(
        assessBorrow({ ...request, positions: onlyCollateral(WBTC) }).max,
      ).toBe("0")
    })

    it("never reads the amount", () => {
      expect(assessBorrow({ ...request, amount: "5" }).max).toBe(
        assessBorrow(request).max,
      )
    })
  })

  describe("blockers", () => {
    it("reports a frozen reserve, which v1's regular borrow allowed", () => {
      expect(codes({ asset: WBTC })).toContain("reserveFrozen")
    })

    it("reports an inactive or paused reserve", () => {
      expect(
        codes({ summaries: withSummary(USDC, { isActive: false }) }),
      ).toContain("reserveInactive")
      expect(
        codes({ summaries: withSummary(USDC, { isPaused: true }) }),
      ).toContain("reservePaused")
    })

    it("reports a reserve that does not lend", () => {
      expect(codes({ asset: GDOT })).toContain("borrowingDisabled")
    })

    it("reports an account with nothing to borrow against", () => {
      const positions = mapPositions((position) => ({
        ...position,
        scaledATokenBalance: "0",
        scaledVariableDebt: "0",
      }))
      expect(codes({ positions })).toContain("noCollateral")
    })

    it("reports collateral that carries no LTV", () => {
      // WBTC has an LTV of zero but still a liquidation threshold.
      expect(codes({ positions: onlyCollateral(WBTC) })).toContain(
        "noCollateral",
      )
    })

    it("names the account's e-mode category when the asset is outside it", () => {
      const positions = { ...request.positions, eModeCategoryId: 1 }
      const { findings } = assessBorrow({ ...request, positions, asset: DOT })

      expect(findings).toContainEqual({
        kind: "blocker",
        code: "eModeCategoryMismatch",
        params: { category: "Stablecoins" },
      })
      expect(codes({ positions })).not.toContain("eModeCategoryMismatch")
    })

    it("reports an asset not borrowable in isolation mode", () => {
      const positions = onlyCollateral(PRIME)

      expect(codes({ positions })).toContain("notBorrowableInIsolation")
      expect(
        codes({
          positions,
          asset: HOLLAR,
          hollarFacilitator: { level: "0", maxCapacity: "1000" },
        }),
      ).not.toContain("notBorrowableInIsolation")
    })

    it("reports borrowing a siloed reserve beside other debt", () => {
      const summaries = withSummary(DOT, { isSiloedBorrowing: true })

      expect(codes({ summaries, asset: DOT })).toContain(
        "siloedBorrowingConflict",
      )
      expect(
        codes({ summaries, asset: DOT, positions: withoutDebt() }),
      ).not.toContain("siloedBorrowingConflict")
    })

    it("reports borrowing anything else while holding siloed debt", () => {
      const summaries = withSummary(APY_USD, { isSiloedBorrowing: true })

      // The fixture user also owes a little PRIME; with that repaid, apyUSD
      // is their only debt and borrowing more of it is allowed.
      const positions = mapPositions((position) =>
        position.underlyingAsset === PRIME
          ? { ...position, scaledVariableDebt: "0" }
          : position,
      )

      expect(codes({ summaries })).toContain("siloedBorrowingConflict")
      expect(codes({ summaries, asset: APY_USD })).toContain(
        "siloedBorrowingConflict",
      )
      expect(codes({ summaries, positions, asset: APY_USD })).not.toContain(
        "siloedBorrowingConflict",
      )
    })

    it("reports an exhausted Hollar facilitator", () => {
      const { max, findings } = assessBorrow({
        ...request,
        asset: HOLLAR,
        hollarFacilitator: { level: "1000", maxCapacity: "1000" },
      })

      expect(findings.map((finding) => finding.code)).toContain(
        "hollarCapacityExhausted",
      )
      expect(max).toBe("0")
    })

    it("reports none on an open reserve within borrowing power", () => {
      const findings = assessBorrow({ ...request, amount: "100" }).findings
      expect(findings.filter((finding) => finding.kind === "blocker")).toEqual(
        [],
      )
    })
  })

  describe("health factor", () => {
    it("blocks a borrow the account's collateral cannot carry", () => {
      expect(codes({ amount: "50000" })).toContain("healthFactorBelowOne")
    })

    it("asks for acknowledgement close to liquidation", () => {
      const patched = withReserve(USDC, { baseLTVasCollateral: "8950" })
      const { max } = assessBorrow({ ...request, ...patched })

      expect(codes({ ...patched, amount: max })).toContain("healthFactorRisk")
    })
  })

  describe("notices", () => {
    it("always notes that parameter changes may move the health factor", () => {
      expect(codes({})).toContain("parameterChangesMayAffectHealthFactor")
      expect(codes({ asset: WBTC })).toContain(
        "parameterChangesMayAffectHealthFactor",
      )
    })

    it("measures the borrow cap on the reserve", () => {
      const summaries = withSummary(USDC, {
        totalDebt: "990",
        borrowCap: "1000",
      })
      const { findings } = assessBorrow({ ...request, summaries })

      expect(findings).toContainEqual({
        kind: "notice",
        tone: "warning",
        code: "borrowCapNearlyReached",
        params: { percent: 99 },
      })
    })

    it("measures Hollar's cap against the facilitator", () => {
      const { findings } = assessBorrow({
        ...request,
        asset: HOLLAR,
        hollarFacilitator: { level: "985", maxCapacity: "1000" },
      })

      expect(findings).toContainEqual({
        kind: "notice",
        tone: "warning",
        code: "borrowCapNearlyReached",
        params: { percent: 98.5 },
      })
    })

    it("measures the debt ceiling of the account's isolated collateral", () => {
      const summaries = withSummary(PRIME, {
        isolationModeTotalDebtUsd: "990",
        debtCeilingUsd: "1000",
      })
      const findings = assessBorrow({
        ...request,
        summaries,
        positions: onlyCollateral(PRIME),
        asset: HOLLAR,
        hollarFacilitator: { level: "0", maxCapacity: "1000" },
      }).findings

      expect(findings.map((finding) => finding.code)).toContain(
        "debtCeilingNearlyReached",
      )
    })
  })

  describe("projection", () => {
    it("is the current account at zero", () => {
      expect(assessBorrow(request).projection).toEqual(
        summarizeAccount(request),
      )
    })

    it("adds the borrowed amount to the asset's debt", () => {
      const { projection } = assessBorrow({ ...request, amount: "100" })
      const debt = projection.positions.find(
        (position) => position.underlyingAsset === USDC,
      )!.variableBorrows

      expect(Big(debt).minus(100).abs().lte("0.000001")).toBe(true)
    })
  })
})
