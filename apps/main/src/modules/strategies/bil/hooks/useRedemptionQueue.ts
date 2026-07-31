import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { bilVaultContractQuery } from "@/modules/strategies/bil/hooks/useBilVaultContract"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"

export interface QueueEntry {
  requestId: number
  user: string
  bilAmount: number
  bilSettled: number
  hollarOwed: number
  bilRemaining: number
  active: boolean
  isUser: boolean
  estTimeRemainingDays: number
}

export function useRedemptionQueue(evmAddress: string | undefined) {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const { bil, hollar } = useBilStrategy()
  return useQuery({
    enabled: !!evmAddress && rpc.isLoaded,
    queryKey: bilQueryKeys.vaultQueue(evmAddress),
    queryFn: async () => {
      const vault = await queryClient.ensureQueryData(
        bilVaultContractQuery(rpc),
      )

      const [length, head, totalQueued] = await Promise.all([
        vault.read.getRedemptionQueueLength(),
        vault.read.getQueueHead(),
        vault.read.getTotalQueuedBil(),
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
