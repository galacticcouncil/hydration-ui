import type { Address } from "viem"
import { encodeFunctionData } from "viem"

import { incentiveControllerAbi } from "@/core/abi"
import { MAX_UINT_AMOUNT } from "@/core/constants"
import type {
  ActionPlan,
  ClaimableReward,
  EvmCall,
  GasHints,
  UserIncentiveSide,
  UserReserveIncentives,
} from "@/types"

/**
 * Claiming accrued rewards, as the same ordered list of plain calls every other
 * action returns (ADR-0007). Nothing here touches a network.
 *
 * Two things a claim needs that a pool action does not:
 *
 * - **The controller comes from the reward payload.** A market descriptor
 *   carries no incentive controller, and it could not — the controller is
 *   configured per incentivised token, so two reserves in one market may answer
 *   to different ones. Every claim is addressed to the controller the user's
 *   own reward state named.
 * - **The controller has to be told which tokens to settle.** It walks the
 *   asset list, brings each one's reward index up to date and pays what that
 *   leaves owing; a token left off the list keeps accruing unclaimed. The list
 *   is therefore every incentivised token *that controller* reported for the
 *   user, taken from the same payload.
 */

type ClaimRequest = {
  /** The user's reward state, from `readUserIncentives`. */
  userIncentives: UserReserveIncentives[]
  /** Who receives the reward tokens. */
  to: Address
  gas?: GasHints
}

/** Encodes one controller call, carrying the ABI item it encoded. */
const controllerCall = (
  controller: Address,
  functionName: "claimRewards" | "claimAllRewards",
  args: readonly unknown[],
  gas?: GasHints,
): EvmCall => ({
  to: controller,
  data: encodeFunctionData({
    abi: incentiveControllerAbi,
    functionName,
    args,
  } as Parameters<typeof encodeFunctionData>[0]),
  abi: incentiveControllerAbi.filter((item) => item.name === functionName),
  functionName,
  args,
  ...gas,
})

/** Both sides of every reserve, flattened — a claim does not care which is which. */
const sides = (userIncentives: UserReserveIncentives[]): UserIncentiveSide[] =>
  userIncentives.flatMap((reserve) => [reserve.supply, reserve.variableBorrow])

/**
 * The incentivised tokens one controller should settle, in payload order and
 * without repeats. A token appears once however many rewards it pays.
 */
const assetsOf = (
  userIncentives: UserReserveIncentives[],
  controller: Address,
  rewardTokenAddress?: Address,
): Address[] => [
  ...new Set(
    sides(userIncentives)
      .filter(
        (side) =>
          side.incentiveControllerAddress === controller &&
          (rewardTokenAddress === undefined ||
            side.rewards.some(
              (reward) => reward.rewardTokenAddress === rewardTokenAddress,
            )),
      )
      .map((side) => side.tokenAddress),
  ),
]

export type ClaimRewardRequest = ClaimRequest & {
  /** The reward to claim, from `summarizeRewards` — it names the controller. */
  reward: Pick<
    ClaimableReward,
    "rewardTokenAddress" | "incentiveControllerAddress"
  >
  /**
   * Raw base units to claim, defaulting to `MAX_UINT_AMOUNT` — the controller
   * pays the lesser of this and what is owed, so the sentinel means "all of
   * this reward token" and is never resolved against a balance here.
   */
  amount?: bigint
}

/** Claims one reward token from the controller that reward named. */
export const buildClaimReward = ({
  reward,
  userIncentives,
  to,
  amount = MAX_UINT_AMOUNT,
  gas,
}: ClaimRewardRequest): ActionPlan => {
  const controller = reward.incentiveControllerAddress

  return [
    controllerCall(
      controller,
      "claimRewards",
      [
        assetsOf(userIncentives, controller, reward.rewardTokenAddress),
        amount,
        to,
        reward.rewardTokenAddress,
      ],
      gas,
    ),
  ]
}

export type ClaimAllRewardsRequest = ClaimRequest

/**
 * Claims every reward token the user has accrued — one call per controller the
 * payload names, in the order they first appear. A market with a single
 * controller, which is every market today, yields a plan of one.
 */
export const buildClaimAllRewards = ({
  userIncentives,
  to,
  gas,
}: ClaimAllRewardsRequest): ActionPlan => {
  const controllers = new Set(
    sides(userIncentives).map((side) => side.incentiveControllerAddress),
  )

  return [...controllers].map((controller) =>
    controllerCall(
      controller,
      "claimAllRewards",
      [assetsOf(userIncentives, controller), to],
      gas,
    ),
  )
}
