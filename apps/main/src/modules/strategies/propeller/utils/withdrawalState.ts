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
  if (row.state === "partial") return "settling"
  return "pending"
}
