import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import Big from "big.js"
import type { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { SummarizeAccountRequest } from "@/core"
import {
  getMarket,
  readPositions,
  readReserves,
  summarizeAccount,
  summarizeReserves,
} from "@/core"
import type { PositionChange } from "@/core/assess/project-account"
import { projectAccount, projectPositions } from "@/core/assess/project-account"
import {
  fixtureTimestamp,
  fixtureUser,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
  getUserReservesDataFixture,
} from "@/fixtures"
import type { MarketPositions } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

const USDC = "0x0000000000000000000000000000000100000016" as Address
const DOT = "0x0000000000000000000000000000000100000005" as Address
const PRIME = "0x000000000000000000000000000000010000002b" as Address
const APYUSD = "0x000000000000000000000000000000010000002e" as Address

/** More than any position in the fixture holds or owes. */
const EVERYTHING = 10n ** 40n

describe("projectAccount", () => {
  let request: SummarizeAccountRequest

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
      currentTimestamp: fixtureTimestamp,
    }
  })

  /** The fixture user's positions, narrowed to the given assets. */
  const only = (...assets: Address[]): MarketPositions => ({
    ...request.positions,
    positions: request.positions.positions.filter((position) =>
      assets.includes(position.underlyingAsset),
    ),
  })

  const project = (change: PositionChange, positions = request.positions) =>
    projectAccount({ ...request, positions, change })

  const position = (positions: MarketPositions, asset: Address) =>
    positions.positions.find((entry) => entry.underlyingAsset === asset)

  it.each<PositionChange>([
    { kind: "supply", asset: USDC, amountRaw: 0n },
    { kind: "withdraw", asset: USDC, amountRaw: 0n },
    { kind: "borrow", asset: APYUSD, amountRaw: 0n },
    { kind: "repay", asset: APYUSD, amountRaw: 0n },
    { kind: "supply", asset: DOT, amountRaw: 0n },
  ])("leaves the account unchanged on a zero $kind", (change) => {
    expect(project(change)).toEqual(summarizeAccount(request))
  })

  it("returns the original health factor after supplying then withdrawing the same amount", () => {
    const change = { asset: USDC, amountRaw: 1_000_000_000n }
    const supplied = projectPositions({
      ...request,
      change: { kind: "supply", ...change },
    })
    const after = projectAccount({
      ...request,
      positions: supplied,
      change: { kind: "withdraw", ...change },
    })

    expect(
      project({ kind: "supply", ...change }).account.healthFactor,
    ).not.toBe(summarizeAccount(request).account.healthFactor)
    expect(after.account.healthFactor).toBe(
      summarizeAccount(request).account.healthFactor,
    )
  })

  it("returns the original health factor after borrowing then repaying the same amount", () => {
    const change = { asset: APYUSD, amountRaw: 10n ** 21n }
    const borrowed = projectPositions({
      ...request,
      change: { kind: "borrow", ...change },
    })
    const after = projectAccount({
      ...request,
      positions: borrowed,
      change: { kind: "repay", ...change },
    })

    expect(after.account.healthFactor).toBe(
      summarizeAccount(request).account.healthFactor,
    )
  })

  it("reports no health factor after withdrawing all collateral with no debt", () => {
    const { account, positions } = project(
      { kind: "withdraw", asset: USDC, amountRaw: EVERYTHING },
      only(USDC),
    )

    expect(account.healthFactor).toBe("-1")
    expect(account.totalCollateralMarketReferenceCurrency).toBe("0")
    expect(positions[0]?.underlyingBalance).toBe("0")
    expect(positions[0]?.usageAsCollateralEnabledOnUser).toBe(false)
  })

  it("drops below 1 when the only collateral backing debt is switched off", () => {
    const positions = only(USDC, APYUSD)
    const current = summarizeAccount({ ...request, positions })
    const after = project(
      { kind: "setUsageAsCollateral", asset: USDC, enabled: false },
      positions,
    )

    expect(Big(current.account.healthFactor).gt(1)).toBe(true)
    expect(Big(after.account.healthFactor).lt(1)).toBe(true)
  })

  it("never takes a balance below zero", () => {
    const { positions } = project(
      { kind: "repay", asset: APYUSD, amountRaw: EVERYTHING },
      only(USDC, APYUSD),
    )

    expect(positions.find((p) => p.symbol === "apyUSD")?.variableBorrows).toBe(
      "0",
    )
  })

  it("creates a position when supplying a reserve the user has none of", () => {
    const empty = only()
    const positions = projectPositions({
      ...request,
      positions: empty,
      change: { kind: "supply", asset: USDC, amountRaw: 1_000_000_000n },
    })
    const { account } = projectAccount({
      ...request,
      positions: empty,
      change: { kind: "supply", asset: USDC, amountRaw: 1_000_000_000n },
    })

    expect(position(positions, USDC)?.usageAsCollateralEnabledOnUser).toBe(true)
    expect(Big(account.totalCollateralMarketReferenceCurrency).gt(0)).toBe(true)
  })

  it("creates a position when borrowing a reserve the user has none of", () => {
    const positions = projectPositions({
      ...request,
      positions: only(USDC),
      change: { kind: "borrow", asset: DOT, amountRaw: 10n ** 10n },
    })

    expect(
      BigInt(position(positions, DOT)?.scaledVariableDebt ?? "0") > 0n,
    ).toBe(true)
    expect(position(positions, DOT)?.usageAsCollateralEnabledOnUser).toBe(false)
  })

  it("does not make an isolated reserve collateral beside existing collateral", () => {
    const positions = projectPositions({
      ...request,
      positions: only(USDC),
      change: { kind: "supply", asset: PRIME, amountRaw: 1_000_000n },
    })

    expect(position(positions, PRIME)?.usageAsCollateralEnabledOnUser).toBe(
      false,
    )
  })

  it("leaves only the supplied asset as collateral on an isolation join", () => {
    const change: PositionChange = {
      kind: "isolationJoin",
      asset: PRIME,
      amountRaw: 1_000_000n,
    }
    const positions = projectPositions({ ...request, change })
    const { account } = project(change)

    expect(
      positions.positions
        .filter((entry) => entry.usageAsCollateralEnabledOnUser)
        .map((entry) => entry.underlyingAsset),
    ).toEqual([PRIME])
    expect(account.isInIsolationMode).toBe(true)
    expect(account.isolatedReserve).toBe(PRIME)
  })

  it("values collateral at the new e-mode category's parameters", () => {
    const current = summarizeAccount(request)
    const { account } = project({ kind: "setEMode", categoryId: 1 })

    expect(account.eModeCategoryId).toBe(1)
    expect(
      Big(account.currentLiquidationThreshold).gt(
        current.account.currentLiquidationThreshold,
      ),
    ).toBe(true)
  })
})
