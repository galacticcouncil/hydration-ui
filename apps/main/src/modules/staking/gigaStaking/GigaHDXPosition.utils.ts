import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { gigaQueryKey, gigaTotalLockedQuery } from "@/api/gigaStake"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

type ClaimAndCompoundArgs = {
  allocReadyVotes: ReadonlyArray<{ refIndex: number; trackId: number | null }>
  unlockClasses: ReadonlyArray<number>
  accountAddress: string
  hasAccruedYield: boolean
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
        ...allocReadyVotes.map(
          ({ refIndex, trackId }) =>
            rpc.papi.tx.ConvictionVoting.remove_vote({
              class: trackId ?? undefined,
              index: refIndex,
            }).decodedCall,
        ),
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

      const hasClaimedRewards = Big(claimedRewardsHdxHuman || "0").gt(0)

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
