import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex } from "viem"

import { useHdclVaultContract } from "@/modules/strategies/hdcl/hooks/useHdclVaultContract"
import { hdclQueryKeys } from "@/modules/strategies/hdcl/utils/queryKeys"

export interface QueueEntry {
  requestId: number
  user: string
  hdclAmount: number
  /** Portion already settled — waiting for the user to call redeem/withdraw. */
  hdclSettled: number
  /** HOLLAR price-locked for the settled portion. */
  hollarOwed: number
  /** Still queued (not yet settled). */
  hdclRemaining: number
  active: boolean
  isUser: boolean
  estTimeRemainingDays: number
}

export interface WithdrawalRequest {
  id: number
  amountHdcl: number
  estHollar: number
  /** Shares already settled and ready to claim. */
  claimableHdcl: number
  /** HOLLAR price-locked for those settled shares. */
  claimableHollar: number
  requestedDate: Date
  maxTimeRemainingDays: number
}

export function useRedemptionQueue(evmAddress: Hex | undefined) {
  const { data: vault } = useHdclVaultContract()
  return useQuery({
    enabled: !!vault && !!evmAddress,
    queryKey: hdclQueryKeys.vaultQueue(evmAddress),
    queryFn: async () => {
      if (!vault) throw new Error("Vault contract not found")

      const [length, head, totalQueued] = await Promise.all([
        vault.read.getRedemptionQueueLength(),
        vault.read.getQueueHead(),
        vault.read.getTotalQueuedHdcl(),
      ])

      const queueLength = Number(length)
      const queueHead = Number(head)
      const totalQueuedHdcl = Number(formatUnits(totalQueued, 18))

      const entries: QueueEntry[] = []
      const addr = evmAddress?.toLowerCase()

      for (let i = queueHead; i < queueLength; i++) {
        const [reqResult, waitResult] = await Promise.all([
          vault.read.getRedemptionRequest([BigInt(i)]),
          vault.read.getEstimatedWaitTime([BigInt(i)]),
        ])

        // Lark-2 5-tuple: (user, hdclAmount, hdclSettled, hollarOwed, active)
        const [user, hdclAmount, hdclSettled, hollarOwed, active] = reqResult
        if (!active) continue

        const remaining = Number(formatUnits(hdclAmount - hdclSettled, 18))
        entries.push({
          requestId: i,
          user,
          hdclAmount: Number(formatUnits(hdclAmount, 18)),
          hdclSettled: Number(formatUnits(hdclSettled, 18)),
          hollarOwed: Number(formatUnits(hollarOwed, 18)),
          hdclRemaining: remaining,
          active,
          isUser: addr ? user.toLowerCase() === addr : false,
          estTimeRemainingDays: Math.ceil(Number(waitResult) / 86400),
        })
      }

      const myWithdrawals: WithdrawalRequest[] = entries
        .filter((e) => e.isUser)
        .map((e) => ({
          id: e.requestId,
          amountHdcl: e.hdclRemaining,
          estHollar: e.hdclRemaining,
          claimableHdcl: e.hdclSettled,
          claimableHollar: e.hollarOwed,
          // Sentinel value (epoch). The real `requestedAt` comes from the
          // `RedemptionRequested` event log and is merged in at page level
          // via useRedemptionHistory — the on-chain queue struct doesn't
          // expose request timestamps.
          requestedDate: new Date(0),
          maxTimeRemainingDays: e.estTimeRemainingDays,
        }))

      return {
        queue: entries,
        myWithdrawals,
        totalQueuedHdcl,
      }
    },
  })
}
