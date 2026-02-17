import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { HDXSupplyQueryKey, useInvalidateStakeData } from "@/api/staking"
import {
  usePendingVotes,
  useProcessedVotes,
} from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useUnstake = (
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
) => {
  const { t } = useTranslation(["common", "staking"])

  const rpc = useRpcProvider()
  const { papi } = rpc
  const { native } = useAssets()
  const createBatch = useCreateBatchTx()

  const { newPendingVotesIds, oldPendingVotesIds } = usePendingVotes(
    positionId,
    votes,
    votesSuccess,
  )

  const { newProcessedVotesIds, oldProcessedVotesIds } = useProcessedVotes(
    votes,
    votesSuccess,
  )

  const invalidateStakeData = useInvalidateStakeData()

  return useMutation({
    mutationFn: async (amount: string) => {
      const isStakePosition = positionId !== 0n

      if (!isStakePosition) {
        return
      }

      const oldVotes = [...oldPendingVotesIds, ...oldProcessedVotesIds]
      const newVotes = [...newPendingVotesIds, ...newProcessedVotesIds]

      const txs = (() => {
        const unstakeTx = papi.tx.Staking.unstake({ position_id: positionId })

        if (!oldVotes.length && !newVotes.length) {
          return [unstakeTx]
        }

        return [
          ...oldVotes.map((id) => papi.tx.Democracy.remove_vote({ index: id })),
          ...newVotes.map(({ classId, id }) =>
            papi.tx.ConvictionVoting.remove_vote({ class: classId, index: id }),
          ),
          unstakeTx,
        ]
      })()

      const toasts = {
        submitted: t("staking:stake.unstake.toasts.onLoading", {
          value: amount,
          symbol: native.symbol,
        }),
        success: t("staking:stake.unstake.toasts.onSuccess", {
          value: amount,
          symbol: native.symbol,
        }),
      }

      await createBatch({
        txs,
        transaction: {
          toasts,
          invalidateQueries: [HDXSupplyQueryKey],
        },
      })

      await invalidateStakeData.mutateAsync()
    },
  })
}
