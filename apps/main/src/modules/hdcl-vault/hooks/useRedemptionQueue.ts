import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex } from "viem"

import {
  VAULT_ABI,
  VAULT_ADDRESS,
  vaultEvmClient,
} from "@/modules/hdcl-vault/constants"

export interface QueueEntry {
  requestId: number
  user: string
  hdclAmount: number
  hdclFulfilled: number
  hdclRemaining: number
  active: boolean
  isUser: boolean
  estTimeRemainingDays: number
}

export interface WithdrawalRequest {
  id: number
  amountHdcl: number
  estHollar: number
  requestedDate: Date
  maxTimeRemainingDays: number
}

export function useRedemptionQueue(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["hdcl-vault-queue", evmAddress],
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: vaultEvmClient,
      })

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

        const [user, hdclAmount, hdclFulfilled, active] = reqResult
        if (!active) continue

        const remaining = Number(formatUnits(hdclAmount - hdclFulfilled, 18))
        entries.push({
          requestId: i,
          user,
          hdclAmount: Number(formatUnits(hdclAmount, 18)),
          hdclFulfilled: Number(formatUnits(hdclFulfilled, 18)),
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
          // Sentinel value (epoch). The real `requestedAt` comes from the
          // `RedemptionRequested` event log and is merged in at page level
          // via useRedemptionHistory — the on-chain queue struct doesn't
          // expose request timestamps.
          requestedDate: new Date(0),
          maxTimeRemainingDays: e.estTimeRemainingDays,
        }))

      if (import.meta.env.DEV) {
        console.log("[hdcl-vault] queue scan", {
          evmAddress,
          queueLength,
          queueHead,
          totalQueuedHdcl,
          entriesCount: entries.length,
          mineCount: myWithdrawals.length,
          allUsers: entries.map((e) => e.user),
        })
      }

      return {
        queue: entries,
        myWithdrawals,
        totalQueuedHdcl,
      }
    },
    refetchInterval: 30_000,
  })
}
