import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
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
    }: ClaimAndCompoundArgs) => {
      const accountAddress = argAccountAddress || account?.address || ""
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

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
