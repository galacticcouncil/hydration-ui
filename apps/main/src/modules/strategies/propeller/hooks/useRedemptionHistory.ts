import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex, parseAbiItem } from "viem"

import {
  VAULT_ADDRESS,
  VAULT_DEPLOY_BLOCK,
} from "@/modules/strategies/propeller/constants"
import { useRpcProvider } from "@/providers/rpcProvider"

// The on-chain `redemptions` view doesn't carry request timestamps, so we
// reconstruct per-request history from event logs and resolve each log's
// block.timestamp. All three events are declared on VAULT_ABI; re-defined
// here as standalone items so viem can type-narrow `args` for getLogs.
const REQUESTED_EVENT = parseAbiItem(
  "event RedeemRequested(uint256 indexed requestId, address indexed owner, uint256 shares)",
)
const SETTLED_EVENT = parseAbiItem(
  "event RedeemSettled(uint256 indexed requestId, uint256 collateral)",
)
const CLAIMED_EVENT = parseAbiItem(
  "event Claimed(uint256 indexed requestId, address indexed receiver, uint256 collateral)",
)

export type RedemptionState = "pending" | "settled" | "claimed"

export interface RedemptionHistoryEntry {
  requestId: number
  state: RedemptionState
  requestedAt: Date
  /** pETH shares the request escrowed. */
  shares: number
  /** ETH settled by the keeper (available to claim). */
  collateralSettled: number
  /** ETH actually claimed by the user. */
  collateralClaimed: number
  settledAt: Date | null
  claimedAt: Date | null
}

/**
 * Single source of truth for a user's redemption-queue history.
 *
 * Data comes from event logs scanned from VAULT_DEPLOY_BLOCK. Block
 * timestamps are fetched once per unique blockHash.
 *
 * State machine per requestId (event-derived):
 *   RedeemRequested                         → state = "pending"
 *   RedeemRequested → RedeemSettled         → state = "settled" (claimable)
 *   RedeemRequested → ... → Claimed         → state = "claimed"
 */
export function useRedemptionHistory(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: ["propeller-vault-history", evmAddress],
    enabled: !!evmAddress,
    queryFn: async (): Promise<RedemptionHistoryEntry[]> => {
      if (!evmAddress) return []

      const baseFilter = {
        address: VAULT_ADDRESS,
        fromBlock: VAULT_DEPLOY_BLOCK,
      } as const

      // RedeemSettled has no indexed owner, so we fetch all settlements and
      // intersect with the requestIds we own.
      const [requestedLogs, settledLogs, claimedLogs] = await Promise.all([
        evm.getLogs({
          ...baseFilter,
          event: REQUESTED_EVENT,
          args: { owner: evmAddress },
        }),
        evm.getLogs({
          ...baseFilter,
          event: SETTLED_EVENT,
        }),
        evm.getLogs({
          ...baseFilter,
          event: CLAIMED_EVENT,
          args: { receiver: evmAddress },
        }),
      ])

      const userRequestIds = new Set(
        requestedLogs.map((l) => l.args.requestId!),
      )
      const mySettledLogs = settledLogs.filter((l) =>
        userRequestIds.has(l.args.requestId!),
      )

      // Resolve block timestamps once per unique blockHash.
      const allUserLogs = [...requestedLogs, ...mySettledLogs, ...claimedLogs]
      const uniqueBlockHashes = [
        ...new Set(
          allUserLogs.map((l) => l.blockHash).filter((h): h is Hex => !!h),
        ),
      ]
      const blocks = await Promise.all(
        uniqueBlockHashes.map((blockHash) => evm.getBlock({ blockHash })),
      )
      const tsByBlock = new Map<Hex, Date>()
      for (const b of blocks) {
        if (b.hash) tsByBlock.set(b.hash, new Date(Number(b.timestamp) * 1000))
      }
      const tsOf = (log: { blockHash: Hex | null }) =>
        log.blockHash
          ? (tsByBlock.get(log.blockHash) ?? new Date(0))
          : new Date(0)

      const byId = new Map<bigint, RedemptionHistoryEntry>()

      for (const l of requestedLogs) {
        const requestId = l.args.requestId!
        byId.set(requestId, {
          requestId: Number(requestId),
          state: "pending",
          requestedAt: tsOf(l),
          shares: Number(formatUnits(l.args.shares!, 18)),
          collateralSettled: 0,
          collateralClaimed: 0,
          settledAt: null,
          claimedAt: null,
        })
      }

      for (const l of mySettledLogs) {
        const entry = byId.get(l.args.requestId!)
        if (!entry) continue
        entry.collateralSettled += Number(formatUnits(l.args.collateral!, 18))
        entry.settledAt = tsOf(l)
        if (entry.state === "pending") entry.state = "settled"
      }

      for (const l of claimedLogs) {
        const entry = byId.get(l.args.requestId!)
        if (!entry) continue
        entry.collateralClaimed += Number(formatUnits(l.args.collateral!, 18))
        entry.claimedAt = tsOf(l)
        entry.state = "claimed"
      }

      // Newest first.
      return [...byId.values()].sort(
        (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime(),
      )
    },
    refetchInterval: 30_000,
    staleTime: 30_000,
  })
}
