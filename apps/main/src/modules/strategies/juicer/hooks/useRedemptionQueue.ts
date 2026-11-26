import { queryOptions } from "@tanstack/react-query"
import {
  formatUnits,
  getContract,
  type Hex,
  parseUnits,
  zeroAddress,
} from "viem"

import {
  MAIN_DEBT_ABI,
  VAULT_ABI,
  YIELD_ACCOUNTING_ABI,
} from "@/modules/strategies/juicer/config/abi"
import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { withdrawalComplete } from "@/modules/strategies/juicer/utils/accounting"
import {
  type HeadroomState,
  projectHeadroomExits,
} from "@/modules/strategies/juicer/utils/headroomExit"
import { juicerQueryKeys } from "@/modules/strategies/juicer/utils/queryKeys"
import { requestFundedShares } from "@/modules/strategies/juicer/utils/requestFunded"
import {
  type LoopDeployment,
  START_SECONDS,
} from "@/modules/strategies/juicer/utils/withdrawalEta"
import { TProviderContext } from "@/providers/rpcProvider"

export interface QueueEntry {
  requestId: number
  owner: string
  /** includes the funded earnings a waiting request took beyond its wallet */
  shares: number
  collateralOwed: number
  collateralSettled: number
  claimedCollateral: number
  settledProgress: number
  complete: boolean
  active: boolean
  isUser: boolean
  started: boolean
  eligibleAt: number
  observedAt: number
  mainDebt: Hex
  surplusHollar: number
  sourcePending: boolean
  /** this request or an earlier one in the vault still waits for the loop's unwind */
  waitsOnUnwind: boolean
}

/** collateral an active request still waits for, whoever owns it */
export interface QueuedRequest {
  requestId: number
  remaining: number
  /** the keeper has started its unwind; its equity is in the exit backlog */
  started: boolean
  /**
   * settles only as the loop's unwind frees HOLLAR; before the exit starts it
   * is assumed, until projectQueue judges the start against the headroom
   */
  unwinding: boolean
  /** when the keeper may start it, ms */
  eligibleAt: number
  /**
   * HOLLAR the loop's unwind still has to free for it: the ledger's exact
   * remainder once started, projected for its start by projectQueue before
   */
  unwind?: number
  /** the keeper's deployment into the loop around its start, as projected */
  deployment?: LoopDeployment
}

export const vaultQueueQuery = (
  rpc: TProviderContext,
  vault: JuicerVaultConfig,
  decimals: number,
  evmAddress: Hex | undefined,
) =>
  queryOptions({
    enabled: rpc.isReady && !!evmAddress,
    queryKey: juicerQueryKeys.vaultQueue(vault.vaultAddress, evmAddress),
    queryFn: async () => {
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: rpc.evm,
      })
      // Use one block so cooldown, debt and claimability cannot disagree across reads.
      const block = await rpc.evm.getBlock()
      const options = { blockNumber: block.number }
      const [tail, totalQueued, unwind, mainDebt, accounting, rateWad] =
        await Promise.all([
          contract.read.queueTail(options),
          contract.read.totalQueuedShares(options),
          contract.read.queueUnwind(options),
          contract.read.mainDebt(options),
          contract.read.yieldAccounting(options),
          contract.read.exchangeRate(options),
        ])
      const exchangeRate = Number(formatUnits(rateWad, 18))
      const ledger = getContract({
        address: mainDebt,
        abi: MAIN_DEBT_ABI,
        client: rpc.evm,
      })
      const fund = getContract({
        address: accounting,
        abi: YIELD_ACCOUNTING_ABI,
        client: rpc.evm,
      })
      // shared by every waiting request that took funded earnings
      let fundState: Promise<[bigint, bigint, bigint, bigint]> | undefined
      const readFundState = () =>
        (fundState ??= Promise.all([
          fund.read.epoch(options),
          fund.read.unitScale(options),
          fund.read.totalUnits(options),
          contract.read.walletOf([accounting], options),
        ]))
      const readRequestFunded = async (id: bigint) => {
        const units = await fund.read.requestUnits([id], options)
        if (units === 0n) return 0n
        const [
          requestEpoch,
          requestScale,
          [epoch, unitScale, totalUnits, wallet],
        ] = await Promise.all([
          fund.read.requestEpoch([id], options),
          fund.read.requestScale([id], options),
          readFundState(),
        ])
        return requestFundedShares({
          units,
          requestEpoch,
          requestScale,
          epoch,
          unitScale,
          totalUnits,
          fund: wallet,
        })
      }
      const queue: Omit<QueueEntry, "waitsOnUnwind">[] = []
      // everyone's open requests: the queue is FIFO, so what is ahead of a
      // request decides when it settles
      const queued: QueuedRequest[] = []
      // Historical requests may still own recoveries after collateral has been claimed.
      // Bound RPC fan-out while scanning; a user-request index can replace this scan.
      for (let start = 0n; start < tail; start += 32n) {
        const ids = Array.from(
          { length: Number(tail - start > 32n ? 32n : tail - start) },
          (_, i) => start + BigInt(i),
        )
        const rows = await Promise.all(
          ids.map(async (id) => {
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
            ] = await contract.read.redemptions([id], options)
            if (owner === zeroAddress) return null
            const started = id < unwind
            const isUser = owner.toLowerCase() === evmAddress?.toLowerCase()
            const owed = repaid < debtShare
            const position =
              started &&
              mainDebt !== zeroAddress &&
              (isUser || (active && owed))
                ? await ledger.read.positions([id + 1n], options)
                : null
            const sourcePending = (position?.[3] ?? 0n) > 0n
            // every waiting request's start decides whether the ones behind it
            // settle from headroom
            const eligibleAt =
              active && !started
                ? await contract.read.unwindEligibleAt([id], options)
                : 0n
            if (active) {
              // collateral is released in step with the debt repaid
              const left = started
                ? debtShare > 0n
                  ? Number(formatUnits(collateralOwed, decimals)) *
                    (1 - Number(repaid) / Number(debtShare))
                  : 0
                : Number(formatUnits(shares, decimals)) * exchangeRate
              queued.push({
                requestId: Number(id),
                remaining: left,
                started,
                unwinding: !started || (owed && sourcePending),
                eligibleAt: Number(eligibleAt) * 1000,
                ...(started && {
                  // its claim still with the loop, up to the debt left
                  unwind: Number(
                    formatUnits(
                      !owed
                        ? 0n
                        : position && position[3] < debtShare - repaid
                          ? position[3]
                          : debtShare - repaid,
                      18,
                    ),
                  ),
                }),
              })
            }
            if (!isUser) return null
            const [userEligibleAt, claimed, surplus, funded] =
              await Promise.all([
                started
                  ? contract.read.unwindEligibleAt([id], options)
                  : eligibleAt,
                contract.read.claimedCollateral([id], options),
                started && mainDebt !== zeroAddress
                  ? ledger.read.surplusOf([id], options)
                  : 0n,
                // a started unwind already counts them in its shares
                started ? 0n : readRequestFunded(id),
              ])
            return {
              requestId: Number(id),
              owner,
              active,
              isUser: true,
              started,
              mainDebt,
              shares: Number(formatUnits(shares + funded, decimals)),
              collateralOwed: Number(formatUnits(collateralOwed, decimals)),
              collateralSettled: Number(
                formatUnits(collateralSettled, decimals),
              ),
              claimedCollateral: Number(formatUnits(claimed, decimals)),
              complete: withdrawalComplete(started, repaid, debtShare),
              settledProgress: started
                ? debtShare > 0n
                  ? Number(repaid) / Number(debtShare)
                  : 1
                : 0,
              eligibleAt: Number(userEligibleAt) * 1000,
              observedAt: Number(block.timestamp) * 1000,
              surplusHollar: Number(formatUnits(surplus, 18)),
              sourcePending,
            }
          }),
        )
        queue.push(...rows.filter((row) => row !== null))
      }
      return withWaits({
        queue,
        queued: queued.sort((a, b) => a.requestId - b.requestId),
        totalQueuedShares: Number(formatUnits(totalQueued, decimals)),
      })
    },
    // a settling withdrawal is the one moment the user is actually watching
    refetchInterval: (query) =>
      query.state.data?.queue.some((entry) => entry.isUser && entry.active)
        ? 10_000
        : 30_000,
  })

type VaultQueue = {
  queue: QueueEntry[]
  queued: QueuedRequest[]
  totalQueuedShares: number
}

// the vault settles FIFO: an unwinding request holds every later one
const withWaits = ({
  queue,
  ...rest
}: Omit<VaultQueue, "queue"> & {
  queue: Omit<QueueEntry, "waitsOnUnwind">[]
}): VaultQueue => ({
  ...rest,
  queue: queue.map((entry) => ({
    ...entry,
    waitsOnUnwind: rest.queued.some(
      (q) => q.unwinding && q.requestId <= entry.requestId,
    ),
  })),
})

/** collateral as the vault's integer units; null past what toFixed writes plainly */
export const collateralUnits = (amount: number, decimals: number) =>
  amount > 0 && amount < 1e21
    ? parseUnits(amount.toFixed(decimals), decimals)
    : null

export type ProjectedExtra = {
  viaHeadroom: boolean
  /** HOLLAR the loop's unwind must free for it (see projectHeadroomExits) */
  unwind: number
  /** the keeper's deployment into the loop around its start */
  deployment: LoopDeployment
}

/**
 * The queue with each waiting request judged as the keeper will start it:
 * from headroom, or by unwinding, with what the unwind must free for it
 * (see projectHeadroomExits). `extra` is a withdrawal not requested yet,
 * appended last; its own judgement comes back as `extra`.
 */
export const projectQueue = (
  data: VaultQueue,
  headroom: (HeadroomState & { observedAt: number }) | null | undefined,
  decimals: number,
  extra?: { collateral: number; startsIn: number },
): VaultQueue & { extra: ProjectedExtra | null } => {
  if (!headroom) return { ...data, extra: null }
  const waiting = data.queued.filter((q) => !q.started)
  const exits = [
    ...waiting.map((q) => ({
      collateral: collateralUnits(q.remaining, decimals),
      startsIn:
        Math.max(q.eligibleAt - headroom.observedAt, 0) / 1000 + START_SECONDS,
    })),
    ...(extra
      ? [
          {
            collateral: collateralUnits(extra.collateral, decimals),
            startsIn: extra.startsIn,
          },
        ]
      : []),
  ]
  if (exits.some((e) => e.collateral === null)) return { ...data, extra: null }
  const projected = projectHeadroomExits(
    headroom,
    exits.map((e) => ({ collateral: e.collateral!, startsIn: e.startsIn })),
  )
  const hollar = (amount: bigint) => Number(formatUnits(amount, 18))
  const d = headroom.deployment
  const perSecond = !d
    ? 0
    : d.sliceSeconds > 0
      ? hollar(d.sliceHollar) / d.sliceSeconds
      : Infinity
  const deploymentOf = (exit: (typeof projected)[number]) => ({
    byStart: hollar(exit.deployed),
    later: hollar(exit.deployLater),
    perSecond,
  })
  const judged = new Map(waiting.map((q, i) => [q.requestId, projected[i]!]))
  const own = extra ? projected[waiting.length] : undefined
  return {
    ...withWaits({
      ...data,
      queued: data.queued.map((q) => {
        const exit = judged.get(q.requestId)
        return exit
          ? {
              ...q,
              unwinding: !exit.viaHeadroom,
              unwind: hollar(exit.unwind),
              deployment: deploymentOf(exit),
            }
          : q
      }),
    }),
    extra: own
      ? {
          viaHeadroom: own.viaHeadroom,
          unwind: hollar(own.unwind),
          deployment: deploymentOf(own),
        }
      : null,
  }
}
