import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex } from "viem"

import { usePropellerVaultContract } from "@/modules/strategies/propeller/hooks/usePropellerVaultContract"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import { useAssets } from "@/providers/assetsProvider"

export interface QueueEntry {
  requestId: number
  owner: string
  /** Vault shares escrowed by the request. */
  shares: number
  /** Collateral the vault owes for this request once settled. */
  collateralOwed: number
  /** Collateral settled and not yet claimed — claim() decrements this. */
  collateralSettled: number
  /**
   * Fraction (0–1) of the request the keeper has unwound so far, taken from
   * repaid/debtShare. `collateralSettled` cannot be used for this: it is
   * claimable collateral, so a claim resets it to 0 even mid-settlement.
   */
  settledProgress: number
  /** True until the owner claims — not a settlement flag. */
  active: boolean
  isUser: boolean
}

export function useRedemptionQueue(evmAddress: Hex | undefined) {
  const { data: vault } = usePropellerVaultContract()
  const { getAssetWithFallback } = useAssets()
  const { vaultAddress, assetId } = useActivePropellerVault()
  // Shares are numerically scaled to the collateral (CollateralVault has no
  // decimals() override), so shares and collateral amounts share these.
  const decimals = getAssetWithFallback(assetId).decimals
  return useQuery({
    enabled: !!vault && !!evmAddress,
    queryKey: ["propeller-vault-queue", vaultAddress, evmAddress, assetId],
    queryFn: async () => {
      if (!vault) throw new Error("Vault contract not found")

      const [tail, totalQueued] = await Promise.all([
        vault.read.queueTail(),
        vault.read.totalQueuedShares(),
      ])

      const queueTail = Number(tail)
      const totalQueuedShares = Number(formatUnits(totalQueued, decimals))

      const entries: QueueEntry[] = []
      const addr = evmAddress?.toLowerCase()

      // Scan from 0, not queueHead: pokeSettle advances the head as soon as a
      // request is fully repaid, so settled-but-unclaimed requests sit BELOW
      // the head. Starting at the head would hide the claim.
      // ponytail: linear scan; add a per-user index if the queue ever gets long.
      for (let i = 0; i < queueTail; i++) {
        const [
          owner,
          shares,
          collateralOwed,
          debtShare,
          ,
          repaid,
          collateralSettled,
          ,
          active,
        ] = await vault.read.redemptions([BigInt(i)])

        // Skip slots that were never populated (zero owner).
        if (owner === "0x0000000000000000000000000000000000000000") continue

        entries.push({
          requestId: i,
          owner,
          shares: Number(formatUnits(shares, decimals)),
          collateralOwed: Number(formatUnits(collateralOwed, decimals)),
          collateralSettled: Number(formatUnits(collateralSettled, decimals)),
          settledProgress:
            debtShare > 0n ? Number(repaid) / Number(debtShare) : 0,
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
