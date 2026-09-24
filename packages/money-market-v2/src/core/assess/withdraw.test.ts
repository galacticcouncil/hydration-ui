import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import Big from "big.js"
import type { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AssessWithdrawRequest } from "@/core"
import {
  assessWithdraw,
  getMarket,
  hasBlocker,
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
import type { MarketPositions, Position } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

const USDC = "0x0000000000000000000000000000000100000016" as Address
/** Frozen, with an LTV of zero but a liquidation threshold of 0.7. */
const WBTC = "0x0000000000000000000000000000000100000013" as Address
const DOT = "0x0000000000000000000000000000000100000005" as Address

describe("assessWithdraw", () => {
  let request: AssessWithdrawRequest

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

  const balanceOf = (asset: Address, positions = request.positions) =>
    summarizeAccount({ ...request, positions }).positions.find(
      (position) => position.underlyingAsset === asset,
    )?.underlyingBalance ?? "0"

  const codes = (overrides: Partial<AssessWithdrawRequest>) =>
    assessWithdraw({ ...request, ...overrides }).findings.map(
      (finding) => finding.code,
    )

  describe("max", () => {
    it("is the whole position when there is no debt", () => {
      const positions = withoutDebt()
      const { max, maxClearsPosition } = assessWithdraw({
        ...request,
        positions,
      })

      expect(max).toBe(balanceOf(USDC, positions))
      expect(Big(max).gt(0)).toBe(true)
      expect(maxClearsPosition).toBe(true)
    })

    it("stops collateral backing debt at the target health factor", () => {
      const { max, maxClearsPosition } = assessWithdraw(request)

      expect(Big(max).gt(0)).toBe(true)
      expect(Big(max).lt(balanceOf(USDC))).toBe(true)
      expect(maxClearsPosition).toBe(false)

      const { projection } = assessWithdraw({ ...request, amount: max })
      const healthFactor = Big(projection.account.healthFactor)
      expect(healthFactor.gte(HF_MAX_TARGET)).toBe(true)
      expect(healthFactor.lt("1.011")).toBe(true)
    })

    it("uses the e-mode liquidation threshold when the category matches", () => {
      const positions = { ...request.positions, eModeCategoryId: 1 }
      const base = assessWithdraw(request).max
      const { max } = assessWithdraw({ ...request, positions })

      expect(Big(max).gt(base)).toBe(true)

      const { projection } = assessWithdraw({
        ...request,
        positions,
        amount: max,
      })
      const healthFactor = Big(projection.account.healthFactor)
      expect(healthFactor.gte(HF_MAX_TARGET)).toBe(true)
      expect(healthFactor.lt("1.011")).toBe(true)
    })

    it("is zero when the health factor is already below the target", () => {
      const positions = mapPositions((position) =>
        position.underlyingAsset === USDC
          ? {
              ...position,
              scaledVariableDebt: position.scaledATokenBalance,
            }
          : position,
      )

      expect(assessWithdraw({ ...request, positions }).max).toBe("0")
    })

    it("is bound by spendable, which then does not clear the position", () => {
      const { max, maxClearsPosition } = assessWithdraw({
        ...request,
        positions: withoutDebt(),
        spendable: "100.1234567",
      })

      expect(max).toBe("100.123456")
      expect(maxClearsPosition).toBe(false)
    })

    it("is bound by the reserve's uncapped available liquidity", () => {
      const reserves = {
        ...request.reserves,
        reserves: request.reserves.reserves.map((reserve) =>
          reserve.underlyingAsset === USDC
            ? { ...reserve, availableLiquidity: "5000000" }
            : reserve,
        ),
      }
      const { max, maxClearsPosition } = assessWithdraw({
        ...request,
        reserves,
        positions: withoutDebt(),
      })

      expect(max).toBe("5")
      expect(maxClearsPosition).toBe(false)
    })

    it("is not bound by health factor for a position that is not collateral", () => {
      const positions = mapPositions((position) =>
        position.underlyingAsset === USDC
          ? { ...position, usageAsCollateralEnabledOnUser: false }
          : position,
      )
      const { max, maxClearsPosition } = assessWithdraw({
        ...request,
        positions,
      })

      expect(max).toBe(balanceOf(USDC))
      expect(maxClearsPosition).toBe(true)
    })

    it("is zero, and clears nothing, without a position", () => {
      const { max, maxClearsPosition } = assessWithdraw({
        ...request,
        asset: DOT,
      })

      expect(max).toBe("0")
      expect(maxClearsPosition).toBe(false)
    })

    it("does not depend on the amount", () => {
      const maxAt = (amount: string) =>
        assessWithdraw({ ...request, amount }).max

      expect(maxAt("1")).toBe(maxAt(""))
      expect(maxAt("999999")).toBe(maxAt(""))
    })
  })

  describe("blockers", () => {
    it.each([
      { flag: "isActive", value: false, code: "reserveInactive" },
      { flag: "isPaused", value: true, code: "reservePaused" },
    ] as const)(
      "blocks with $code and a max of zero",
      ({ flag, value, code }) => {
        const summaries = request.summaries.map((summary) =>
          summary.underlyingAsset === USDC
            ? { ...summary, [flag]: value }
            : summary,
        )
        const { max, findings } = assessWithdraw({
          ...request,
          summaries,
          amount: "1",
        })

        expect(max).toBe("0")
        expect(findings.map((finding) => finding.code)).toContain(code)
      },
    )

    it("lets a frozen reserve be withdrawn from", () => {
      const summaries = request.summaries.map((summary) =>
        summary.underlyingAsset === USDC
          ? { ...summary, isFrozen: true }
          : summary,
      )

      expect(codes({ summaries, amount: "1" })).toEqual([])
    })

    it("blocks an amount beyond the uncapped available liquidity", () => {
      const reserves = {
        ...request.reserves,
        reserves: request.reserves.reserves.map((reserve) =>
          reserve.underlyingAsset === USDC
            ? { ...reserve, availableLiquidity: "5000000" }
            : reserve,
        ),
      }

      expect(codes({ reserves, amount: "5" })).toEqual([])
      expect(codes({ reserves, amount: "5.000001" })).toEqual([
        "insufficientLiquidity",
      ])
    })

    describe("zero-LTV collateral", () => {
      /** The fixture user, also holding WBTC as collateral. */
      const withWbtc = () =>
        mapPositions((position) =>
          position.underlyingAsset === WBTC
            ? {
                ...position,
                scaledATokenBalance: "10000000",
                usageAsCollateralEnabledOnUser: true,
              }
            : position,
        )

      it("blocks withdrawing other collateral backing debt", () => {
        const findings = assessWithdraw({
          ...request,
          positions: withWbtc(),
          amount: "1",
        }).findings

        expect(findings).toContainEqual({
          kind: "blocker",
          code: "zeroLtvCollateralBlocks",
          params: { symbols: ["WBTC"] },
        })
      })

      it("lets the zero-LTV collateral itself leave", () => {
        expect(
          codes({ positions: withWbtc(), asset: WBTC, amount: "0.01" }),
        ).not.toContain("zeroLtvCollateralBlocks")
      })

      it("does not block without debt", () => {
        const positions = mapPositions((position) => ({
          ...position,
          scaledVariableDebt: "0",
          ...(position.underlyingAsset === WBTC && {
            scaledATokenBalance: "10000000",
            usageAsCollateralEnabledOnUser: true,
          }),
        }))

        expect(codes({ positions, amount: "1" })).toEqual([])
      })
    })
  })

  describe("health factor", () => {
    it("blocks withdrawing all collateral backing debt", () => {
      const findings = assessWithdraw({
        ...request,
        amount: balanceOf(USDC),
      }).findings

      expect(findings.map((finding) => finding.code)).toContain(
        "healthFactorBelowOne",
      )
      expect(hasBlocker(findings)).toBe(true)
    })

    it("reports beyond the max's headroom", () => {
      const { max } = assessWithdraw(request)
      const beyond = Big(max).times("1.05").round(6, Big.roundDown).toFixed()

      expect(codes({ amount: beyond })).toEqual(
        expect.arrayContaining([
          expect.stringMatching(/^healthFactor(BelowOne|Risk)$/),
        ]),
      )
    })

    it("finds nothing within the headroom", () => {
      expect(codes({ amount: "100" })).toEqual([])
    })

    it("ignores the health factor for a position that is not collateral", () => {
      const positions = mapPositions((position) =>
        position.underlyingAsset === USDC
          ? { ...position, usageAsCollateralEnabledOnUser: false }
          : position,
      )

      expect(codes({ positions, amount: balanceOf(USDC) })).toEqual([])
    })
  })

  describe("projection", () => {
    it("is the current account for an empty amount", () => {
      expect(assessWithdraw(request).projection).toEqual(
        summarizeAccount(request),
      )
    })

    it("lowers the health factor of an account with debt", () => {
      const { projection } = assessWithdraw({ ...request, amount: "1000" })

      expect(
        Big(projection.account.healthFactor).lt(
          summarizeAccount(request).account.healthFactor,
        ),
      ).toBe(true)
    })
  })
})
