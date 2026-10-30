import { type Hex, type PublicClient } from "viem"

import { MAIN_DEBT_ABI } from "@/modules/strategies/propeller/config/abi"

/**
 * Why `deposit()` would revert right now, mirroring the contract's checks in
 * order; null when it would go through. Only conditions the contract itself
 * enforces belong here — the UI must never block a deposit the vault accepts.
 */
export type DepositBlocker = "paused" | "deficit" | "delever" | "deploying"

export const depositBlocker = ({
  paused,
  depositsPaused,
  deficitStop,
  deleverPending,
  deploying,
}: {
  /** vault pause or loop emergency pause (the vault's paused() covers both) */
  paused: boolean
  depositsPaused: boolean
  deficitStop: boolean | null
  deleverPending: boolean
  /** null when unreadable: unknown is not a reason to block */
  deploying: boolean | null
}): DepositBlocker | null => {
  if (paused || depositsPaused) return "paused"
  if (deficitStop) return "deficit"
  if (deleverPending) return "delever"
  if (deploying) return "deploying"
  return null
}

/**
 * MainDebt.beforeDeposit reverts OutstandingDebt while a borrowing round is
 * still being deployed or its proceeds and costs are not yet booked.
 */
export const readMainDebtBusy = async (
  client: PublicClient,
  mainDebt: Hex,
  blockNumber: bigint,
): Promise<boolean | null> => {
  try {
    const [remaining, pending] = await Promise.all([
      client.readContract({
        address: mainDebt,
        abi: MAIN_DEBT_ABI,
        functionName: "activeSourceRemaining",
        blockNumber,
      }),
      client.readContract({
        address: mainDebt,
        abi: MAIN_DEBT_ABI,
        functionName: "pendingSourceAccounting",
        blockNumber,
      }),
    ])
    return remaining !== 0n || pending
  } catch {
    return null
  }
}
