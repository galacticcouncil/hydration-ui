import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex, parseAbiItem } from "viem"

import { VAULT_DEPLOY_BLOCK } from "@/modules/strategies/propeller/constants"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

// RedeemSettled is the ONLY vault event the UI can see. Deposited,
// RedeemRequested and Claimed are all emitted by calls the user makes, and the
// app dispatches those through `papi.tx.EVM.call` (pallet-evm) rather than
// `Ethereum.transact` — so they never become Ethereum transactions and never
// reach eth_getLogs. Verified on lark-4: both vaults show 0 of those three
// across their whole history while `redemptions(0)` proves the requests
// happened. RedeemSettled survives because the keeper signs native Ethereum
// transactions, and requestId is indexed so it can be filtered server-side.
const SETTLED_EVENT = parseAbiItem(
  "event RedeemSettled(uint256 indexed requestId, uint256 collateral)",
)

export interface RedemptionSettlement {
  requestId: number
  /**
   * Collateral actually released to the request, summed across every
   * settlement tranche. This is the true payout and the only place it is
   * recorded: `redemptions[id].collateralSettled` is zeroed on each claim, and
   * `collateralOwed * repaid / debtShare` cannot reconstruct it because
   * `_retireExhaustedHead` snaps `debtShare` down to `repaid` after the
   * releases were computed against the original. Verified against lark-4's
   * measured redeems (0.097613744 ETH and 0.003991156 tBTC).
   */
  collateralSettled: number
  firstSettledAt: Date
  lastSettledAt: Date
}

/**
 * Measured settlement amounts and timestamps, keyed by requestId.
 *
 * This is NOT the source of request state or ownership — `redemptions[id]` is
 * never deleted on chain, so the queue read covers every request and carries
 * the live truth for both. This hook exists only to recover the amount that
 * actually left the vault, which no view function reports.
 */
export function useRedemptionHistory(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { vaultAddress, assetId } = useActivePropellerVault()
  // Collateral carries the collateral's scale — see the note in useVaultReads.
  const decimals = getAssetWithFallback(assetId).decimals
  return useQuery({
    queryKey: ["propeller-vault-settlements", vaultAddress, assetId],
    enabled: !!evmAddress,
    queryFn: async (): Promise<RedemptionSettlement[]> => {
      // One topic-filtered call covers the whole deployment: measured at 0.39s
      // over ~14.7k blocks on lark-4. The node's 10s eth_getLogs timeout only
      // bites when scanning from genesis, which VAULT_DEPLOY_BLOCK avoids.
      const logs = await evm.getLogs({
        address: vaultAddress,
        fromBlock: VAULT_DEPLOY_BLOCK,
        event: SETTLED_EVENT,
      })

      // Resolve block timestamps once per unique blockHash.
      const uniqueBlockHashes = [
        ...new Set(logs.map((l) => l.blockHash).filter((h): h is Hex => !!h)),
      ]
      const blocks = await Promise.all(
        uniqueBlockHashes.map((blockHash) => evm.getBlock({ blockHash })),
      )
      const tsByBlock = new Map<Hex, Date>()
      for (const b of blocks) {
        if (b.hash) tsByBlock.set(b.hash, new Date(Number(b.timestamp) * 1000))
      }

      const byId = new Map<bigint, RedemptionSettlement>()
      for (const l of logs) {
        const requestId = l.args.requestId!
        const ts = l.blockHash ? tsByBlock.get(l.blockHash) : undefined
        // _retireExhaustedHead emits RedeemSettled(id, 0) to close a stalled
        // request out. It carries no collateral but is a real settlement event,
        // so it still moves lastSettledAt.
        const collateral = Number(formatUnits(l.args.collateral!, decimals))
        const entry = byId.get(requestId)
        if (!entry) {
          byId.set(requestId, {
            requestId: Number(requestId),
            collateralSettled: collateral,
            firstSettledAt: ts ?? new Date(0),
            lastSettledAt: ts ?? new Date(0),
          })
        } else {
          entry.collateralSettled += collateral
          if (ts) entry.lastSettledAt = ts
        }
      }

      return [...byId.values()]
    },
    refetchInterval: 30_000,
    staleTime: 30_000,
  })
}
