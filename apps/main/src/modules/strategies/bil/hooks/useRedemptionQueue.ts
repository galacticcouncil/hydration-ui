import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { bilVaultContractQuery } from "@/modules/strategies/bil/hooks/useBilVaultContract"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"

export interface QueueEntry {
  requestId: number
  user: string
  bilAmount: string
  bilSettled: string
  hollarOwed: string
  bilRemaining: string
  active: boolean
  isUser: boolean
  estTimeRemainingDays: number
}

export function useRedemptionQueue(evmAddress: string | undefined) {
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const { bil, hollar } = useBilStrategy()
  return useQuery({
    enabled: !!evmAddress && rpc.isReady,
    queryKey: bilQueryKeys.vaultQueue(evmAddress),
    queryFn: async () => {
      const vault = await queryClient.ensureQueryData(
        bilVaultContractQuery(rpc),
      )

      const [length, totalQueued] = await Promise.all([
        vault.read.getRedemptionQueueLength(),
        vault.read.getTotalQueuedBil(),
      ])

      const queueLength = Number(length)
      const totalQueuedBil = formatUnits(totalQueued, bil.decimals)

      const entries: QueueEntry[] = []
      const addr = evmAddress?.toLowerCase()

      // Scan from 0, not the queue head: the head moves past a request once
      // it is fully settled, but it stays active until its HOLLAR is claimed.
      for (let i = 0; i < queueLength; i++) {
        const [reqResult, waitResult] = await Promise.all([
          vault.read.getRedemptionRequest([BigInt(i)]),
          vault.read.getEstimatedWaitTime([BigInt(i)]),
        ])

        const [user, bilAmount, bilSettled, hollarOwed, active] = reqResult
        if (!active) continue

        const remaining = formatUnits(bilAmount - bilSettled, bil.decimals)
        entries.push({
          requestId: i,
          user,
          bilAmount: formatUnits(bilAmount, bil.decimals),
          bilSettled: formatUnits(bilSettled, bil.decimals),
          hollarOwed: formatUnits(hollarOwed, hollar.decimals),
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
