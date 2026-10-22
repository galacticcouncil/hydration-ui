import { calculateCompoundedInterest } from "@/core/derive/pool-math"
import { rayMul } from "@/core/derive/ray-math"
import type { Reserve } from "@/types"

/**
 * A reserve's debt and liquidity at one instant, in base units of its own
 * asset. Shared by the reserve summaries and the incentive math so the APR of
 * an emission is always divided by the same supply the summary reports; a
 * second copy of this accrual is how the two quietly start disagreeing.
 */
export type ReserveTotals = {
  totalDebt: bigint
  totalLiquidity: bigint
}

export const reserveTotals = (
  reserve: Reserve,
  currentTimestamp: number,
): ReserveTotals => {
  const totalDebt = rayMul(
    rayMul(
      BigInt(reserve.totalScaledVariableDebt),
      BigInt(reserve.variableBorrowIndex),
    ),
    calculateCompoundedInterest({
      rate: BigInt(reserve.variableBorrowRate),
      currentTimestamp,
      lastUpdateTimestamp: reserve.lastUpdateTimestamp,
    }),
  )

  return {
    totalDebt,
    totalLiquidity: totalDebt + BigInt(reserve.availableLiquidity),
  }
}
