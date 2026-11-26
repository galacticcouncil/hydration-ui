import {
  getCompoundedBalance,
  getMarketReferenceCurrencyAndUsdBalance,
  USD_DECIMALS,
} from "@galacticcouncil/money-market/core"
import type {
  BaseCurrency,
  Position,
  Reserve,
} from "@galacticcouncil/money-market/types"
import Big from "big.js"
import {
  millisecondsInHour,
  millisecondsInMinute,
  millisecondsInSecond,
} from "date-fns/constants"
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
// whole seconds; a time given in milliseconds is far above the bound
const unixSeconds = z.number().int().positive().lt(1e11)

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
    // the unix time, in seconds, the program ends at; absent when it has none
    endsAt: unixSeconds.optional(),
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
  // The first epoch without a tree. Absent from files written before it was
  // added, and dropped when malformed, so the rest of the file still reads.
  openEpoch: z
    .object({
      // a label whose shape depends on the epoch's length: not to be parsed
      id: z.string(),
      start: unixSeconds,
      end: unixSeconds,
      snapshots: z.number(),
      expectedSnapshots: z.number(),
      // An estimate of what each lowercase account address has earned in the
      // epoch so far, in raw units; null when none can be made.
      accruing: z.record(z.string(), rawAmount).nullable(),
    })
    .optional()
    .catch(({ value, issues }) => {
      // null is not malformed: the file says so once the program has ended
      if (value !== null) {
        console.warn(
          "Rewards latest.json: a malformed openEpoch was left out",
          issues.map(({ path, code }) => `${path?.join(".") ?? ""}: ${code}`),
        )
      }
      return undefined
    }),
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

/**
 * Whether the program has ended by `now`, in milliseconds: from its endsAt
 * on, when it pays nothing more. A program without an end has not.
 */
export const hasRewardsProgramEnded = (
  program: { endsAt?: number },
  now: number,
) =>
  program.endsAt !== undefined && now >= program.endsAt * millisecondsInSecond

/**
 * A root waiting out the distributor's timelock; validAt is in unix seconds.
 * The root is null for a pending zero hash, under which nothing is claimable.
 */
export type RewardsPendingRoot = { root: Hex | null; validAt: number }

const ROOTS_IDLE_INTERVAL = 5 * millisecondsInMinute
const ROOTS_DUE_INTERVAL = 30 * millisecondsInSecond
const ROOTS_MIN_INTERVAL = 5 * millisecondsInSecond
// the runner accepts a root about a minute after its validAt
const ROOTS_ACCEPT_MARGIN = 75 * millisecondsInSecond
// a root nobody accepts is not read every half minute for good
const ROOTS_DUE_WINDOW = 15 * millisecondsInMinute

/**
 * Milliseconds until the distributor's roots are read again, given the
 * pending root's validAt: once it should have been accepted, often for a
 * while after that, and every few minutes otherwise, which finds a new root
 * and one the owner revoked.
 *
 * It is counted from the last read, in milliseconds, and not from the clock:
 * an interval that changes between two reads restarts the timer, which skips
 * the read that was due.
 */
export const getRewardsRootsRefetchInterval = (
  validAt: number | undefined,
  readAt: number,
) => {
  if (validAt === undefined) return ROOTS_IDLE_INTERVAL

  const untilDue = validAt * millisecondsInSecond + ROOTS_ACCEPT_MARGIN - readAt

  if (untilDue > 0) {
    return Math.min(Math.max(untilDue, ROOTS_MIN_INTERVAL), ROOTS_IDLE_INTERVAL)
  }

  return -untilDue < ROOTS_DUE_WINDOW ? ROOTS_DUE_INTERVAL : ROOTS_IDLE_INTERVAL
}

const RETRY_INTERVAL = millisecondsInMinute
// a tree that is never served is not asked for every minute for good
const RETRY_OFTEN_ATTEMPTS = 5

/**
 * Milliseconds until a read that has given nothing is made again, from the
 * state of its query; false once it holds data. Without it a read that failed
 * waits for the tab to be shown again.
 *
 * A tree that is not served yet answers 404, which reads as null and counts
 * as a read, so both counts are added up.
 */
export const getRewardsRetryInterval = ({
  data,
  dataUpdateCount,
  errorUpdateCount,
}: {
  data: unknown
  dataUpdateCount: number
  errorUpdateCount: number
}) => {
  if (data !== undefined && data !== null) return false

  return dataUpdateCount + errorUpdateCount < RETRY_OFTEN_ATTEMPTS
    ? RETRY_INTERVAL
    : ROOTS_IDLE_INTERVAL
}

/**
 * The time, in milliseconds, the stages are judged at: the newer of the read
 * of the roots and the read of latest.json, which stands still between reads.
 * A file that stopped arriving therefore still grows stale.
 */
export const getRewardsReadTime = (rootsReadAt: number, latestReadAt: number) =>
  Math.max(rootsReadAt, latestReadAt)

/**
 * The reward token's address. An account in its first epoch has no entry under
 * the live root, and before the first root there is no tree at all, so
 * latest.json names the token last.
 */
export const getRewardsTokenAddress = ({
  liveTree,
  pendingTree,
  latest,
}: {
  liveTree: RewardsClaimsFile | null | undefined
  pendingTree: RewardsClaimsFile | null | undefined
  latest: RewardsLatestFile | null | undefined
}) => liveTree?.reward ?? pendingTree?.reward ?? latest?.reward.address

export type RewardsAccruedStage = "pending" | "closed" | "accruing"

export type RewardsAccrued = {
  stage: RewardsAccruedStage
  /** Raw units that are not claimable yet; an estimate while accruing. */
  amount: bigint
  /** When it should become claimable, in milliseconds; absent when unknown or not ahead. */
  claimableAt: number | undefined
}

// What a root holds for the account and for all accounts together: nothing
// under no root, unknown until the root's tree has loaded.
const getAmountsUnderRoot = (
  root: Hex | null | undefined,
  tree: RewardsClaimsFile | null | undefined,
  account: string,
) => {
  if (root === null) return { amount: 0n, total: 0n }
  if (!root || !tree) return undefined

  let total = 0n
  for (const { claimable } of Object.values(tree.claims)) {
    total += BigInt(claimable)
  }

  return { amount: BigInt(tree.claims[account]?.claimable ?? 0), total }
}

/**
 * What the account has earned that it cannot claim yet, in the order it
 * becomes claimable: under the pending root, under the newest closed epoch's
 * root, and the estimate for the open epoch.
 *
 * Amounts under roots are cumulative, so each stage is what its root adds to
 * the stages before it. The chain and the files are read minutes apart, and
 * any two of the roots may be the same one or in either order. For a root or
 * a file, null says there is none and undefined that it has not been read.
 * The list ends at the first that has not, because what it holds would be
 * shown under a later stage.
 *
 * Which of two roots is the newer one is told by the total of all amounts
 * under each: an epoch that pays anyone raises it, and one that pays nobody
 * ends on the same root.
 *
 * From the program's end on there is no estimate. What the roots hold was
 * earned before it and is listed as long as it is not claimable.
 */
export const getAccruedRewards = ({
  account,
  claimed,
  timelock,
  now,
  liveRoot,
  liveTree,
  pending,
  pendingTree,
  latest,
  closedTree,
}: {
  /** Lowercase, as the files key their accounts. */
  account: string
  claimed: bigint | undefined
  /** Seconds between a root's submission and its validAt. */
  timelock: number | undefined
  /** Milliseconds. */
  now: number
  liveRoot: Hex | null | undefined
  liveTree: RewardsClaimsFile | null | undefined
  pending: RewardsPendingRoot | null | undefined
  pendingTree: RewardsClaimsFile | null | undefined
  latest: RewardsLatestFile | null | undefined
  /** The tree of the file's latestTree root. */
  closedTree: RewardsClaimsFile | null | undefined
}): RewardsAccrued[] => {
  const stages: RewardsAccrued[] = []

  const live = getAmountsUnderRoot(liveRoot, liveTree, account)
  if (live === undefined || claimed === undefined || pending === undefined) {
    return stages
  }

  // a claim under a root newer than the one read here leaves claimed above it
  let reached = live.amount > claimed ? live.amount : claimed
  // the total under the newest root the chain was read to hold
  let chainTotal = live.total

  if (pending) {
    const under = getAmountsUnderRoot(pending.root, pendingTree, account)
    if (under === undefined) return stages

    if (under.amount > reached) {
      // it still needs accepting once validAt has passed, so no time then
      const validAt = pending.validAt * millisecondsInSecond
      stages.push({
        stage: "pending",
        amount: under.amount - reached,
        claimableAt: validAt > now ? validAt : undefined,
      })
      reached = under.amount
    }
    if (under.total > chainTotal) chainTotal = under.total
  }

  if (!latest) return stages

  // The runner takes no snapshot after the program's end, so the file stands
  // still from then on and its age is judged at the end: an epoch that is
  // closed and waits for its root is not left out six hours later.
  const endsAt = (latest.program.endsAt ?? Infinity) * millisecondsInSecond
  if (isRewardsLatestStale(latest.asOf.hour, Math.min(now, endsAt))) {
    return stages
  }

  const closed = getAmountsUnderRoot(
    latest.latestTree?.root ?? null,
    closedTree,
    account,
  )
  // A file behind the chain names as open an epoch the chain has a root for,
  // whose estimate would count that epoch a second time. The totals tell, and
  // not the account's own amounts, which are equal under two roots when the
  // epoch between them paid it nothing. An amount claimed above the file's
  // tree was claimed under a newer root than any read here.
  if (
    closed === undefined ||
    closed.total < chainTotal ||
    closed.amount < reached
  ) {
    return stages
  }

  if (closed.amount > reached) {
    stages.push({
      stage: "closed",
      amount: closed.amount - reached,
      claimableAt: undefined,
    })
  }

  // No epoch accrues from the program's end on. The file still names the last
  // one as open until the runner closes it, which makes it the closed stage.
  if (hasRewardsProgramEnded(latest.program, now)) return stages

  const { openEpoch } = latest
  const estimate = BigInt(openEpoch?.accruing?.[account] ?? 0)

  if (openEpoch && estimate > 0n) {
    // its root is submitted after the epoch ends, so this is the earliest
    const expectedAt =
      timelock === undefined
        ? undefined
        : (openEpoch.end + timelock) * millisecondsInSecond

    stages.push({
      stage: "accruing",
      amount: estimate,
      claimableAt:
        expectedAt !== undefined && expectedAt > now ? expectedAt : undefined,
    })
  }

  return stages
}

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

const isSameAddress = (a: string, b: string) =>
  a.toLowerCase() === b.toLowerCase()

type HollarDebtPosition = Pick<
  Position,
  "underlyingAsset" | "scaledVariableDebt"
>

/** Whether any of `positions` supplies one of the `underlyings`. */
export const suppliesRewardsProgramAsset = (
  positions: ReadonlyArray<
    Pick<Position, "underlyingAsset" | "scaledATokenBalance">
  >,
  underlyings: ReadonlyArray<string>,
) =>
  positions.some(
    ({ underlyingAsset, scaledATokenBalance }) =>
      BigInt(scaledATokenBalance) > 0n &&
      underlyings.some((underlying) =>
        isSameAddress(underlying, underlyingAsset),
      ),
  )

/** The scaled HOLLAR debt in one market's positions, 0n without any. */
export const getScaledHollarDebt = (
  positions: ReadonlyArray<HollarDebtPosition>,
  hollar: string,
) =>
  BigInt(
    positions.find(({ underlyingAsset }) =>
      isSameAddress(underlyingAsset, hollar),
    )?.scaledVariableDebt ?? 0,
  )

export type HollarDebtMarket = {
  hollar: string
  positions: ReadonlyArray<HollarDebtPosition>
  /** Needed only when the positions hold HOLLAR debt. */
  reserves:
    | {
        reserves: ReadonlyArray<
          Pick<
            Reserve,
            | "underlyingAsset"
            | "decimals"
            | "variableBorrowIndex"
            | "variableBorrowRate"
            | "lastUpdateTimestamp"
            | "priceInMarketReferenceCurrency"
          >
        >
        baseCurrency: Pick<
          BaseCurrency,
          | "marketReferenceCurrencyDecimals"
          | "marketReferenceCurrencyPriceInUsd"
        >
      }
    | undefined
}

/**
 * HOLLAR debt in dollars over several markets at `currentTimestamp` (unix s),
 * at each market's oracle price as the runner values it; undefined until read.
 */
export const getHollarDebtUsd = (
  markets: ReadonlyArray<HollarDebtMarket>,
  currentTimestamp: number,
) => {
  let total = Big(0)

  for (const { hollar, positions, reserves } of markets) {
    const scaledDebt = getScaledHollarDebt(positions, hollar)
    if (scaledDebt === 0n) continue

    const reserve = reserves?.reserves.find(({ underlyingAsset }) =>
      isSameAddress(underlyingAsset, hollar),
    )
    if (!reserves || !reserve) return undefined

    const debt = getCompoundedBalance({
      principalBalance: scaledDebt,
      reserveIndex: BigInt(reserve.variableBorrowIndex),
      reserveRate: BigInt(reserve.variableBorrowRate),
      lastUpdateTimestamp: reserve.lastUpdateTimestamp,
      currentTimestamp,
    })
    const { usdBalance } = getMarketReferenceCurrencyAndUsdBalance({
      balance: debt.toString(),
      priceInMarketReferenceCurrency: reserve.priceInMarketReferenceCurrency,
      marketReferenceCurrencyDecimals:
        reserves.baseCurrency.marketReferenceCurrencyDecimals,
      decimals: reserve.decimals,
      marketReferencePriceInUsdNormalized: Big(
        reserves.baseCurrency.marketReferenceCurrencyPriceInUsd,
      ).div(Big(10).pow(USD_DECIMALS)),
    })

    total = total.plus(usdBalance.toString())
  }

  return total.toString()
}
