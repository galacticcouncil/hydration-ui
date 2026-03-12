import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex } from "viem"

import { VAULT_ADDRESS, VAULT_ABI, vaultEvmClient } from "../constants"

export interface QueueEntry {
  requestId: number
  user: string
  wdclAmount: number
  wdclFulfilled: number
  wdclRemaining: number
  active: boolean
  isUser: boolean
  estTimeRemainingDays: number
}

export interface WithdrawalRequest {
  id: number
  amountWdcl: number
  estHollar: number
  requestedDate: Date
  maxTimeRemainingDays: number
}

export function useRedemptionQueue(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["wdcl-vault-queue", evmAddress],
    queryFn: async () => {
      const vault = getContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, client: vaultEvmClient })

      const [length, head, totalQueued] = await Promise.all([
        vault.read.getRedemptionQueueLength(),
        vault.read.getQueueHead(),
        vault.read.getTotalQueuedWdcl(),
      ])

      const queueLength = Number(length)
      const queueHead = Number(head)
      const totalQueuedWdcl = Number(formatUnits(totalQueued, 18))

      const entries: QueueEntry[] = []
      const addr = evmAddress?.toLowerCase()

      for (let i = queueHead; i < queueLength; i++) {
        const [reqResult, waitResult] = await Promise.all([
          vault.read.getRedemptionRequest([BigInt(i)]),
          vault.read.getEstimatedWaitTime([BigInt(i)]),
        ])

        const [user, wdclAmount, wdclFulfilled, active] = reqResult
        if (!active) continue

        const remaining = Number(formatUnits(wdclAmount - wdclFulfilled, 18))
        entries.push({
          requestId: i,
          user,
          wdclAmount: Number(formatUnits(wdclAmount, 18)),
          wdclFulfilled: Number(formatUnits(wdclFulfilled, 18)),
          wdclRemaining: remaining,
          active,
          isUser: addr ? user.toLowerCase() === addr : false,
          estTimeRemainingDays: Math.ceil(Number(waitResult) / 86400),
        })
      }

      const myWithdrawals: WithdrawalRequest[] = entries
        .filter((e) => e.isUser)
        .map((e) => ({
          id: e.requestId,
          amountWdcl: e.wdclRemaining,
          estHollar: e.wdclRemaining,
          requestedDate: new Date(),
          maxTimeRemainingDays: e.estTimeRemainingDays,
        }))

      return {
        queue: entries,
        myWithdrawals,
        totalQueuedWdcl,
      }
    },
    refetchInterval: 30_000,
  })
}
