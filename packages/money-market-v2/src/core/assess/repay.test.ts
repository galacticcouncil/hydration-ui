import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import Big from "big.js"
import type { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { AssessRepayRequest } from "@/core"
import {
  assessRepay,
  getMarket,
  hasAcknowledgement,
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
import type { ReserveSummary } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

/** The fixture user's main debt. */
const APY_USD = "0x000000000000000000000000000000010000002e" as Address
/** Supplied as collateral, owed nothing. */
const USDC = "0x0000000000000000000000000000000100000016" as Address

describe("assessRepay", () => {
  let request: AssessRepayRequest
  let debt: string

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
      asset: APY_USD,
      amount: "",
      currentTimestamp: fixtureTimestamp,
    }
    debt = summarizeAccount(request).positions.find(
      (position) => position.underlyingAsset === APY_USD,
    )!.variableBorrows
  })

  const wallet = (amount: string, asset = APY_USD) => ({
    user: fixtureUser,
    balances: [{ underlyingAsset: asset, amount }],
  })

  const withSummary = (
    asset: Address,
    patch: Partial<ReserveSummary>,
  ): ReserveSummary[] =>
    request.summaries.map((summary) =>
      summary.underlyingAsset === asset ? { ...summary, ...patch } : summary,
    )

  const codes = (overrides: Partial<AssessRepayRequest>) =>
    assessRepay({ ...request, ...overrides }).findings.map(
      (finding) => finding.code,
    )

  it("has debt to repay in the fixture", () => {
    expect(Big(debt).gt(0)).toBe(true)
  })

  describe("max", () => {
    it("is the whole debt when the wallet covers it", () => {
      const { max, maxClearsPosition, findings } = assessRepay({
        ...request,
        walletBalances: wallet(Big(debt).plus(1).toFixed()),
      })

      expect(max).toBe(debt)
      expect(maxClearsPosition).toBe(true)
      expect(findings).toEqual([])
    })

    it("clears the position when the wallet holds exactly the debt", () => {
      expect(
        assessRepay({ ...request, walletBalances: wallet(debt) })
          .maxClearsPosition,
      ).toBe(true)
    })

    it("is the wallet balance, leaving debt, when the wallet falls short", () => {
      const { max, maxClearsPosition, findings } = assessRepay({
        ...request,
        walletBalances: wallet("10"),
      })

      expect(max).toBe("10")
      expect(maxClearsPosition).toBe(false)
      expect(findings).toEqual([
        {
          kind: "notice",
          tone: "warning",
          code: "repayLeavesDebt",
          params: {},
        },
      ])
    })

    it("prefers spendable to the wallet balance", () => {
      const { max, maxClearsPosition } = assessRepay({
        ...request,
        walletBalances: wallet(Big(debt).plus(1).toFixed()),
        spendable: "5",
      })

      expect(Big(max).eq(5)).toBe(true)
      expect(maxClearsPosition).toBe(false)
    })

    it("reads the matching wallet balance case-insensitively", () => {
      expect(
        assessRepay({
          ...request,
          walletBalances: wallet("10", APY_USD.toUpperCase() as Address),
        }).max,
      ).toBe("10")
    })

    it("is zero with no wallet balance", () => {
      const { max, maxClearsPosition } = assessRepay(request)

      expect(max).toBe("0")
      expect(maxClearsPosition).toBe(false)
    })

    it("is zero when a blocker applies", () => {
      const { max, maxClearsPosition } = assessRepay({
        ...request,
        summaries: withSummary(APY_USD, { isPaused: true }),
        walletBalances: wallet(Big(debt).plus(1).toFixed()),
      })

      expect(max).toBe("0")
      expect(maxClearsPosition).toBe(false)
    })

    it("never reads the amount", () => {
      const walletBalances = wallet("10")
      expect(assessRepay({ ...request, walletBalances, amount: "5" }).max).toBe(
        assessRepay({ ...request, walletBalances }).max,
      )
    })

    it("is a fixed-point string", () => {
      expect(
        assessRepay({ ...request, walletBalances: wallet("1e-3") }).max,
      ).toMatch(/^\d+\.\d+$/)
    })
  })

  describe("blockers", () => {
    it("reports an asset the account owes nothing of", () => {
      const assessment = assessRepay({
        ...request,
        asset: USDC,
        walletBalances: wallet("10", USDC),
      })

      expect(assessment.max).toBe("0")
      expect(assessment.maxClearsPosition).toBe(false)
      expect(assessment.findings.map((finding) => finding.code)).toEqual([
        "noDebt",
      ])
    })

    it("reports an inactive or paused reserve", () => {
      expect(
        codes({ summaries: withSummary(APY_USD, { isActive: false }) }),
      ).toEqual(["reserveInactive"])
      expect(
        codes({ summaries: withSummary(APY_USD, { isPaused: true }) }),
      ).toEqual(["reservePaused"])
    })

    it("lets a frozen reserve be repaid", () => {
      const findings = assessRepay({
        ...request,
        summaries: withSummary(APY_USD, { isFrozen: true }),
        walletBalances: wallet(debt),
      }).findings

      expect(hasBlocker(findings)).toBe(false)
    })
  })

  describe("projection", () => {
    it("reduces the debt and raises the health factor", () => {
      const current = summarizeAccount(request)
      const { projection } = assessRepay({ ...request, amount: "10" })

      expect(
        Big(projection.account.totalBorrowsMarketReferenceCurrency).lt(
          current.account.totalBorrowsMarketReferenceCurrency,
        ),
      ).toBe(true)
      expect(
        Big(projection.account.healthFactor).gt(current.account.healthFactor),
      ).toBe(true)
    })

    it("is the current account for a zero amount", () => {
      expect(assessRepay(request).projection).toEqual(summarizeAccount(request))
    })

    it("never raises a health factor acknowledgement", () => {
      const { findings } = assessRepay({
        ...request,
        walletBalances: wallet("10"),
        amount: "10",
      })

      expect(hasAcknowledgement(findings)).toBe(false)
      expect(findings.map((finding) => finding.code)).not.toContain(
        "healthFactorRisk",
      )
    })
  })
})
