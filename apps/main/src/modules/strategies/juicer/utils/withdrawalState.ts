import { type JuicerWithdrawalRow } from "@/modules/strategies/juicer/hooks/useJuicerAccount"

/**
 * A partial claim surfaces in quarters of the request (25%, 50%, 75%): a sane
 * rhythm that spares the user a fee for every keeper slice. Once the request
 * is fully repaid, whatever is left is claimable, or it could never close.
 */
const CLAIM_STEPS = 4

/** whether settlement has reached a quarter the claims so far have not taken */
const reachedNewQuarter = (
  row: Pick<
    JuicerWithdrawalRow,
    "collateralOwed" | "collateralSettled" | "settledSoFar"
  >,
) => {
  const owed = row.collateralOwed ?? 0
  const unclaimed = row.collateralSettled ?? 0
  if (owed <= 0 || unclaimed <= 0) return false
  const settled = row.settledSoFar ?? unclaimed
  // the epsilon keeps a quarter reached to the wei from rounding below it
  const step = (amount: number) =>
    Math.floor((amount / owed) * CLAIM_STEPS + 1e-9)
  return step(settled) > step(settled - unclaimed)
}

export const getWithdrawalStateLabel = (
  row: Pick<
    JuicerWithdrawalRow,
    | "state"
    | "collateralOwed"
    | "collateralSettled"
    | "settledSoFar"
    | "surplusHollar"
  >,
) => {
  if (row.surplusHollar > 0) return "claimable"
  if (row.state === "claimed") return "claimed"
  const unclaimed = row.collateralSettled ?? 0
  if (unclaimed > 0 && (row.state === "settled" || reachedNewQuarter(row)))
    return "claimable"
  // a request between quarters, or fully repaid with its collateral not
  // released yet, is still settling, not waiting for its unwind to start
  if (row.state === "partial" || row.state === "settled") return "settling"
  // the cooldown and the wait for the unwind look the same to the user: queued
  return "pending"
}
