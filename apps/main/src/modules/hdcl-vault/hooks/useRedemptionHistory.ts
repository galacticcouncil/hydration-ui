import { useQuery } from "@tanstack/react-query"
import { formatUnits, parseAbiItem, type Hex } from "viem"

import { VAULT_ADDRESS, VAULT_DEPLOY_BLOCK, vaultEvmClient } from "../constants"

// The vault contract emits these events but the on-chain `getRedemptionRequest`
// view doesn't return a request timestamp. Reconstructing per-request history
// therefore requires reading event logs and resolving each log's block.timestamp.
//
// All four events are declared on VAULT_ABI; we re-define them here as standalone
// items so viem can type-narrow the `args` object when filtering by getLogs.
const REQUESTED_EVENT = parseAbiItem(
  "event RedemptionRequested(uint256 indexed requestId, address indexed user, uint256 hdclAmount)",
)
const FULFILLED_EVENT = parseAbiItem(
  "event RedemptionFulfilled(uint256 indexed requestId, address indexed user, uint256 hollarAmount, uint256 hdclBurned)",
)
const PARTIALLY_FULFILLED_EVENT = parseAbiItem(
  "event RedemptionPartiallyFulfilled(uint256 indexed requestId, address indexed user, uint256 hollarAmount, uint256 hdclBurned)",
)
const CANCELLED_EVENT = parseAbiItem(
  "event RedemptionCancelled(uint256 indexed requestId, uint256 hdclReturned)",
)

export type RedemptionState = "pending" | "partial" | "fulfilled" | "cancelled"

export interface PartialFill {
  at: Date
  hdclBurned: number
  hollarReceived: number
}

export interface RedemptionHistoryEntry {
  requestId: number
  state: RedemptionState
  requestedAt: Date
  hdclRequested: number
  /** Sum of hdclBurned across partial + final fulfillments. */
  hdclFulfilled: number
  /** Sum of hollarAmount paid out across fulfillments. */
  hollarReceived: number
  /** Most recent fulfillment timestamp (partial or final). null if none. */
  fulfilledAt: Date | null
  cancelledAt: Date | null
  partials: PartialFill[]
}

/**
 * Single source of truth for a user's redemption-queue history.
 *
 * Data comes from event logs scanned from VAULT_DEPLOY_BLOCK. Block timestamps
 * are fetched once per unique blockHash (logs in the same block share one).
 *
 * State machine per requestId:
 *   Requested → (PartiallyFulfilled)* → Fulfilled  → state = "fulfilled"
 *   Requested → (PartiallyFulfilled)+                → state = "partial"
 *   Requested                                        → state = "pending"
 *   Requested → Cancelled                            → state = "cancelled"
 *
 * Drives:
 *   - MyWithdrawals "Date" column (requestedAt)
 *   - MyWithdrawals time-remaining cell state ("Pending" / "Instant redeem" / "Redeemed")
 *   - "Show Redeemed" toggle (filters on state)
 *   - History rows
 */
export function useRedemptionHistory(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["hdcl-vault-history", evmAddress],
    enabled: !!evmAddress,
    queryFn: async (): Promise<RedemptionHistoryEntry[]> => {
      if (!evmAddress) return []

      const baseFilter = {
        address: VAULT_ADDRESS,
        fromBlock: VAULT_DEPLOY_BLOCK,
      } as const

      // RedemptionCancelled does NOT have `user` indexed (only `requestId`),
      // so we fetch all cancellations and intersect with requestIds we own.
      const [requestedLogs, fulfilledLogs, partialLogs, cancelledLogs] = await Promise.all([
        vaultEvmClient.getLogs({ ...baseFilter, event: REQUESTED_EVENT, args: { user: evmAddress } }),
        vaultEvmClient.getLogs({ ...baseFilter, event: FULFILLED_EVENT, args: { user: evmAddress } }),
        vaultEvmClient.getLogs({ ...baseFilter, event: PARTIALLY_FULFILLED_EVENT, args: { user: evmAddress } }),
        vaultEvmClient.getLogs({ ...baseFilter, event: CANCELLED_EVENT }),
      ])

      const userRequestIds = new Set(requestedLogs.map((l) => l.args.requestId!))
      const myCancelledLogs = cancelledLogs.filter((l) => userRequestIds.has(l.args.requestId!))

      // Resolve block timestamps once per unique blockHash (logs from the same
      // block reuse the same timestamp).
      const allUserLogs = [...requestedLogs, ...fulfilledLogs, ...partialLogs, ...myCancelledLogs]
      const uniqueBlockHashes = [
        ...new Set(allUserLogs.map((l) => l.blockHash).filter((h): h is Hex => !!h)),
      ]
      const blocks = await Promise.all(
        uniqueBlockHashes.map((blockHash) => vaultEvmClient.getBlock({ blockHash })),
      )
      const tsByBlock = new Map<Hex, Date>()
      for (const b of blocks) {
        if (b.hash) tsByBlock.set(b.hash, new Date(Number(b.timestamp) * 1000))
      }
      const tsOf = (log: { blockHash: Hex | null }) =>
        log.blockHash ? tsByBlock.get(log.blockHash) ?? new Date(0) : new Date(0)

      // Build per-request entries from RedemptionRequested logs first, then
      // overlay fulfillments and cancellations.
      const byId = new Map<bigint, RedemptionHistoryEntry>()

      for (const l of requestedLogs) {
        const requestId = l.args.requestId!
        byId.set(requestId, {
          requestId: Number(requestId),
          state: "pending",
          requestedAt: tsOf(l),
          hdclRequested: Number(formatUnits(l.args.hdclAmount!, 18)),
          hdclFulfilled: 0,
          hollarReceived: 0,
          fulfilledAt: null,
          cancelledAt: null,
          partials: [],
        })
      }

      const applyFulfillment = (
        log: (typeof partialLogs)[number] | (typeof fulfilledLogs)[number],
        isFinal: boolean,
      ) => {
        const entry = byId.get(log.args.requestId!)
        if (!entry) return
        const hollar = Number(formatUnits(log.args.hollarAmount!, 18))
        const hdclBurned = Number(formatUnits(log.args.hdclBurned!, 18))
        const at = tsOf(log)
        entry.hollarReceived += hollar
        entry.hdclFulfilled += hdclBurned
        entry.partials.push({ at, hdclBurned, hollarReceived: hollar })
        if (!entry.fulfilledAt || at > entry.fulfilledAt) entry.fulfilledAt = at
        if (isFinal) entry.state = "fulfilled"
        else if (entry.state === "pending") entry.state = "partial"
      }

      for (const l of partialLogs) applyFulfillment(l, false)
      for (const l of fulfilledLogs) applyFulfillment(l, true)

      for (const l of myCancelledLogs) {
        const entry = byId.get(l.args.requestId!)
        if (!entry) continue
        entry.state = "cancelled"
        entry.cancelledAt = tsOf(l)
      }

      const result = [...byId.values()].sort(
        (a, b) => b.requestedAt.getTime() - a.requestedAt.getTime(),
      )

      if (import.meta.env.DEV) {
        console.log("[hdcl-vault] redemption history scan", {
          evmAddress,
          fromBlock: VAULT_DEPLOY_BLOCK.toString(),
          requestedLogsCount: requestedLogs.length,
          fulfilledLogsCount: fulfilledLogs.length,
          partialLogsCount: partialLogs.length,
          cancelledMatchingUserCount: myCancelledLogs.length,
          totalCancelledScanned: cancelledLogs.length,
          historyEntries: result.length,
          historyByState: result.reduce(
            (acc, e) => ({ ...acc, [e.state]: (acc[e.state] ?? 0) + 1 }),
            {} as Record<string, number>,
          ),
        })
      }

      // Newest first.
      return result
    },
    // Logs for finalized blocks are immutable; we refetch periodically to
    // pick up new requests/fulfillments rather than to revalidate old ones.
    refetchInterval: 30_000,
    staleTime: 30_000,
  })
}

/** Convenience selector — only requests the user can still act on (or queue-active). */
export function selectActiveHistory(entries: RedemptionHistoryEntry[]) {
  return entries.filter((e) => e.state === "pending" || e.state === "partial")
}

/** Convenience selector — fully completed or cancelled (for "Show Redeemed" toggle). */
export function selectCompletedHistory(entries: RedemptionHistoryEntry[]) {
  return entries.filter((e) => e.state === "fulfilled" || e.state === "cancelled")
}
