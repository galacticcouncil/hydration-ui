import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import type { Address } from "viem"
import { ContractFunctionZeroDataError } from "viem"
import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  ChainReadError,
  DecodeError,
  getMarket,
  MarketNotDeployedError,
  readPositions,
  readReserves,
} from "@/core"
import {
  fixtureUser,
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
  getUserReservesDataFixture,
} from "@/fixtures"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config
const user = "0xF3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691" as Address

/** One position as viem decodes it — the stable-rate fields are still there. */
const rawPosition = {
  underlyingAsset: "0x0000000000000000000000000000000000000ABC",
  scaledATokenBalance: 1234567890123456789n,
  usageAsCollateralEnabledOnUser: true,
  stableBorrowRate: 0n,
  scaledVariableDebt: 987654321n,
  principalStableDebt: 0n,
  stableBorrowLastUpdateTimestamp: 0n,
}

describe("readPositions", () => {
  beforeEach(() => {
    mockedReadContract.mockReset()
  })

  it("decodes the user's positions and their e-mode category", async () => {
    mockedReadContract.mockResolvedValue([[rawPosition], 3])

    const result = await readPositions(config, market, user)

    expect(mockedReadContract).toHaveBeenCalledTimes(1)
    expect(result.user).toBe(user.toLowerCase())
    expect(result.eModeCategoryId).toBe(3)

    const [position] = result.positions
    expect(position?.underlyingAsset).toBe(
      "0x0000000000000000000000000000000000000abc",
    )
    expect(position?.scaledATokenBalance).toBe("1234567890123456789")
    expect(position?.scaledVariableDebt).toBe("987654321")
    expect(position?.usageAsCollateralEnabledOnUser).toBe(true)
    expect(position).not.toHaveProperty("stableBorrowRate")
  })

  it("reads the market's own pool addresses provider for the given user", async () => {
    mockedReadContract.mockResolvedValue([[], 0])

    await readPositions(config, market, user)

    expect(mockedReadContract).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        address: market.addresses.UI_POOL_DATA_PROVIDER,
        functionName: "getUserReservesData",
        args: [market.addresses.POOL_ADDRESSES_PROVIDER, user],
      }),
    )
  })

  it("treats a user with no positions as a result, not an error", async () => {
    mockedReadContract.mockResolvedValue([[], 0])

    await expect(readPositions(config, market, user)).resolves.toEqual({
      user: user.toLowerCase(),
      positions: [],
      eModeCategoryId: 0,
    })
  })

  it("throws MarketNotDeployedError when the call returns empty data", async () => {
    mockedReadContract.mockRejectedValue(
      new ContractFunctionZeroDataError({
        functionName: "getUserReservesData",
      }),
    )

    await expect(readPositions(config, market, user)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof MarketNotDeployedError &&
        error.market === "hydration_v3" &&
        error.address === market.addresses.UI_POOL_DATA_PROVIDER,
    )
  })

  it("wraps a transport failure as ChainReadError", async () => {
    const transport = new Error("socket closed")
    mockedReadContract.mockRejectedValue(transport)

    await expect(readPositions(config, market, user)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ChainReadError && error.cause === transport,
    )
  })

  it("throws DecodeError, never a ZodError, on an unexpected payload", async () => {
    mockedReadContract.mockResolvedValue([
      [{ ...rawPosition, scaledATokenBalance: "a lot" }],
      0,
    ])

    await expect(readPositions(config, market, user)).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof DecodeError &&
        error.name === "DecodeError" &&
        error.path === "[0][0].scaledATokenBalance",
    )
  })

  it("fails independently of the reserves read", async () => {
    mockedReadContract.mockImplementation(async (_config, parameters) => {
      const { functionName } = parameters as { functionName: string }
      if (functionName === "getUserReservesData") {
        throw new Error("positions unavailable")
      }
      if (functionName === "getReservesData") return getReservesDataFixture()
      return getReservesIncentivesDataFixture()
    })

    const [positions, reserves] = await Promise.allSettled([
      readPositions(config, market, user),
      readReserves(config, market),
    ])

    expect(positions.status).toBe("rejected")
    expect(reserves.status).toBe("fulfilled")
  })

  it("replays the recorded response for the captured user, offline", async () => {
    mockedReadContract.mockResolvedValue(getUserReservesDataFixture())

    const result = await readPositions(config, market, fixtureUser)
    const [rawPositions, eModeCategoryId] = getUserReservesDataFixture()

    expect(result.positions.length).toBe(rawPositions.length)
    expect(result.eModeCategoryId).toBe(eModeCategoryId)
    expect(
      result.positions.some((position) => position.scaledATokenBalance !== "0"),
    ).toBe(true)
    expect(
      result.positions.some((position) => position.scaledVariableDebt !== "0"),
    ).toBe(true)

    for (const position of result.positions) {
      expect(position.underlyingAsset).toMatch(/^0x[0-9a-f]{40}$/)
      expect(position.scaledATokenBalance).toMatch(/^\d+$/)
      expect(position.scaledVariableDebt).toMatch(/^\d+$/)
    }
  })
})
