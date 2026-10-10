import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { getMarket, readReserves } from "@/core"
import {
  fixtureTimestamp,
  fixtureUser,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
  getUserReservesDataFixture,
  reservesDataCapture,
  reservesIncentivesDataCapture,
  userReservesDataCapture,
} from "@/fixtures"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config

const captures = [
  reservesDataCapture,
  userReservesDataCapture,
  reservesIncentivesDataCapture,
]

describe("chain payload fixtures", () => {
  it("record where and when each response came from", () => {
    for (const capture of captures) {
      expect(capture.market).toBe("hydration_v3")
      expect(capture.rpcUrl).toBe("wss://hydration-rpc.n.dwellir.com")
      expect(capture.blockNumber).toBeGreaterThan(0)
      expect(capture.blockTimestamp).toBeGreaterThan(0)
      expect(capture.capturedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(capture.data.startsWith("0x")).toBe(true)
    }
  })

  it("were all captured at the same block", () => {
    const blocks = new Set(captures.map((capture) => capture.blockNumber))
    expect(blocks.size).toBe(1)
  })

  it("were captured against the addresses in the registry", () => {
    expect(reservesDataCapture.address).toBe(
      market.addresses.UI_POOL_DATA_PROVIDER,
    )
    expect(userReservesDataCapture.address).toBe(
      market.addresses.UI_POOL_DATA_PROVIDER,
    )
    expect(reservesIncentivesDataCapture.address).toBe(
      market.addresses.UI_INCENTIVE_DATA_PROVIDER,
    )
    for (const capture of captures) {
      expect(capture.args[0]).toBe(market.addresses.POOL_ADDRESSES_PROVIDER)
    }
  })

  it("decode getReservesData into reserves and a base currency", () => {
    const [reserves, baseCurrency] = getReservesDataFixture()

    expect(reserves.length).toBeGreaterThan(0)
    expect(baseCurrency.marketReferenceCurrencyUnit).toBeGreaterThan(0n)
    expect(reserves.some((reserve) => reserve.symbol === "HOLLAR")).toBe(true)
  })

  it("decode getUserReservesData into a user with collateral and debt", () => {
    const [positions, eModeCategoryId] = getUserReservesDataFixture()

    expect(fixtureUser).toMatch(/^0x[0-9a-f]{40}$/)
    expect(eModeCategoryId).toBe(0)
    expect(
      positions.some((position) => position.scaledATokenBalance > 0n),
    ).toBe(true)
    expect(positions.some((position) => position.scaledVariableDebt > 0n)).toBe(
      true,
    )
  })

  it("decode getReservesIncentivesData into one entry per reserve", () => {
    const [reserves] = getReservesDataFixture()
    const incentives = getReservesIncentivesDataFixture()

    expect(incentives.length).toBe(reserves.length)
  })
})

describe("replaying a fixture through readReserves", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    mockedReadContract.mockImplementation(async (_config, parameters) => {
      const { functionName } = parameters as { functionName: string }
      if (functionName === "getReservesData") return getReservesDataFixture()
      if (functionName === "getReservesIncentivesData")
        return getReservesIncentivesDataFixture()
      throw new Error(`Unexpected call to ${functionName}`)
    })
  })

  it("decodes every reserve the chain returned, offline", async () => {
    const { reserves, baseCurrency, incentives } = await readReserves(
      config,
      market,
    )
    const [rawReserves] = getReservesDataFixture()

    expect(reserves.length).toBe(rawReserves.length)
    expect(incentives.length).toBe(rawReserves.length)
    expect(baseCurrency.marketReferenceCurrencyDecimals).toBe(8)

    for (const reserve of reserves) {
      expect(reserve.underlyingAsset).toMatch(/^0x[0-9a-f]{40}$/)
      expect(reserve.decimals).toBeGreaterThan(0)
      expect(reserve.liquidityIndex).toMatch(/^\d+$/)
    }
  })

  it("carries a timestamp to derive against, so no test reads a clock", () => {
    expect(fixtureTimestamp).toBe(reservesDataCapture.blockTimestamp)
    expect(fixtureTimestamp).toBeGreaterThan(1700000000)
  })
})
