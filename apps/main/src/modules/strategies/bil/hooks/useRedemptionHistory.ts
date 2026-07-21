import { useQuery } from "@tanstack/react-query"
import { formatUnits, type Hex, parseAbiItem } from "viem"

import {
  VAULT_ADDRESS,
  VAULT_DEPLOY_BLOCK,
} from "@/modules/strategies/bil/constants"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"

// The vault contract emits these events but the on-chain `getRedemptionRequest`
// view doesn't return a request timestamp. Reconstructing per-request history
// therefore requires reading event logs and resolving each log's block.timestamp.
//
// All four events are declared on VAULT_ABI; we re-define them here as standalone
// items so viem can type-narrow the `args` object when filtering by getLogs.
const REQUESTED_EVENT = parseAbiItem(
  "event RedemptionRequested(uint256 indexed requestId, address indexed user, uint256 bilAmount)",
)
const FULFILLED_EVENT = parseAbiItem(
  "event RedemptionFulfilled(uint256 indexed requestId, address indexed user, uint256 hollarAmount, uint256 bilBurned)",
)
const PARTIALLY_FULFILLED_EVENT = parseAbiItem(
  "event RedemptionPartiallyFulfilled(uint256 indexed requestId, address indexed user, uint256 hollarAmount, uint256 bilBurned)",
)
const CANCELLED_EVENT = parseAbiItem(
  "event RedemptionCancelled(uint256 indexed requestId, uint256 bilReturned)",
)

export type RedemptionState = "pending" | "partial" | "fulfilled" | "cancelled"

export interface PartialFill {
  at: Date
  bilBurned: number
  hollarReceived: number
}

export interface RedemptionHistoryEntry {
  requestId: number
  state: RedemptionState
  requestedAt: Date
  bilRequested: number
  /** Sum of bilBurned across partial + final fulfillments. */
  bilFulfilled: number
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
 * State machine per requestId (event-derived):
 *   Requested → (PartiallyFulfilled)* → Fulfilled  → state = "fulfilled"
 *   Requested → (PartiallyFulfilled)+                → state = "partial"
 *   Requested                                        → state = "pending"
 *   Requested → Cancelled                            → state = "cancelled"
 *
 * Semantics changed at lark-2 (ERC-7540 async-claim model):
 *   - `RedemptionFulfilled` event no longer means "user has received
 *     HOLLAR". It means "all of this request's hDCL is queue-side settled
 *     and waiting in the controller's claimable inventory". The user must
 *     still call `vault.redeem(shares, receiver, controller)` (or the
 *     keeper does it via auto-claim) to actually receive the HOLLAR.
 *   - For "is this request claimable right now?" reads, use
 *     `claimableRedeemRequest(reqId, controller)` from the on-chain view —
 *     event logs alone can't tell you whether the claim step has run.
 *   - For the actual HOLLAR-transfer audit, scan the canonical
 *     ERC-4626/7540 `Withdraw(sender, receiver, owner, assets, shares)`
 *     event.
 *
 * Drives:
 *   - Withdrawals time-remaining cell state ("Pending" / "Claimable" / "Redeemed")
 *   - "Show Redeemed" toggle (filters on state)
 *   - History rows
 */
export function useRedemptionHistory(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: bilQueryKeys.vaultHistory(evmAddress),
    enabled: !!evmAddress,
    queryFn: async (): Promise<RedemptionHistoryEntry[]> => {
      if (!evmAddress) return []

      const baseFilter = {
        address: VAULT_ADDRESS,
        fromBlock: VAULT_DEPLOY_BLOCK,
      } as const

      // RedemptionCancelled does NOT have `user` indexed (only `requestId`),
      // so we fetch all cancellations and intersect with requestIds we own.
      const [requestedLogs, fulfilledLogs, partialLogs, cancelledLogs] =
        await Promise.all([
          evm.getLogs({
            ...baseFilter,
            event: REQUESTED_EVENT,
            args: { user: evmAddress },
          }),
          evm.getLogs({
            ...baseFilter,
            event: FULFILLED_EVENT,
            args: { user: evmAddress },
          }),
          evm.getLogs({
            ...baseFilter,
            event: PARTIALLY_FULFILLED_EVENT,
            args: { user: evmAddress },
          }),
          evm.getLogs({
            ...baseFilter,
            event: CANCELLED_EVENT,
          }),
        ])

      const userRequestIds = new Set(
        requestedLogs.map((l) => l.args.requestId!),
      )
      const myCancelledLogs = cancelledLogs.filter((l) =>
        userRequestIds.has(l.args.requestId!),
      )

      // Resolve block timestamps once per unique blockHash (logs from the same
      // block reuse the same timestamp).
      const allUserLogs = [
        ...requestedLogs,
        ...fulfilledLogs,
        ...partialLogs,
        ...myCancelledLogs,
      ]
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

      // Build per-request entries from RedemptionRequested logs first, then
      // overlay fulfillments and cancellations.
      const byId = new Map<bigint, RedemptionHistoryEntry>()

      for (const l of requestedLogs) {
        const requestId = l.args.requestId!
        byId.set(requestId, {
          requestId: Number(requestId),
          state: "pending",
          requestedAt: tsOf(l),
          bilRequested: Number(formatUnits(l.args.bilAmount!, 18)),
          bilFulfilled: 0,
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
        const bilBurned = Number(formatUnits(log.args.bilBurned!, 18))
        const at = tsOf(log)
        entry.hollarReceived += hollar
        entry.bilFulfilled += bilBurned
        entry.partials.push({ at, bilBurned, hollarReceived: hollar })
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

      // Newest first.
      return result
    },
    staleTime: 30_000,
  })
}

/** Convenience selector — only requests the user can still act on (or queue-active). */
export function selectActiveHistory(entries: RedemptionHistoryEntry[]) {
  return entries.filter((e) => e.state === "pending" || e.state === "partial")
}

/** Convenience selector — fully completed or cancelled (for "Show Redeemed" toggle). */
export function selectCompletedHistory(entries: RedemptionHistoryEntry[]) {
  return entries.filter(
    (e) => e.state === "fulfilled" || e.state === "cancelled",
  )
}
