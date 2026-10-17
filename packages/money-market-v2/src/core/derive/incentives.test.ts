import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import type { Address } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  getMarket,
  readPositions,
  readReserves,
  summarizeAccount,
  summarizeReserves,
  summarizeRewards,
} from "@/core"
import {
  fixtureTimestamp,
  fixtureUser,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
  getUserReservesDataFixture,
} from "@/fixtures"
import type {
  IncentiveSide,
  MarketPositions,
  MarketReserves,
  ReserveIncentives,
  ReserveSummary,
  UserIncentiveSide,
  UserReserveIncentives,
} from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

/** A plain fixed-point decimal — never exponent notation (ADR-0006). */
const DECIMAL = /^-?\d+(\.\d+)?$/

/** The one reserve in the fixture that pays supply rewards the user holds. */
const INCENTIVISED = "0x00000000000000000000000000000001000002b2" as Address
/** A reserve whose only live emission is configured at a zero rate. */
const ZERO_RATE = "0x000000000000000000000000000000010000006e" as Address

const at = (summaries: ReserveSummary[], asset: Address) => {
  const summary = summaries.find((s) => s.underlyingAsset === asset)
  if (!summary) throw new Error(`No ${asset} reserve in the fixture`)
  return summary
}

/**
 * The chain returns a user's reward state from its own call, which US-009 did
 * not capture. These build one from the reserve emissions the fixture does
 * carry, so a user's standing against real reward configuration can be
 * asserted: `userIndex` is where the user was last settled and `unclaimed` is
 * what the controller has already booked for them.
 */
const userSideFrom = (
  side: IncentiveSide,
  userIndex: (emission: IncentiveSide["emissions"][number]) => string,
  unclaimed: string,
): UserIncentiveSide => ({
  tokenAddress: side.tokenAddress,
  incentiveControllerAddress: side.incentiveControllerAddress,
  rewards: side.emissions.map((emission) => ({
    rewardTokenSymbol: emission.rewardTokenSymbol,
    rewardTokenAddress: emission.rewardTokenAddress,
    rewardOracleAddress: emission.rewardOracleAddress,
    userUnclaimedRewards: unclaimed,
    tokenIncentivesUserIndex: userIndex(emission),
    rewardPriceFeed: emission.rewardPriceFeed,
    priceFeedDecimals: emission.priceFeedDecimals,
    rewardTokenDecimals: emission.rewardTokenDecimals,
  })),
})

const userIncentivesFrom = (
  incentives: ReserveIncentives[],
  options: {
    userIndex?: (emission: IncentiveSide["emissions"][number]) => string
    unclaimed?: string
  } = {},
): UserReserveIncentives[] => {
  const userIndex = options.userIndex ?? (() => "0")
  const unclaimed = options.unclaimed ?? "0"

  return incentives.map((entry) => ({
    underlyingAsset: entry.underlyingAsset,
    supply: userSideFrom(entry.supply, userIndex, unclaimed),
    variableBorrow: userSideFrom(entry.variableBorrow, userIndex, unclaimed),
  }))
}

describe("incentive APRs", () => {
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

  it("reports one APR per live emission, priced from the reward's own feed", () => {
    const supply = at(summaries, INCENTIVISED).supplyIncentives

    expect(supply.map((reward) => reward.rewardTokenSymbol)).toEqual(["GDOT"])
    const [gdot] = supply
    expect(Number(gdot!.rewardApr)).toBeGreaterThan(0)
    // 131172381 at eight feed decimals, and the market prices in USD one to one.
    expect(gdot!.rewardPriceInUsd).toBe("1.31172381")
  })

  it("names the controller the reward payload gives, not the market descriptor", () => {
    const [gdot] = at(summaries, INCENTIVISED).supplyIncentives
    const emissions = chain.incentives.find(
      (entry) => entry.underlyingAsset === INCENTIVISED,
    )

    expect(gdot!.incentiveControllerAddress).toBe(
      emissions!.supply.incentiveControllerAddress,
    )
    expect(Object.values(market.addresses)).not.toContain(
      gdot!.incentiveControllerAddress,
    )
  })

  it("drops an emission that has ended, where upstream would still report it", () => {
    const emissions = chain.incentives.find(
      (entry) => entry.underlyingAsset === INCENTIVISED,
    )!.supply.emissions
    const gdot = emissions.find((e) => e.rewardTokenSymbol === "GDOT")!

    // Upstream asks whether the emission outlasts the reserve's last index
    // update, which it does — so upstream reports this reward as active at any
    // timestamp. v2 asks whether it has ended yet (ADR-0009).
    expect(gdot.emissionEndTimestamp).toBeGreaterThan(
      gdot.incentivesLastUpdateTimestamp,
    )
    expect(at(summaries, INCENTIVISED).supplyIncentives).toHaveLength(1)

    const ended = summarizeReserves({
      ...chain,
      currentTimestamp: gdot.emissionEndTimestamp,
    })
    expect(at(ended, INCENTIVISED).supplyIncentives).toEqual([])
  })

  it("drops a live emission configured at a zero rate", () => {
    const emissions = chain.incentives.find(
      (entry) => entry.underlyingAsset === ZERO_RATE,
    )!.supply.emissions
    const gdot = emissions.find((e) => e.rewardTokenSymbol === "GDOT")!

    expect(gdot.emissionPerSecond).toBe("0")
    expect(gdot.emissionEndTimestamp).toBeGreaterThan(fixtureTimestamp)
    expect(
      at(summaries, ZERO_RATE).supplyIncentives.map((r) => r.rewardTokenSymbol),
    ).toEqual(["PRIME"])
  })

  it("reports no APRs for a reserve with no emissions configured", () => {
    // The provider returns an entry for every reserve; an uncentivised one
    // simply carries no emissions on either side.
    const unconfigured = summaries.filter((summary) =>
      chain.incentives.some(
        (entry) =>
          entry.underlyingAsset === summary.underlyingAsset &&
          entry.supply.emissions.length === 0 &&
          entry.variableBorrow.emissions.length === 0,
      ),
    )
    expect(unconfigured.length).toBeGreaterThan(0)

    for (const summary of unconfigured) {
      expect(summary.supplyIncentives).toEqual([])
      expect(summary.borrowIncentives).toEqual([])
    }
  })

  it("reports only plain fixed-point decimal strings", () => {
    for (const summary of summaries) {
      for (const reward of [
        ...summary.supplyIncentives,
        ...summary.borrowIncentives,
      ]) {
        expect(reward.rewardApr).toMatch(DECIMAL)
        expect(reward.rewardPriceInUsd).toMatch(DECIMAL)
      }
    }
  })
})

describe("summarizeRewards", () => {
  let chain: MarketReserves
  let positions: MarketPositions

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
    positions = await readPositions(config, market, fixtureUser)
  })

  const rewards = (userIncentives: UserReserveIncentives[]) =>
    summarizeRewards({
      reserves: chain,
      positions,
      userIncentives,
      currentTimestamp: fixtureTimestamp,
    })

  it("reports what a user has earned per reward token, priced in USD", () => {
    const claimable = rewards(userIncentivesFrom(chain.incentives))
    const gdot = claimable.find((reward) => reward.rewardTokenSymbol === "GDOT")

    expect(gdot).toBeDefined()
    expect(Number(gdot!.amount)).toBeGreaterThan(0)
    expect(gdot!.amount).toMatch(DECIMAL)
    expect(gdot!.amountUsd).toMatch(DECIMAL)
    expect(Number(gdot!.amountUsd)).toBeCloseTo(
      Number(gdot!.amount) * 1.31172381,
      12,
    )
  })

  it("names the controller the reward payload gives", () => {
    const controllers = new Set(
      chain.incentives.map((e) => e.supply.incentiveControllerAddress),
    )

    for (const reward of rewards(userIncentivesFrom(chain.incentives))) {
      expect(controllers).toContain(reward.incentiveControllerAddress)
    }
  })

  it("counts the controller's booked balance once, not once per reserve", () => {
    const carrying = chain.incentives.filter((entry) =>
      entry.supply.emissions.some((e) => e.rewardTokenSymbol === "GDOT"),
    )
    expect(carrying.length).toBeGreaterThan(1)

    // Settled right where the reserve is, so the five booked tokens dominate
    // and anything earned since the reserve's index moved is a rounding tail.
    const settled = userIncentivesFrom(chain.incentives, {
      userIndex: (emission) => emission.tokenIncentivesIndex,
      unclaimed: "5000000000000000000",
    })
    const gdot = rewards(settled).filter((r) => r.rewardTokenSymbol === "GDOT")

    expect(gdot).toHaveLength(1)
    expect(Number(gdot[0]!.amount)).toBeGreaterThanOrEqual(5)
    expect(Number(gdot[0]!.amount)).toBeLessThan(6)
  })

  it("reports nothing for a user with no reward state", () => {
    expect(rewards([])).toEqual([])
  })

  it("earns nothing further from an emission that has already ended", () => {
    const held = chain.incentives.find(
      (entry) => entry.underlyingAsset === INCENTIVISED,
    )!.supply.emissions
    const expired = held.filter(
      (emission) => emission.emissionEndTimestamp < fixtureTimestamp,
    )
    // The user holds this reserve, so a still-running emission would pay them.
    expect(expired.map((e) => e.rewardTokenSymbol)).toEqual(["BNC", "HDX"])

    // Settled at the reserve's index and nothing booked, so the only way a
    // reward could appear is the emission running on past its end.
    const settled = userIncentivesFrom(chain.incentives, {
      userIndex: (emission) => emission.tokenIncentivesIndex,
    })
    const symbols = rewards(settled).map((r) => r.rewardTokenSymbol)

    expect(symbols).not.toContain("BNC")
    expect(symbols).not.toContain("HDX")
  })

  it("reads no clock — the same timestamp gives the same answer", () => {
    const userIncentives = userIncentivesFrom(chain.incentives)
    expect(rewards(userIncentives)).toEqual(rewards(userIncentives))
  })
})

describe("position rewards", () => {
  it("credits a position only with what it has earned since the reserve moved", async () => {
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

    const chain = await readReserves(config, market)
    const positions = await readPositions(config, market, fixtureUser)
    const summaries = summarizeReserves({
      ...chain,
      currentTimestamp: fixtureTimestamp,
    })
    const userIncentives = userIncentivesFrom(chain.incentives, {
      unclaimed: "5000000000000000000",
    })

    const { positions: valued } = summarizeAccount({
      reserves: chain,
      summaries,
      positions,
      userIncentives,
      currentTimestamp: fixtureTimestamp,
    })
    const held = valued.find(
      (position) => position.underlyingAsset === INCENTIVISED,
    )

    expect(held?.rewards.length).toBeGreaterThan(0)
    for (const reward of held!.rewards) {
      // The booked five belongs to the controller, not to this position.
      expect(Number(reward.amount)).toBeLessThan(5)
      expect(reward.amount).toMatch(DECIMAL)
    }
  })

  it("leaves a position's rewards empty when no reward state was read", async () => {
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

    const chain = await readReserves(config, market)
    const positions = await readPositions(config, market, fixtureUser)
    const { positions: valued } = summarizeAccount({
      reserves: chain,
      summaries: summarizeReserves({
        ...chain,
        currentTimestamp: fixtureTimestamp,
      }),
      positions,
      currentTimestamp: fixtureTimestamp,
    })

    for (const position of valued) {
      expect(position.rewards).toEqual([])
    }
  })
})
