import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import Big from "big.js"
import type { Address } from "viem"
import { decodeFunctionData, getAddress, parseUnits } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AssessSupplyRequest } from "@/core"
import {
  assessSupply,
  buildSupply,
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
import type { MarketPositions, MarketWalletBalances } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

const USDC = "0x0000000000000000000000000000000100000016" as Address
const USDT = "0x000000000000000000000000000000010000000a" as Address
const GDOT = "0x00000000000000000000000000000001000002b2" as Address
const ETH = "0x0000000000000000000000000000000100000022" as Address
const WBTC = "0x0000000000000000000000000000000100000013" as Address
const PRIME = "0x000000000000000000000000000000010000002b" as Address
const APYUSD = "0x000000000000000000000000000000010000002e" as Address
/** Its supply cap of 1 is far below what it already holds. */
const PRIME_POOL = "0x000000000000000000000000000000010000008f" as Address

const OTHER_USER = "0x1111111111111111111111111111111111111111" as Address

describe("assessSupply", () => {
  let request: AssessSupplyRequest

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

  const wallet = (asset: Address, amount: string): MarketWalletBalances => ({
    user: fixtureUser,
    balances: [{ underlyingAsset: asset, amount }],
  })

  /** The fixture user's collateral, with every debt repaid. */
  const withoutDebt = (): MarketPositions => ({
    ...request.positions,
    positions: request.positions.positions.map((position) => ({
      ...position,
      scaledVariableDebt: "0",
    })),
  })

  const codes = (overrides: Partial<AssessSupplyRequest>) =>
    assessSupply({ ...request, ...overrides }).findings.map(
      (finding) => finding.code,
    )

  describe("max", () => {
    it("is the wallet balance when nothing else binds", () => {
      const { max } = assessSupply({
        ...request,
        walletBalances: wallet(USDC, "1000.5"),
      })

      expect(max).toBe("1000.5")
    })

    it("is bound by spendable over the wallet balance, truncated to decimals", () => {
      const { max } = assessSupply({
        ...request,
        walletBalances: wallet(USDC, "1000"),
        spendable: "12.3456789",
      })

      expect(max).toBe("12.345678")
    })

    it("is zero with neither a wallet balance nor spendable", () => {
      expect(assessSupply(request).max).toBe("0")
    })

    it("is bound by the room left under the supply cap", () => {
      const { max } = assessSupply({
        ...request,
        walletBalances: wallet(USDC, "100000000"),
      })

      expect(max).toBe("10273162.986973")
    })

    it("is zero on a reserve already past its supply cap", () => {
      const { max, findings } = assessSupply({
        ...request,
        asset: PRIME_POOL,
        walletBalances: wallet(PRIME_POOL, "10"),
      })

      expect(max).toBe("0")
      expect(findings).toContainEqual({
        kind: "notice",
        tone: "warning",
        code: "supplyCapNearlyReached",
        params: { percent: 100 },
      })
    })

    it("does not depend on the amount", () => {
      const maxAt = (amount: string) =>
        assessSupply({
          ...request,
          amount,
          walletBalances: wallet(USDC, "1000"),
        }).max

      expect(maxAt("1")).toBe(maxAt(""))
      expect(maxAt("999999")).toBe(maxAt(""))
    })
  })

  describe("blockers", () => {
    it.each([
      { amount: "4", cap: "1000", supplied: "995", blocked: false },
      { amount: "5", cap: "1000", supplied: "995", blocked: false },
      { amount: "5.000001", cap: "1000", supplied: "995", blocked: true },
      { amount: "10", cap: "1000", supplied: "995", blocked: true },
      { amount: "1", cap: "1000", supplied: "1000", blocked: true },
      { amount: "1", cap: "1000", supplied: "1001", blocked: true },
      { amount: "10", cap: "0", supplied: "995", blocked: false },
    ])(
      "assesses $amount supplied with $supplied of cap $cap already used",
      ({ amount, cap, supplied, blocked }) => {
        const { max, findings } = assessSupply({
          ...request,
          amount,
          summaries: request.summaries.map((summary) =>
            summary.underlyingAsset === USDC
              ? { ...summary, supplyCap: cap, totalLiquidity: supplied }
              : summary,
          ),
          // A swap can supply the asset without the user holding it already.
          walletBalances: wallet(USDC, "0"),
        })

        expect(max).toBe("0")
        expect(
          findings.some(
            (finding) =>
              finding.kind === "blocker" &&
              finding.code === "supplyCapExceeded",
          ),
        ).toBe(blocked)
        expect(hasBlocker(findings)).toBe(blocked)
      },
    )

    it("blocks a frozen reserve with a max of zero", () => {
      const { max, findings } = assessSupply({
        ...request,
        asset: WBTC,
        amount: "0.1",
        walletBalances: wallet(WBTC, "1"),
      })

      expect(max).toBe("0")
      expect(findings.map((finding) => finding.code)).toContain("reserveFrozen")
      expect(hasBlocker(findings)).toBe(true)
    })

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
        const { max, findings } = assessSupply({
          ...request,
          summaries,
          walletBalances: wallet(USDC, "1000"),
        })

        expect(max).toBe("0")
        expect(findings.map((finding) => finding.code)).toContain(code)
      },
    )

    it("finds nothing on a plain supply of an active reserve", () => {
      expect(
        codes({ amount: "100", walletBalances: wallet(USDC, "1000") }),
      ).toEqual([])
    })
  })

  describe("isolation mode", () => {
    it("joins isolation by turning every other collateral off", () => {
      const { isolationJoin, findings, projection } = assessSupply({
        ...request,
        positions: withoutDebt(),
        asset: PRIME,
        amount: "100",
      })

      expect(isolationJoin?.disableCollateral).toEqual([USDC, USDT, GDOT, ETH])
      expect(findings).toContainEqual({
        kind: "notice",
        tone: "warning",
        code: "isolationJoinDisablesCollateral",
        params: { symbol: "PRIME" },
      })
      expect(hasBlocker(findings)).toBe(false)
      expect(projection.account.isolatedReserve).toBe(PRIME)
      expect(
        projection.positions
          .filter((position) => position.usageAsCollateralEnabledOnUser)
          .map((position) => position.underlyingAsset),
      ).toEqual([PRIME])
    })

    it("blocks an isolated supply while the account has debt", () => {
      const { isolationJoin, findings } = assessSupply({
        ...request,
        asset: PRIME,
        amount: "100",
      })

      expect(isolationJoin).toBeUndefined()
      expect(findings.map((finding) => finding.code)).toEqual([
        "isolationSupplyWithDebt",
      ])
    })

    it("does not join isolation when supplying on behalf of someone else", () => {
      const { isolationJoin, findings } = assessSupply({
        ...request,
        positions: withoutDebt(),
        asset: PRIME,
        amount: "100",
        onBehalfOf: OTHER_USER,
      })

      expect(isolationJoin).toBeUndefined()
      expect(findings).toEqual([])
    })

    it("joins isolation when onBehalfOf is the user, in any casing", () => {
      const { isolationJoin } = assessSupply({
        ...request,
        positions: withoutDebt(),
        asset: PRIME,
        onBehalfOf: fixtureUser.toUpperCase().replace("0X", "0x") as Address,
      })

      expect(isolationJoin).toBeDefined()
    })

    it("does not enable a zero-LTV isolated reserve as the first collateral", () => {
      const reserves = {
        ...request.reserves,
        reserves: request.reserves.reserves.map((reserve) =>
          reserve.underlyingAsset === PRIME
            ? { ...reserve, baseLTVasCollateral: "0" }
            : reserve,
        ),
      }
      const { isolationJoin, findings, projection } = assessSupply({
        ...request,
        reserves,
        summaries: summarizeReserves({
          ...reserves,
          currentTimestamp: fixtureTimestamp,
        }),
        positions: { ...request.positions, positions: [] },
        asset: PRIME,
        amount: "100",
      })

      expect(isolationJoin).toBeUndefined()
      expect(findings).toEqual([])
      expect(projection.account.isInIsolationMode).toBe(false)
    })

    it("does not rejoin isolation when topping up active isolated collateral", () => {
      const { isolationJoin, findings, projection } = assessSupply({
        ...request,
        positions: {
          ...request.positions,
          positions: [
            {
              underlyingAsset: PRIME,
              scaledATokenBalance: "1000000",
              scaledVariableDebt: "0",
              usageAsCollateralEnabledOnUser: true,
            },
          ],
        },
        asset: PRIME,
        amount: "100",
      })

      expect(isolationJoin).toBeUndefined()
      expect(findings).toEqual([])
      expect(projection.account.isInIsolationMode).toBe(true)
    })

    it.each([PRIME, APYUSD])(
      "explicitly enables %s as the first collateral",
      (asset) => {
        const { isolationJoin, findings, projection } = assessSupply({
          ...request,
          positions: { ...request.positions, positions: [] },
          asset,
          amount: "100",
        })

        expect(isolationJoin).toEqual({ disableCollateral: [] })
        const reserve = request.reserves.reserves.find(
          (reserve) => reserve.underlyingAsset === asset,
        )
        if (!reserve) throw new Error("Missing reserve fixture")
        const amount = parseUnits("100", reserve.decimals)
        const plan = buildSupply({
          market,
          asset,
          amount,
          onBehalfOf: fixtureUser,
          isolationJoin,
        })
        expect(
          plan.map((call) =>
            decodeFunctionData({ abi: call.abi, data: call.data }),
          ),
        ).toEqual([
          {
            functionName: "supply",
            args: [getAddress(asset), amount, getAddress(fixtureUser), 0],
          },
          {
            functionName: "setUserUseReserveAsCollateral",
            args: [getAddress(asset), true],
          },
        ])
        expect(findings).toEqual([
          {
            kind: "notice",
            tone: "info",
            code: "enteringIsolationMode",
            params: {},
          },
        ])
        expect(projection.account.isInIsolationMode).toBe(true)
      },
    )
  })

  describe("projection", () => {
    it.each(["", "0", "-", "abc"])("reads %j as no amount", (amount) => {
      expect(assessSupply({ ...request, amount }).projection).toEqual(
        summarizeAccount(request),
      )
    })

    it("raises the health factor of an account with debt", () => {
      const current = summarizeAccount(request)
      const { projection } = assessSupply({ ...request, amount: "1000" })

      expect(
        Big(projection.account.healthFactor).gt(current.account.healthFactor),
      ).toBe(true)
    })
  })
})
