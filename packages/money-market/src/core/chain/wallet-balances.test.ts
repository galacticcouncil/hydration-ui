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
  readReserves,
  readWalletBalances,
} from "@/core"
import {
  getReservesDataFixture,
  getReservesIncentivesDataFixture,
} from "@/fixtures"
import type { Reserve } from "@/types"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config
const user = "0xF3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691" as Address

/** The chain's own reserve list, so the decimals under test are the real ones. */
const marketReserves = async (): Promise<Reserve[]> => {
  mockedReadContract.mockImplementation(async (_config, parameters) => {
    const { functionName } = parameters as { functionName: string }
    return functionName === "getReservesData"
      ? getReservesDataFixture()
      : getReservesIncentivesDataFixture()
  })
  const { reserves } = await readReserves(config, market)
  mockedReadContract.mockReset()
  return reserves
}

describe("readWalletBalances", () => {
  beforeEach(() => {
    mockedReadContract.mockReset()
  })

  it("reports each balance in the reserve's own human units", async () => {
    const reserves = await marketReserves()
    const [first, second] = reserves
    if (!first || !second) throw new Error("fixture has too few reserves")

    mockedReadContract.mockResolvedValue([
      [first.underlyingAsset, second.underlyingAsset],
      [10n ** BigInt(first.decimals) * 3n + 1n, 0n],
    ])

    const result = await readWalletBalances(config, market, user, reserves)

    expect(result.user).toBe(user.toLowerCase())
    expect(result.balances).toEqual([
      {
        underlyingAsset: first.underlyingAsset,
        amount: `3.${"0".repeat(first.decimals - 1)}1`,
      },
      { underlyingAsset: second.underlyingAsset, amount: "0" },
    ])
  })

  it("reads the market's own wallet balance provider for the given user", async () => {
    mockedReadContract.mockResolvedValue([[], []])

    await readWalletBalances(config, market, user, [])

    expect(mockedReadContract).toHaveBeenCalledTimes(1)
    expect(mockedReadContract).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        address: market.addresses.WALLET_BALANCE_PROVIDER,
        functionName: "getUserWalletBalances",
        args: [market.addresses.POOL_ADDRESSES_PROVIDER, user],
      }),
    )
  })

  it("drops an asset the reserve list cannot give a unit", async () => {
    const reserves = await marketReserves()
    const [first] = reserves
    if (!first) throw new Error("fixture has too few reserves")

    mockedReadContract.mockResolvedValue([
      ["0x0000000000000000000000000000000000000ABC", first.underlyingAsset],
      [1n, 10n ** BigInt(first.decimals)],
    ])

    const { balances } = await readWalletBalances(
      config,
      market,
      user,
      reserves,
    )

    expect(balances).toEqual([
      { underlyingAsset: first.underlyingAsset, amount: "1" },
    ])
  })

  it("throws MarketNotDeployedError when the call returns empty data", async () => {
    mockedReadContract.mockRejectedValue(
      new ContractFunctionZeroDataError({
        functionName: "getUserWalletBalances",
      }),
    )

    await expect(
      readWalletBalances(config, market, user, []),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof MarketNotDeployedError &&
        error.market === "hydration_v3" &&
        error.address === market.addresses.WALLET_BALANCE_PROVIDER,
    )
  })

  it("wraps a transport failure as ChainReadError", async () => {
    const transport = new Error("socket closed")
    mockedReadContract.mockRejectedValue(transport)

    await expect(
      readWalletBalances(config, market, user, []),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof ChainReadError && error.cause === transport,
    )
  })

  it("throws DecodeError, never a ZodError, on an unexpected payload", async () => {
    mockedReadContract.mockResolvedValue([["not an address"], [1n]])

    await expect(
      readWalletBalances(config, market, user, []),
    ).rejects.toSatisfy(
      (error: unknown) =>
        error instanceof DecodeError &&
        error.name === "DecodeError" &&
        error.path === "[0][0]",
    )
  })

  it("rejects parallel arrays of different lengths rather than dropping a balance", async () => {
    mockedReadContract.mockResolvedValue([
      ["0x0000000000000000000000000000000000000ABC"],
      [],
    ])

    await expect(
      readWalletBalances(config, market, user, []),
    ).rejects.toBeInstanceOf(DecodeError)
  })

  it("fails independently of the reserves read", async () => {
    mockedReadContract.mockImplementation(async (_config, parameters) => {
      const { functionName } = parameters as { functionName: string }
      if (functionName === "getUserWalletBalances") {
        throw new Error("balances unavailable")
      }
      if (functionName === "getReservesData") return getReservesDataFixture()
      return getReservesIncentivesDataFixture()
    })

    const [balances, reserves] = await Promise.allSettled([
      readWalletBalances(config, market, user, []),
      readReserves(config, market),
    ])

    expect(balances.status).toBe("rejected")
    expect(reserves.status).toBe("fulfilled")
  })
})
