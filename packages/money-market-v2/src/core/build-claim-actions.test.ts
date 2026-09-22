import type { Address } from "viem"
import { decodeFunctionData, encodeFunctionData } from "viem"
import { describe, expect, it } from "vitest"

import {
  buildClaimAllRewards,
  buildClaimReward,
  getMarket,
  MAX_UINT_AMOUNT,
} from "@/core"
import { incentiveControllerAbi } from "@/core/abi"
import type {
  ClaimableReward,
  UserIncentiveSide,
  UserReserveIncentives,
  UserRewardState,
} from "@/types"

const controller = "0x0000000000000000000000000000000000000c01" as Address
const otherController = "0x0000000000000000000000000000000000000c02" as Address
const user = "0x0000000000000000000000000000000000000111" as Address

const gdot = "0x0000000000000000000000000000000000000d01" as Address
const hdx = "0x0000000000000000000000000000000000000d02" as Address

const reward = (rewardTokenAddress: Address): UserRewardState => ({
  rewardTokenSymbol: "REWARD",
  rewardTokenAddress,
  rewardOracleAddress: "0x0000000000000000000000000000000000000e01",
  userUnclaimedRewards: "0",
  tokenIncentivesUserIndex: "0",
  rewardPriceFeed: "0",
  priceFeedDecimals: 8,
  rewardTokenDecimals: 18,
})

const side = (
  tokenAddress: Address,
  incentiveControllerAddress: Address,
  rewards: UserRewardState[],
): UserIncentiveSide => ({
  tokenAddress,
  incentiveControllerAddress,
  rewards,
})

const aToken1 = "0x00000000000000000000000000000000000000a1" as Address
const debtToken1 = "0x00000000000000000000000000000000000000b1" as Address
const aToken2 = "0x00000000000000000000000000000000000000a2" as Address
const debtToken2 = "0x00000000000000000000000000000000000000b2" as Address

/** Two reserves, both sides incentivised, all four tokens on one controller. */
const userIncentives: UserReserveIncentives[] = [
  {
    underlyingAsset: "0x0000000000000000000000000000000000000001",
    supply: side(aToken1, controller, [reward(gdot), reward(hdx)]),
    variableBorrow: side(debtToken1, controller, [reward(hdx)]),
  },
  {
    underlyingAsset: "0x0000000000000000000000000000000000000002",
    supply: side(aToken2, controller, [reward(gdot)]),
    variableBorrow: side(debtToken2, controller, []),
  },
]

const claimable = (
  rewardTokenAddress: Address,
  incentiveControllerAddress = controller,
): ClaimableReward => ({
  rewardTokenAddress,
  rewardTokenSymbol: "REWARD",
  incentiveControllerAddress,
  amount: "1",
  amountUsd: "1",
})

describe("claim actions", () => {
  it("sends the claim to the controller the reward names, not to the market", () => {
    const market = getMarket("hydration_v3")
    const [call] = buildClaimReward({
      reward: claimable(gdot),
      userIncentives,
      to: user,
    })

    expect(call?.to).toBe(controller)
    expect(Object.values(market.addresses)).not.toContain(call?.to)
  })

  it("claims one reward token against every token that pays it", () => {
    const plan = buildClaimReward({
      reward: claimable(hdx),
      userIncentives,
      to: user,
    })

    expect(plan).toHaveLength(1)
    const [call] = plan
    expect(call?.functionName).toBe("claimRewards")
    // `…a2` pays GDOT only and `…b2` pays nothing, so neither is settled here.
    expect(call?.args).toEqual([
      [aToken1, debtToken1],
      MAX_UINT_AMOUNT,
      user,
      hdx,
    ])
    expect(call?.data).toBe(
      encodeFunctionData({
        abi: incentiveControllerAbi,
        functionName: "claimRewards",
        args: [[aToken1, debtToken1], MAX_UINT_AMOUNT, user, hdx],
      }),
    )
  })

  it("passes a partial amount through untouched", () => {
    const [call] = buildClaimReward({
      reward: claimable(gdot),
      userIncentives,
      to: user,
      amount: 1_500n,
    })

    expect(call?.args).toEqual([[aToken1, aToken2], 1_500n, user, gdot])
  })

  it("claims everything in one call per controller", () => {
    const plan = buildClaimAllRewards({ userIncentives, to: user })

    expect(plan).toHaveLength(1)
    const [call] = plan
    expect(call?.to).toBe(controller)
    expect(call?.functionName).toBe("claimAllRewards")
    // Every incentivised token the controller named, repeats removed.
    expect(call?.args).toEqual([
      [aToken1, debtToken1, aToken2, debtToken2],
      user,
    ])
    expect(call?.data).toBe(
      encodeFunctionData({
        abi: incentiveControllerAbi,
        functionName: "claimAllRewards",
        args: [[aToken1, debtToken1, aToken2, debtToken2], user],
      }),
    )
  })

  it("claims from each controller separately when a market has two", () => {
    const split: UserReserveIncentives[] = [
      userIncentives[0] as UserReserveIncentives,
      {
        ...(userIncentives[1] as UserReserveIncentives),
        supply: side(aToken2, otherController, [reward(gdot)]),
        variableBorrow: side(debtToken2, otherController, []),
      },
    ]

    const plan = buildClaimAllRewards({ userIncentives: split, to: user })

    expect(plan.map((call) => call.to)).toEqual([controller, otherController])
    expect(plan[0]?.args).toEqual([[aToken1, debtToken1], user])
    expect(plan[1]?.args).toEqual([[aToken2, debtToken2], user])
  })

  it("carries the gas hints and the ABI item it encoded", () => {
    const [call] = buildClaimReward({
      reward: claimable(gdot),
      userIncentives,
      to: user,
      gas: { gasLimit: 400_000n },
    })

    expect(call?.gasLimit).toBe(400_000n)
    expect(call?.abi).toHaveLength(1)
    expect(
      decodeFunctionData({
        abi: call?.abi ?? [],
        data: call?.data ?? "0x",
      }).functionName,
    ).toBe("claimRewards")
  })

  it("claims nothing when the user has no reward state", () => {
    expect(buildClaimAllRewards({ userIncentives: [], to: user })).toEqual([])
  })
})
