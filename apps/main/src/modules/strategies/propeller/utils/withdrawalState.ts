import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"

/** display-asset amount below which a settled sliver is not offered as a claim */
const CLAIM_DUST = 0.0001

export const getWithdrawalStateLabel = (
  row: Pick<
    PropellerWithdrawalRow,
    "state" | "collateralSettled" | "surplusHollar"
  >,
) => {
  if (row.surplusHollar > 0) return "claimable"
  if (row.state === "claimed") return "claimed"
  // a keeper's first sliver (<0.0001) is no claim yet; once fully repaid any
  // remainder is, or the request could never close
  const settled = row.collateralSettled ?? 0
  if (settled >= CLAIM_DUST || (row.state === "settled" && settled > 0))
    return "claimable"
  if (row.state === "cooldown") return "cooldown"
  // a fully repaid request whose collateral is not released yet is still
  // settling, not waiting for its unwind to start
  if (row.state === "partial" || row.state === "settled") return "settling"
  return "pending"
}
