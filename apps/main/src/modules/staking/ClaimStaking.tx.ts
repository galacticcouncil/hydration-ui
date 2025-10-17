import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { AccountUniquesQueryKey } from "@/api/account"
import { TAccountVote } from "@/api/democracy"
import { useInvalidateStakeData } from "@/api/staking"
import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { useProcessedVotes } from "@/modules/staking/Stake.data"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useClaimStaking = (
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
) => {
  const { t } = useTranslation(["common", "staking"])
  const queryClient = useQueryClient()

  const { account } = useAccount()
  const address = account?.address

  const { native } = useAssets()
  const { papi } = useRpcProvider()
  const { createTransaction } = useTransactionsStore()

  const { data: staking } = useStakingRewards()
  const formattedReward = t("currency", {
    value: staking?.rewards || "0",
    symbol: native.symbol,
  })

  const { newProcessedVotesIds, oldProcessedVotesIds } = useProcessedVotes(
    votes,
    votesSuccess,
  )

  const invalidateStakeData = useInvalidateStakeData()

  return useMutation({
    mutationFn: async () => {
      const tx = (() => {
        const claimTx = papi.tx.Staking.claim({ position_id: positionId })

        if (!newProcessedVotesIds.length && !oldProcessedVotesIds.length) {
          return claimTx
        }

        return papi.tx.Utility.batch_all({
          calls: [
            ...oldProcessedVotesIds.map(
              (id) => papi.tx.Democracy.remove_vote({ index: id }).decodedCall,
            ),
            ...newProcessedVotesIds.map(
              ({ classId, id }) =>
                papi.tx.ConvictionVoting.remove_vote({
                  class: classId,
                  index: id,
                }).decodedCall,
            ),
            claimTx.decodedCall,
          ],
        })
      })()

      await createTransaction({
        tx,
        toasts: {
          submitted: t("staking:claim.toasts.onLoading", {
            amount: formattedReward,
          }),
          success: t("staking:claim.toasts.onSuccess", {
            amount: formattedReward,
          }),
        },
      })

      await Promise.all([
        invalidateStakeData.mutateAsync(),
        queryClient.invalidateQueries({
          queryKey: AccountUniquesQueryKey(address),
        }),
      ])
    },
  })
}
