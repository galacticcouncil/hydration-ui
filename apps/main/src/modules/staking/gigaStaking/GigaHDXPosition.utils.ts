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
  /**
   * Optional GIGAHDX amount (in planck) to `giga_unstake` at the end of the
   * batch. When present, the batch becomes "unlock + unstake" — all the
   * `remove_vote` calls release `Stakes.frozen` first, then `giga_unstake`
   * runs against the now-reduced freeze. Used by the Withdraw form when the
   * user wants to unstake more than the current frozen-constrained max.
   *
   * Omit / 0n for the plain "Claim rewards" flow (no unstake).
   */
  unstakeGigahdxAmount?: bigint
  /**
   * Used for toast messages and form reset when `unstakeGigahdxAmount` is
   * present. Ignored otherwise.
   */
  unstakeAmountHuman?: string
  /**
   * Total HDX amount that `claim_rewards` will drain into the position
   * inside the batch (pending + about-to-be-credited from `remove_vote`).
   * When non-empty and unstake is set, the success/submitted toasts use
   * the "...claimed N HDX rewards" variants so the user sees the rewards
   * piece broken out from the unstaked total.
   */
  claimedRewardsHdxHuman?: string
}

/**
 * Batches everything the user has to compound back into their stake position
 * — and optionally appends a `giga_unstake` call at the end:
 *
 *   utility.batch_all([
 *     ConvictionVoting.remove_vote(class, refIndex)  ×  N,   // populates PendingRewards, unfreezes Stakes
 *     ConvictionVoting.unlock(class, target)         ×  M,   // releases expired class locks
 *     GigaHdx.realize_yield()             (if hasAccruedYield),
 *     GigaHdxRewards.claim_rewards()      (if hasClaimableRewards),
 *     GigaHdx.giga_unstake(amount)        (if unstakeGigahdxAmount > 0),
 *   ])
 *
 * Net effect after success:
 *   - User's accrued passive yield folded into Stakes.hdx
 *   - User's earned voting reward shares credited and auto-staked into more GIGAHDX
 *   - Per-class conviction locks recomputed (expired ones drop to zero)
 *   - `Stakes.frozen` reduced by the sum of unfreezable vote stakes
 *   - If `unstakeGigahdxAmount` set: GIGAHDX unstaked into a pending position
 *     (the `remove_vote` calls run first, reducing freeze, so this succeeds
 *     against the post-cleanup freeze level)
 *   - When no unstake: NO HDX hits the user's wallet — reward types compound
 *     into the position.
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
      unstakeGigahdxAmount,
      unstakeAmountHuman,
      claimedRewardsHdxHuman,
    }: ClaimAndCompoundArgs) => {
      const accountAddress = argAccountAddress || account?.address || ""
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any
      const hasUnstake =
        unstakeGigahdxAmount !== undefined && unstakeGigahdxAmount > 0n

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

        // 5. Optionally append the unstake. By this point all remove_vote
        //    calls have unfrozen `Stakes.frozen`, so the runtime's
        //    `do_unstake` check (`projected_hdx >= Stakes.frozen`) sees the
        //    post-cleanup frozen value.
        hasUnstake
          ? unsafeApi.tx.GigaHdx.giga_unstake({
              gigahdx_amount: unstakeGigahdxAmount,
            }).decodedCall
          : null,
      ].filter(Boolean)

      const tx = rpc.papi.tx.Utility.batch_all({ calls })

      const hasClaimedRewards =
        claimedRewardsHdxHuman !== undefined &&
        claimedRewardsHdxHuman !== null &&
        claimedRewardsHdxHuman !== "0"

      const toasts = hasUnstake
        ? hasClaimedRewards
          ? {
              submitted: t("gigaStaking.unstake.toasts.submittedWithRewards", {
                value: unstakeAmountHuman ?? "0",
                rewardsValue: claimedRewardsHdxHuman,
              }),
              success: t("gigaStaking.unstake.toasts.successWithRewards", {
                value: unstakeAmountHuman ?? "0",
                rewardsValue: claimedRewardsHdxHuman,
              }),
            }
          : {
              submitted: t("gigaStaking.unstake.toasts.submitted", {
                value: unstakeAmountHuman ?? "0",
                symbol: "GIGAHDX",
              }),
              success: t("gigaStaking.unstake.toasts.success", {
                value: unstakeAmountHuman ?? "0",
                symbol: "GIGAHDX",
              }),
            }
        : {
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
