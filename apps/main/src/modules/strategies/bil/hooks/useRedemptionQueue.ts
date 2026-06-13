import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex } from "viem"

import { useBilVaultContract } from "@/modules/strategies/bil/hooks/useBilVaultContract"

export interface QueueEntry {
  requestId: number
  user: string
  bilAmount: number
  /** Portion already settled — waiting for the user to call redeem/withdraw. */
  bilSettled: number
  /** HOLLAR price-locked for the settled portion. */
  hollarOwed: number
  /** Still queued (not yet settled). */
  bilRemaining: number
  active: boolean
  isUser: boolean
  estTimeRemainingDays: number
}

export interface WithdrawalRequest {
  id: number
  amountBil: number
  estHollar: number
  /** Shares already settled and ready to claim. */
  claimableBil: number
  /** HOLLAR price-locked for those settled shares. */
  claimableHollar: number
  requestedDate: Date
  maxTimeRemainingDays: number
}

export function useRedemptionQueue(evmAddress: Hex | undefined) {
  const { data: vault } = useBilVaultContract()
  return useQuery({
    enabled: !!vault && !!evmAddress,
    queryKey: ["bil-vault-queue", evmAddress],
    queryFn: async () => {
      if (!vault) throw new Error("Vault contract not found")

      const [length, head, totalQueued] = await Promise.all([
        vault.read.getRedemptionQueueLength(),
        vault.read.getQueueHead(),
        vault.read.getTotalQueuedBil(),
      ])

      const queueLength = Number(length)
      const queueHead = Number(head)
      const totalQueuedBil = Number(formatUnits(totalQueued, 18))

      const entries: QueueEntry[] = []
      const addr = evmAddress?.toLowerCase()

      for (let i = queueHead; i < queueLength; i++) {
        const [reqResult, waitResult] = await Promise.all([
          vault.read.getRedemptionRequest([BigInt(i)]),
          vault.read.getEstimatedWaitTime([BigInt(i)]),
        ])

        // Lark-2 5-tuple: (user, bilAmount, bilSettled, hollarOwed, active)
        const [user, bilAmount, bilSettled, hollarOwed, active] = reqResult
        if (!active) continue

        const remaining = Number(formatUnits(bilAmount - bilSettled, 18))
        entries.push({
          requestId: i,
          user,
          bilAmount: Number(formatUnits(bilAmount, 18)),
          bilSettled: Number(formatUnits(bilSettled, 18)),
          hollarOwed: Number(formatUnits(hollarOwed, 18)),
          bilRemaining: remaining,
          active,
          isUser: addr ? user.toLowerCase() === addr : false,
          estTimeRemainingDays: Math.ceil(Number(waitResult) / 86400),
        })
      }

      const myWithdrawals: WithdrawalRequest[] = entries
        .filter((e) => e.isUser)
        .map((e) => ({
          id: e.requestId,
          amountBil: e.bilRemaining,
          estHollar: e.bilRemaining,
          claimableBil: e.bilSettled,
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
        totalQueuedBil,
      }
    },
    refetchInterval: 30_000,
  })
}
