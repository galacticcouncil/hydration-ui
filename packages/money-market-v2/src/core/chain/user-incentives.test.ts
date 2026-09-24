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
  readUserIncentives,
} from "@/core"

vi.mock("@wagmi/core", () => ({ readContract: vi.fn() }))

const mockedReadContract = vi.mocked(readContract)

const market = getMarket("hydration_v3")
const config = {} as Config
const user = "0xF3Ba4D1b50f78301BDD7EAEa9B67822A15FCA691" as Address

/** One user reward as viem decodes it. */
const rawReward = {
  rewardTokenSymbol: "GDOT",
  rewardOracleAddress: "0x0000000000000000000000000000000000000AAA",
  rewardTokenAddress: "0x0000000000000000000000000000000000000BBB",
  userUnclaimedRewards: 1234567890123456789n,
  tokenIncentivesUserIndex: 31546047135696522n,
  rewardPriceFeed: 131172381n,
  priceFeedDecimals: 8,
  rewardTokenDecimals: 18,
}

const rawSide = (rewards: unknown[]) => ({
  tokenAddress: "0x0000000000000000000000000000000000000CCC",
  incentiveControllerAddress: "0x0000000000000000000000000000000000000DDD",
  userRewardsInformation: rewards,
})

const rawUserReserve = {
  underlyingAsset: "0x0000000000000000000000000000000000000ABC",
  aTokenIncentivesUserData: rawSide([rawReward]),
  vTokenIncentivesUserData: rawSide([]),
  sTokenIncentivesUserData: rawSide([rawReward]),
}

describe("readUserIncentives", () => {
  beforeEach(() => {
    mockedReadContract.mockReset()
  })

  it("decodes the user's reward state for both modelled sides", async () => {
    mockedReadContract.mockResolvedValue([rawUserReserve])

    const [entry] = await readUserIncentives(config, market, user)

    expect(entry?.underlyingAsset).toBe(
      "0x0000000000000000000000000000000000000abc",
    )
    expect(entry?.variableBorrow.rewards).toEqual([])
    expect(entry).not.toHaveProperty("sTokenIncentivesUserData")

    const [reward] = entry!.supply.rewards
    expect(reward?.rewardTokenAddress).toBe(
      "0x0000000000000000000000000000000000000bbb",
    )
    expect(reward?.userUnclaimedRewards).toBe("1234567890123456789")
    expect(reward?.tokenIncentivesUserIndex).toBe("31546047135696522")
    expect(reward?.rewardPriceFeed).toBe("131172381")
    expect(reward?.rewardTokenDecimals).toBe(18)
  })

  it("asks the market's own incentive data provider for the given user", async () => {
    mockedReadContract.mockResolvedValue([])

    await readUserIncentives(config, market, user)

    expect(mockedReadContract).toHaveBeenCalledWith(
      config,
      expect.objectContaining({
        address: market.addresses.UI_INCENTIVE_DATA_PROVIDER,
        functionName: "getUserReservesIncentivesData",
        args: [market.addresses.POOL_ADDRESSES_PROVIDER, user],
      }),
    )
  })

  it("treats a user with no reward state as an ordinary empty result", async () => {
    mockedReadContract.mockResolvedValue([])

    await expect(readUserIncentives(config, market, user)).resolves.toEqual([])
  })

  it("reports empty return data as a market that is not deployed", async () => {
    mockedReadContract.mockRejectedValue(
      new ContractFunctionZeroDataError({
        functionName: "getUserReservesIncentivesData",
      }),
    )

    await expect(
      readUserIncentives(config, market, user),
    ).rejects.toBeInstanceOf(MarketNotDeployedError)
  })

  it("wraps a transport failure as a retryable read error", async () => {
    const cause = new Error("socket closed")
    mockedReadContract.mockRejectedValue(cause)

    await expect(readUserIncentives(config, market, user)).rejects.toSatisfy(
      (error) => error instanceof ChainReadError && error.cause === cause,
    )
  })

  it("wraps a payload that does not match the schema as a decode error", async () => {
    mockedReadContract.mockResolvedValue([
      { ...rawUserReserve, underlyingAsset: "not an address" },
    ])

    await expect(readUserIncentives(config, market, user)).rejects.toSatisfy(
      (error) =>
        error instanceof DecodeError && error.path === "[0].underlyingAsset",
    )
  })
})
