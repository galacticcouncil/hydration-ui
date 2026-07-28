import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex } from "viem"

import { useBilStrategy } from "@/modules/strategies/bil/BilStrategyProvider"
import { useBilVaultContract } from "@/modules/strategies/bil/hooks/useBilVaultContract"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"

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

export function useRedemptionQueue(evmAddress: Hex | undefined) {
  const { data: vault } = useBilVaultContract()
  const { bil, hollar } = useBilStrategy()
  return useQuery({
    enabled: !!vault && !!evmAddress,
    queryKey: bilQueryKeys.vaultQueue(evmAddress),
    queryFn: async () => {
      if (!vault) throw new Error("Vault contract not found")

      const [length, head, totalQueued] = await Promise.all([
        vault.read.queueTail(),
        vault.read.queueHead(),
        vault.read.totalQueuedBil(),
      ])

      const queueLength = Number(length)
      const queueHead = Number(head)
      const totalQueuedBil = Number(formatUnits(totalQueued, bil.decimals))

      const entries: QueueEntry[] = []
      const addr = evmAddress?.toLowerCase()

      for (let i = queueHead; i < queueLength; i++) {
        const [reqResult, waitResult] = await Promise.all([
          vault.read.getRedemptionRequest([BigInt(i)]),
          vault.read.getEstimatedWaitTime([BigInt(i)]),
        ])

        const [user, bilAmount, bilSettled, hollarOwed, active] = reqResult
        if (!active) continue

        const remaining = Number(
          formatUnits(bilAmount - bilSettled, bil.decimals),
        )
        entries.push({
          requestId: i,
          user,
          bilAmount: Number(formatUnits(bilAmount, bil.decimals)),
          bilSettled: Number(formatUnits(bilSettled, bil.decimals)),
          hollarOwed: Number(formatUnits(hollarOwed, hollar.decimals)),
          bilRemaining: remaining,
          active,
          isUser: addr ? user.toLowerCase() === addr : false,
          estTimeRemainingDays: Math.ceil(Number(waitResult) / 86400),
        })
      }

      return {
        queue: entries,
        totalQueuedBil,
      }
    },
  })
}
