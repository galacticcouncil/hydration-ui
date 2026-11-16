import Big from "big.js"
import { millisecondsInHour, millisecondsInSecond } from "date-fns/constants"
import { type Hex } from "viem"
import { z } from "zod/v4"

const hex = (bytes: number) => {
  const pattern = new RegExp(`^0x[0-9a-fA-F]{${bytes * 2}}$`)
  return z.custom<Hex>(
    (value) => typeof value === "string" && pattern.test(value),
  )
}

const address = hex(20)
const bytes32 = hex(32)
const rawAmount = z.string().regex(/^\d+$/)
const usdAmount = z.string().regex(/^\d+(\.\d+)?$/)

/** `trees/<root>.json` under the distributor's data URL: one root's claims. */
export const claimsFileSchema = z.object({
  format: z.literal("hydration-rewards-claims/1"),
  reward: address,
  root: bytes32,
  leafEncoding: z.tuple([
    z.literal("address"),
    z.literal("address"),
    z.literal("uint256"),
  ]),
  // keyed by lowercase account address; claimable is cumulative
  claims: z.record(
    z.string(),
    z.object({ claimable: rawAmount, proof: z.array(bytes32) }),
  ),
})

/** `latest.json` under the distributor's data URL: the newest hourly snapshot. */
export const latestFileSchema = z.object({
  format: z.literal("hydration-rewards-latest/1"),
  // hour is the unix time, in seconds, the snapshot's hour starts at
  asOf: z.object({
    hour: z.number(),
    block: z.number(),
    blockTime: z.number(),
  }),
  reward: z.object({ symbol: z.string(), address, decimals: z.number() }),
  program: z.object({
    name: z.string(),
    sha256: z.string(),
    maxHollarDebtUsd: usdAmount,
  }),
  // keyed by the program's asset name; budgetPerDay is null while undecided
  assets: z.record(
    z.string(),
    z.object({ budgetPerDay: rawAmount.nullable(), eligibleUsd: usdAmount }),
  ),
  // keyed by lowercase account address
  accounts: z.record(
    z.string(),
    z.object({
      earning: z.boolean(),
      reason: z.string().optional(),
      hollarDebtUsd: usdAmount.optional(),
    }),
  ),
  latestTree: z.object({ epoch: z.string(), root: bytes32 }).nullable(),
})

export type RewardsClaimsFile = z.infer<typeof claimsFileSchema>
export type RewardsLatestFile = z.infer<typeof latestFileSchema>

export type RewardsClaimStatus =
  | "none"
  | "claimable"
  | "belowDeposit"
  | "underfunded"

export const getOwedReward = (claimable: bigint, claimed: bigint) =>
  claimable > claimed ? claimable - claimed : 0n

export const getRewardsClaimStatus = ({
  owed,
  accountBalance,
  distributorBalance,
  existentialDeposit,
}: {
  owed: bigint
  accountBalance: bigint
  distributorBalance: bigint
  existentialDeposit: bigint
}): RewardsClaimStatus => {
  if (owed <= 0n) return "none"
  if (distributorBalance < owed) return "underfunded"
  // The reward's precompile reverts a transfer that would leave the account
  // below the existential deposit, so a small first claim has to wait.
  if (accountBalance + owed < existentialDeposit) return "belowDeposit"
  return "claimable"
}

// A snapshot is published after its hour ends, so the newest is up to two
// hours old while publishing is healthy.
const LATEST_MAX_AGE = 6 * millisecondsInHour

export const isRewardsLatestStale = (asOfHour: number, now: number) =>
  now - asOfHour * millisecondsInSecond > LATEST_MAX_AGE

const DAYS_PER_YEAR = 365

/**
 * Yearly rate of one earning asset as a fraction, or null when it has none.
 * The budget is shared over the eligible value only, not the whole supply.
 */
export const getRewardsProgramApr = ({
  budgetPerDay,
  eligibleUsd,
  rewardDecimals,
  rewardPriceUsd,
}: {
  budgetPerDay: string | null
  eligibleUsd: string
  rewardDecimals: number
  rewardPriceUsd: string
}) => {
  if (budgetPerDay === null) return null

  const eligible = Big(eligibleUsd)
  const price = Big(rewardPriceUsd || 0)
  if (eligible.lte(0) || price.lte(0)) return null

  const apr = Big(budgetPerDay)
    .div(Big(10).pow(rewardDecimals))
    .times(DAYS_PER_YEAR)
    .times(price)
    .div(eligible)

  return apr.gt(0) ? apr.toString() : null
}

export type RewardsIncentive = {
  incentiveAPR: string
  rewardTokenAddress: string
  rewardTokenSymbol: string
}

/** Adds an incentive to a list, into the row of the same reward token if any. */
export const mergeRewardsIncentive = <T extends RewardsIncentive>(
  incentives: T[],
  extra: RewardsIncentive | undefined,
): (T | RewardsIncentive)[] => {
  if (!extra) return incentives

  const isSameToken = (incentive: RewardsIncentive) =>
    incentive.rewardTokenAddress.toLowerCase() ===
    extra.rewardTokenAddress.toLowerCase()

  if (!incentives.some(isSameToken)) return [...incentives, extra]

  return incentives.map((incentive) =>
    isSameToken(incentive) && incentive.incentiveAPR !== "Infinity"
      ? {
          ...incentive,
          incentiveAPR: Big(incentive.incentiveAPR)
            .plus(extra.incentiveAPR)
            .toString(),
        }
      : incentive,
  )
}
