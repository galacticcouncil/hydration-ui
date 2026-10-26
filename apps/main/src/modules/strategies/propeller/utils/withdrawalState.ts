import { type PropellerWithdrawalRow } from "@/modules/strategies/propeller/hooks/usePropellerAccount"

export const getWithdrawalStateLabel = (
  row: Pick<
    PropellerWithdrawalRow,
    "state" | "collateralSettled" | "surplusHollar"
  >,
) => {
  if (row.surplusHollar > 0) return "claimable"
  if (row.state === "claimed") return "claimed"
  if ((row.collateralSettled ?? 0) > 0) return "claimable"
  if (row.state === "cooldown") return "cooldown"
  // a fully repaid request whose collateral is not released yet is still
  // settling, not waiting for its unwind to start
  if (row.state === "partial" || row.state === "settled") return "settling"
  return "pending"
}
