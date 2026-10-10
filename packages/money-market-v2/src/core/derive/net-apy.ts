import { Decimal } from "@/core/big"

/**
 * One of an account's positions, as the net APY sees it: what is held on each
 * side in USD and the rate that side runs at.
 *
 * The rates are the caller's. The package reports only a reserve's base APY and
 * never learns which reserves are adjusted (ADR-0005), so whoever composes the
 * effective APY passes it in here, as a fraction in a decimal string
 * (ADR-0006). `null` says the rate is unavailable, which is not zero.
 */
export type NetApyPosition = {
  suppliedUsd: string
  borrowedUsd: string
  /** `null` when unavailable. */
  supplyRate: string | null
  /** `null` when unavailable. */
  borrowRate: string | null
  /** Incentives earned on the borrow, which count towards earned APY. */
  borrowRewardRate?: string
}

export type NetApySummary = {
  earnedApy: string | null
  debtApy: string | null
  netApy: string | null
  /** Set only when `netApy` is null. */
  reason?: "unavailable" | "noNetWorth"
}

/**
 * An account's return on its net worth: earned APY on its supplies minus debt
 * APY on its borrows, each weighted by USD across its positions.
 *
 * An unavailable rate counts only on a side that is held, and takes down only
 * the half it belongs to along with the net; the other half is still reported.
 * An account with no net worth has no net APY either, since the return would
 * be on nothing, but both halves still stand.
 *
 * Nothing here reads a clock, and every number out is a plain fixed-point
 * decimal string produced with `toFixed` (ADR-0006).
 */
export function summarizeNetApy(positions: NetApyPosition[]): NetApySummary {
  let supplied = Decimal(0)
  let borrowed = Decimal(0)
  let earned = Decimal(0)
  let owed = Decimal(0)
  let earnedUnavailable = false
  let debtUnavailable = false

  for (const position of positions) {
    const suppliedUsd = Decimal(position.suppliedUsd)
    const borrowedUsd = Decimal(position.borrowedUsd)

    if (suppliedUsd.gt(0)) {
      supplied = supplied.plus(suppliedUsd)

      if (position.supplyRate === null) earnedUnavailable = true
      else earned = earned.plus(suppliedUsd.times(position.supplyRate))
    }

    if (borrowedUsd.gt(0)) {
      borrowed = borrowed.plus(borrowedUsd)
      earned = earned.plus(borrowedUsd.times(position.borrowRewardRate ?? 0))

      if (position.borrowRate === null) debtUnavailable = true
      else owed = owed.plus(borrowedUsd.times(position.borrowRate))
    }
  }

  const earnedApy = earnedUnavailable
    ? null
    : supplied.gt(0)
      ? earned.div(supplied).toFixed()
      : "0"
  const debtApy = debtUnavailable
    ? null
    : borrowed.gt(0)
      ? owed.div(borrowed).toFixed()
      : "0"

  if (earnedUnavailable || debtUnavailable) {
    return { earnedApy, debtApy, netApy: null, reason: "unavailable" }
  }

  const netWorth = supplied.minus(borrowed)

  if (netWorth.lte(0)) {
    return borrowed.gt(0)
      ? { earnedApy, debtApy, netApy: null, reason: "noNetWorth" }
      : { earnedApy, debtApy, netApy: "0" }
  }

  return {
    earnedApy,
    debtApy,
    netApy: earned.minus(owed).div(netWorth).toFixed(),
  }
}
