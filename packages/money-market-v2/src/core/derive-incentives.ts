import type Big from "big.js"
import type { Address } from "viem"

import { Decimal, normalize, shift } from "@/core/big"
import { SECONDS_PER_YEAR, USD_DECIMALS } from "@/core/constants"
import { rayDiv } from "@/core/ray-math"
import { reserveTotals } from "@/core/reserve-totals"
import type {
  ClaimableReward,
  IncentiveApr,
  IncentiveEmission,
  IncentiveSide,
  MarketPositions,
  MarketReserves,
  Position,
  Reserve,
  UserIncentiveSide,
  UserReserveIncentives,
  UserRewardState,
} from "@/types"

/**
 * Reward rates and accrued reward balances.
 *
 * Two rules separate this from the blueprint:
 *
 * - **An emission is live until it ends.** v2 asks whether the caller's
 *   timestamp is before `emissionEndTimestamp`; upstream instead compares
 *   `emissionEndTimestamp` against `incentivesLastUpdateTimestamp`, which is a
 *   fact about when the reserve was last touched and says nothing about
 *   whether the emission is still running. On a quiet reserve that check keeps
 *   reporting an APR long after emissions stopped (ADR-0009).
 * - **A reward that pays nothing is absent, not zero.** Upstream emits an
 *   entry with `incentiveAPR: '0'` for an expired, unconfigured or zero-rate
 *   emission, which a UI then has to filter. v2 returns an empty list.
 *
 * Reward prices come from the reward's own price feed in the payload — there is
 * no external price source here and no papi. Stable-side incentives are not
 * modelled.
 */

type RewardPricing = {
  /** Base units of the market reference currency, per whole reserve token. */
  priceInMarketReferenceCurrency: string
  marketReferenceCurrencyDecimals: number
  /** The market reference currency in USD, already in human units. */
  marketReferencePriceInUsd: Big
}

type AprRequest = RewardPricing & {
  reserve: Reserve
  side: IncentiveSide
  /** Base units of the reserve asset the emission is spread across. */
  totalTokenSupply: bigint
  currentTimestamp: number
}

/**
 * The APR of every live emission on one side of one reserve: what a year of
 * emissions is worth, over what the incentivised balance is worth.
 */
export const incentiveAprs = ({
  reserve,
  side,
  totalTokenSupply,
  priceInMarketReferenceCurrency,
  marketReferenceCurrencyDecimals,
  marketReferencePriceInUsd,
  currentTimestamp,
}: AprRequest): IncentiveApr[] => {
  const supplyValue = shift(
    Decimal(totalTokenSupply.toString()).times(priceInMarketReferenceCurrency),
    -(reserve.decimals + marketReferenceCurrencyDecimals),
  )

  return side.emissions.flatMap((emission) => {
    if (currentTimestamp >= emission.emissionEndTimestamp) return []

    const rewardPrice = rewardPriceInMarketReferenceCurrency(emission)
    // Upstream normalizes `emissionPerSecond` by a hard-coded eighteen
    // decimals; the emission is denominated in the reward token, so v2 uses the
    // reward's own decimals. The two agree only on an 18-decimal reward token.
    const emissionPerYear = shift(
      Decimal(emission.emissionPerSecond),
      -emission.rewardTokenDecimals,
    )
      .times(rewardPrice)
      .times(SECONDS_PER_YEAR.toString())

    // A zero rate, an unpriced reward and an empty incentivised balance all
    // mean there is no rate to report — the last one because the APR would
    // otherwise be a division by zero rather than a large number.
    if (emissionPerYear.lte(0) || supplyValue.lte(0)) return []

    return [
      {
        rewardTokenAddress: emission.rewardTokenAddress,
        rewardTokenSymbol: emission.rewardTokenSymbol,
        incentiveControllerAddress: side.incentiveControllerAddress,
        rewardApr: emissionPerYear.div(supplyValue).toFixed(),
        rewardPriceInUsd: rewardPrice
          .times(marketReferencePriceInUsd)
          .toFixed(),
      },
    ]
  })
}

/* -------------------------------------------------------------------------- */
/* Accrued rewards                                                             */
/* -------------------------------------------------------------------------- */

/** One reward token's standing for one user on one side of one reserve. */
type RewardAccrual = {
  rewardTokenAddress: Address
  rewardTokenSymbol: string
  incentiveControllerAddress: Address
  rewardTokenDecimals: number
  rewardPriceInUsd: Big
  /** Reward base units the controller has already booked, across all reserves. */
  unclaimed: Big
  /** Reward base units this side of this reserve has earned since then. */
  accrued: Big
}

export type SummarizeRewardsRequest = {
  /** Chain state for the market, for the reward configuration and the totals. */
  reserves: MarketReserves
  /** The user's per-reserve state, which is what the emissions are paid on. */
  positions: MarketPositions
  /** The user's reward state, from `readUserIncentives`. */
  userIncentives: UserReserveIncentives[]
  /** Unix seconds to accrue to. */
  currentTimestamp: number
}

/**
 * What one user can claim, per reward token, across the whole market. The
 * controller that appears on each entry is the one to send the claim to.
 *
 * The booked balance is counted once per reward token however many reserves
 * report it, because the controller accumulates it per user and reward rather
 * than per reserve.
 */
export const summarizeRewards = ({
  reserves,
  positions,
  userIncentives,
  currentTimestamp,
}: SummarizeRewardsRequest): ClaimableReward[] => {
  const accruals = userIncentives.flatMap((userReserve) =>
    reserveAccruals({
      reserves,
      positions,
      userReserve,
      currentTimestamp,
    }),
  )

  return claimable(accruals, true)
}

/**
 * What one position has earned since its reserve's reward index was last
 * updated. The booked balance is deliberately left out: it belongs to the
 * controller, not to a reserve, so counting it here would count it once per
 * position the user holds.
 */
export const positionRewards = (request: {
  reserves: MarketReserves
  positions: MarketPositions
  position: Position
  userIncentives: UserReserveIncentives[]
  currentTimestamp: number
}): ClaimableReward[] => {
  const userReserve = request.userIncentives.find(
    (candidate) =>
      candidate.underlyingAsset === request.position.underlyingAsset,
  )
  if (!userReserve) return []

  return claimable(
    reserveAccruals({
      reserves: request.reserves,
      positions: request.positions,
      userReserve,
      currentTimestamp: request.currentTimestamp,
    }),
    false,
  )
}

/* -------------------------------------------------------------------------- */

/** Both sides of one reserve, for one user. */
const reserveAccruals = ({
  reserves,
  positions,
  userReserve,
  currentTimestamp,
}: {
  reserves: MarketReserves
  positions: MarketPositions
  userReserve: UserReserveIncentives
  currentTimestamp: number
}): RewardAccrual[] => {
  const asset = userReserve.underlyingAsset
  const incentives = reserves.incentives.find(
    (candidate) => candidate.underlyingAsset === asset,
  )
  const reserve = reserves.reserves.find(
    (candidate) => candidate.underlyingAsset === asset,
  )
  // A reward the market no longer configures cannot be priced or accrued.
  if (!incentives || !reserve) return []

  const position = positions.positions.find(
    (candidate) => candidate.underlyingAsset === asset,
  )
  const marketReferencePriceInUsd = shift(
    Decimal(reserves.baseCurrency.marketReferenceCurrencyPriceInUsd),
    -USD_DECIMALS,
  )
  const { totalLiquidity } = reserveTotals(reserve, currentTimestamp)

  return [
    ...sideAccruals({
      side: incentives.supply,
      userSide: userReserve.supply,
      // Emissions are paid on scaled balances, so the supply side is measured
      // against total liquidity taken back to its scaled form.
      totalScaledSupply: scaled(totalLiquidity, BigInt(reserve.liquidityIndex)),
      scaledBalance: BigInt(position?.scaledATokenBalance ?? 0),
      marketReferencePriceInUsd,
      currentTimestamp,
    }),
    ...sideAccruals({
      side: incentives.variableBorrow,
      userSide: userReserve.variableBorrow,
      totalScaledSupply: BigInt(reserve.totalScaledVariableDebt),
      scaledBalance: BigInt(position?.scaledVariableDebt ?? 0),
      marketReferencePriceInUsd,
      currentTimestamp,
    }),
  ]
}

const sideAccruals = ({
  side,
  userSide,
  totalScaledSupply,
  scaledBalance,
  marketReferencePriceInUsd,
  currentTimestamp,
}: {
  side: IncentiveSide
  userSide: UserIncentiveSide
  totalScaledSupply: bigint
  scaledBalance: bigint
  marketReferencePriceInUsd: Big
  currentTimestamp: number
}): RewardAccrual[] =>
  userSide.rewards.flatMap((userReward) => {
    const emission = side.emissions.find(
      (candidate) =>
        candidate.rewardTokenAddress === userReward.rewardTokenAddress,
    )
    if (!emission) return []

    return [
      {
        rewardTokenAddress: userReward.rewardTokenAddress,
        rewardTokenSymbol: userReward.rewardTokenSymbol,
        incentiveControllerAddress: userSide.incentiveControllerAddress,
        rewardTokenDecimals: userReward.rewardTokenDecimals,
        rewardPriceInUsd: rewardPriceInMarketReferenceCurrency(
          userReward,
        ).times(marketReferencePriceInUsd),
        unclaimed: Decimal(userReward.userUnclaimedRewards),
        accrued: accrue({
          scaledBalance,
          totalScaledSupply,
          emission,
          userIndex: userReward.tokenIncentivesUserIndex,
          currentTimestamp,
        }),
      },
    ]
  })

/**
 * Rewards earned since the reserve's reward index was last written, by walking
 * that index forward to now — or to the end of the emission, whichever came
 * first. What was earned before that is already in the controller's books.
 */
const accrue = ({
  scaledBalance,
  totalScaledSupply,
  emission,
  userIndex,
  currentTimestamp,
}: {
  scaledBalance: bigint
  totalScaledSupply: bigint
  emission: IncentiveEmission
  userIndex: string
  currentTimestamp: number
}): Big => {
  if (totalScaledSupply === 0n) return Decimal(0)

  const { incentivesLastUpdateTimestamp: lastUpdate, precision } = emission
  const until = Math.min(currentTimestamp, emission.emissionEndTimestamp)
  const index =
    lastUpdate >= currentTimestamp ||
    lastUpdate >= emission.emissionEndTimestamp
      ? Decimal(emission.tokenIncentivesIndex)
      : shift(
          Decimal(emission.emissionPerSecond).times(until - lastUpdate),
          precision,
        )
          .div(totalScaledSupply.toString())
          .plus(emission.tokenIncentivesIndex)

  return shift(
    index.minus(userIndex).times(scaledBalance.toString()),
    -precision,
  )
}

/**
 * Groups accruals by reward token. A reward that amounts to nothing — expired,
 * zero-rate, or never configured for this user — is left out entirely rather
 * than reported as zero.
 */
const claimable = (
  accruals: RewardAccrual[],
  withUnclaimed: boolean,
): ClaimableReward[] => {
  const totals = new Map<Address, RewardAccrual>()

  for (const accrual of accruals) {
    const seen = totals.get(accrual.rewardTokenAddress)
    if (!seen) {
      totals.set(accrual.rewardTokenAddress, accrual)
      continue
    }
    // Only the earned part adds up; `unclaimed` is the same controller-wide
    // figure repeated on every reserve.
    totals.set(accrual.rewardTokenAddress, {
      ...seen,
      accrued: seen.accrued.plus(accrual.accrued),
    })
  }

  return [...totals.values()].flatMap((accrual) => {
    // A user index can sit ahead of the reserve index for a block; a negative
    // earning is not a debt, it is nothing yet.
    const earned = accrual.accrued.gt(0) ? accrual.accrued : Decimal(0)
    const total = withUnclaimed ? accrual.unclaimed.plus(earned) : earned
    if (total.lte(0)) return []

    const amount = normalize(total, accrual.rewardTokenDecimals)

    return [
      {
        rewardTokenAddress: accrual.rewardTokenAddress,
        rewardTokenSymbol: accrual.rewardTokenSymbol,
        incentiveControllerAddress: accrual.incentiveControllerAddress,
        amount,
        amountUsd: Decimal(amount).times(accrual.rewardPriceInUsd).toFixed(),
      },
    ]
  })
}

/** Every reward carries its own price feed; there is no external price source. */
const rewardPriceInMarketReferenceCurrency = (
  reward: Pick<UserRewardState, "rewardPriceFeed" | "priceFeedDecimals">,
): Big => shift(Decimal(reward.rewardPriceFeed), -reward.priceFeedDecimals)

/** Undoes a liquidity index, taking an accrued balance back to its scaled form. */
const scaled = (amount: bigint, index: bigint): bigint =>
  index === 0n ? 0n : rayDiv(amount, index)
