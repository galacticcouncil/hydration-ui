import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import {
  usePendingVotes,
  useProcessedVotes,
} from "@/modules/staking/Stake.data"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useUnstake = (
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
) => {
  const { t } = useTranslation(["common", "staking"])

  const rpc = useRpcProvider()
  const { papi } = rpc

  const { native } = useAssets()
  const { createTransaction } = useTransactionsStore()

  const { newPendingVotesIds, oldPendingVotesIds } = usePendingVotes(
    positionId,
    votes,
    votesSuccess,
  )

  const { newProcessedVotesIds, oldProcessedVotesIds } = useProcessedVotes(
    votes,
    votesSuccess,
  )

  const oldVotes = [...oldPendingVotesIds, ...oldProcessedVotesIds]
  const newVotes = [...newPendingVotesIds, ...newProcessedVotesIds]

  return useMutation({
    mutationFn: async (amount: string) => {
      const isStakePosition = positionId != 0n

      if (!isStakePosition) {
        return
      }

      const formattedAmount = t("currency", {
        value: amount,
        symbol: native.symbol,
      })

      const tx = (() => {
        const unstakeTx = papi.tx.Staking.unstake({ position_id: positionId })

        if (!oldVotes.length && !newVotes.length) {
          return unstakeTx
        }

        return papi.tx.Utility.batch_all({
          calls: [
            ...oldVotes.map(
              (id) => papi.tx.Democracy.remove_vote({ index: id }).decodedCall,
            ),
            ...newVotes.map(
              ({ classId, id }) =>
                papi.tx.ConvictionVoting.remove_vote({
                  class: classId,
                  index: id,
                }).decodedCall,
            ),
            unstakeTx.decodedCall,
          ],
        })
      })()

      await createTransaction({
        tx,
        toasts: {
          submitted: t("staking:stake.unstake.toasts.onLoading", {
            amount: formattedAmount,
          }),
          success: t("staking:stake.unstake.toasts.onSuccess", {
            amount: formattedAmount,
          }),
          error: t("staking:stake.unstake.toasts.onLoading", {
            amount: formattedAmount,
          }),
        },
      })

      // TODO
      //form.reset({ amount: "0" })
      //   await queryClient.invalidateQueries(QUERY_KEYS.stake(account?.address))
      // await queryClient.invalidateQueries(QUERY_KEYS.hdxSupply)
      // refetchAccountAssets()
    },
  })
}
