import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { gigaQueryKey, gigaTotalLockedQuery } from "@/api/gigaStake"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

type ClaimAndCompoundArgs = {
  /**
   * (refIndex, trackId) pairs for every completed referendum the user has a
   * `UserVoteRecord` for. Each becomes a `ConvictionVoting.remove_vote` call
   * at the front of the batch — triggering allocation if not yet done and
   * crediting the user's share into `PendingRewards`. trackId may be `null`
   * if the cached value was cleared after allocation; the runtime falls back
   * to iterating classes.
   */
  allocReadyVotes: ReadonlyArray<{ refIndex: number; trackId: number | null }>
  /**
   * Track-class ids for which to call `ConvictionVoting.unlock(class, target)`.
   * This recomputes `ClassLocksFor[target, class]` from current voting state
   * and releases any expired conviction-period locks on the user's HDX
   * balance. The call is idempotent — if nothing's expired yet, it's a no-op.
   *
   * Includes the union of:
   *   - Classes referenced by `allocReadyVotes` (so any lock from a vote we
   *     just removed gets recomputed)
   *   - Classes with a non-zero `ClassLocksFor` entry (legacy phantom locks
   *     from past votes that were never `unlock`'d after `remove_vote`)
   */
  unlockClasses: ReadonlyArray<number>
  /** The signer's address (passed as `target` to `unlock` calls). */
  accountAddress: string
  /** Has accrued passive yield to realize (Stakes.gigahdx × rate > Stakes.hdx). */
  hasAccruedYield: boolean
  /**
   * Has anything in `PendingRewards[who]` OR shares that will become pending
   * after `removeVote` runs. If either, `claim_rewards` is appended to the
   * batch to drain everything into auto-staked GIGAHDX.
   */
  hasClaimableRewards: boolean
}

/**
 * Batches everything the user has to compound back into their stake position:
 *
 *   utility.batch_all([
 *     ConvictionVoting.remove_vote(class, refIndex)  ×  N,   // populates PendingRewards
 *     ConvictionVoting.unlock(class, target)         ×  M,   // releases expired class locks
 *     GigaHdx.realize_yield()             (if hasAccruedYield),
 *     GigaHdxRewards.claim_rewards()      (if hasClaimableRewards),
 *   ])
 *
 * Net effect after success:
 *   - User's accrued passive yield folded into Stakes.hdx
 *   - User's earned voting reward shares credited and auto-staked into more GIGAHDX
 *   - Per-class conviction locks recomputed (expired ones drop to zero)
 *   - Vote-weight cap (Stakes.hdx) at maximum
 *   - NO HDX hits the user's wallet — both reward types compound into the
 *     position. To receive spendable HDX, the user still needs to unstake.
 */
export const useClaimAndCompound = () => {
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { t } = useTranslation("staking")
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      allocReadyVotes,
      unlockClasses,
      accountAddress: argAccountAddress,
      hasAccruedYield,
      hasClaimableRewards,
    }: ClaimAndCompoundArgs) => {
      const accountAddress = argAccountAddress || account?.address || ""
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const calls = [
        // 1. Force-remove the user's vote from every completed referendum.
        //    Each call triggers `on_remove_vote` which runs
        //    `maybe_allocate_and_record` → credits the share to
        //    PendingRewards. Class is the track id; falls back to runtime
        //    iteration when the cached track value is no longer in storage.
        ...allocReadyVotes.map(
          ({ refIndex, trackId }) =>
            rpc.papi.tx.ConvictionVoting.remove_vote({
              class: trackId ?? undefined,
              index: refIndex,
            }).decodedCall,
        ),

        // 2. Recompute per-class conviction locks. The runtime aggregates
        //    locks per (account, class) in `ClassLocksFor`; `unlock` rebuilds
        //    that entry from the user's current voting state. Expired locks
        //    drop to zero, releasing the user's HDX. Idempotent — no-op when
        //    nothing's expired.
        ...(accountAddress
          ? unlockClasses.map(
              (classId) =>
                rpc.papi.tx.ConvictionVoting.unlock({
                  target: accountAddress,
                  class: classId,
                }).decodedCall,
            )
          : []),

        // 3. Fold accrued passive yield into Stakes.hdx (only when present).
        hasAccruedYield
          ? unsafeApi.tx.GigaHdx.realize_yield().decodedCall
          : null,

        // 4. Drain PendingRewards into auto-staked GIGAHDX (only when present).
        hasClaimableRewards
          ? unsafeApi.tx.GigaHdxRewards.claim_rewards().decodedCall
          : null,
      ].filter(Boolean)

      const tx = rpc.papi.tx.Utility.batch_all({ calls })

      const toasts = {
        submitted: t("gigaStaking.claim.toasts.submitted"),
        success: t("gigaStaking.claim.toasts.success"),
      }

      return createTransaction({
        tx,
        invalidateQueries: [
          userGigaBorrowSummaryQueryKey(accountAddress),
          gigaQueryKey(accountAddress),
          gigaTotalLockedQuery(rpc).queryKey,
        ],
        toasts,
      })
    },
  })
}
