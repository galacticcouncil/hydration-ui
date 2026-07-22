import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex } from "viem"

import { usePropellerVaultContract } from "@/modules/strategies/propeller/hooks/usePropellerVaultContract"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"

export interface QueueEntry {
  requestId: number
  owner: string
  /** pETH shares escrowed by the request. */
  shares: number
  /** ETH the vault owes for this request once settled. */
  collateralOwed: number
  /** ETH already settled and claimable. */
  collateralSettled: number
  /** True while the keeper hasn't fully settled the request yet. */
  active: boolean
  isUser: boolean
}

export function useRedemptionQueue(evmAddress: Hex | undefined) {
  const { data: vault } = usePropellerVaultContract()
  const { vaultAddress } = useActivePropellerVault()
  return useQuery({
    enabled: !!vault && !!evmAddress,
    queryKey: ["propeller-vault-queue", vaultAddress, evmAddress],
    queryFn: async () => {
      if (!vault) throw new Error("Vault contract not found")

      const [head, tail, totalQueued] = await Promise.all([
        vault.read.queueHead(),
        vault.read.queueTail(),
        vault.read.totalQueuedShares(),
      ])

      const queueHead = Number(head)
      const queueTail = Number(tail)
      const totalQueuedShares = Number(formatUnits(totalQueued, 18))

      const entries: QueueEntry[] = []
      const addr = evmAddress?.toLowerCase()

      for (let i = queueHead; i < queueTail; i++) {
        const [owner, shares, collateralOwed, , , , collateralSettled, active] =
          await vault.read.redemptions([BigInt(i)])

        // Skip slots that were never populated (zero owner).
        if (owner === "0x0000000000000000000000000000000000000000") continue

        entries.push({
          requestId: i,
          owner,
          shares: Number(formatUnits(shares, 18)),
          collateralOwed: Number(formatUnits(collateralOwed, 18)),
          collateralSettled: Number(formatUnits(collateralSettled, 18)),
          active,
          isUser: addr ? owner.toLowerCase() === addr : false,
        })
      }

      return {
        queue: entries,
        totalQueuedShares,
      }
    },
    refetchInterval: 30_000,
  })
}
