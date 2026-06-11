import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { accountUnlockClassesQuery } from "@/api/democracy"
import { gigaQueryKey } from "@/api/gigaStake"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

type ClaimAndCompoundArgs = {
  allocReadyVotes: ReadonlyArray<{ refIndex: number; trackId: number | null }>
  accountAddress: string
  hasAccruedYield: boolean
  hasClaimableRewards: boolean
  unstakeGigahdxAmount?: bigint
  unstakeAmountHuman?: string
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

      const unlockClasses = await rpc.queryClient.ensureQueryData(
        accountUnlockClassesQuery(rpc, accountAddress),
      )

      const calls = [
        ...allocReadyVotes.map(
          ({ refIndex, trackId }) =>
            rpc.papi.tx.ConvictionVoting.remove_vote({
              class: trackId ?? undefined,
              index: refIndex,
            }).decodedCall,
        ),
        ...(accountAddress && unlockClasses
          ? unlockClasses.map(
              (classId) =>
                rpc.papi.tx.ConvictionVoting.unlock({
                  target: accountAddress,
                  class: classId,
                }).decodedCall,
            )
          : []),

        hasAccruedYield
          ? unsafeApi.tx.GigaHdx.realize_yield().decodedCall
          : null,

        hasClaimableRewards
          ? unsafeApi.tx.GigaHdxRewards.claim_rewards().decodedCall
          : null,

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
        ],
        toasts,
      })
    },
  })
}
