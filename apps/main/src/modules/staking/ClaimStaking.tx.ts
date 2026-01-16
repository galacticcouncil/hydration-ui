import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { useInvalidateStakeData } from "@/api/staking"
import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { NewVoteId, useProcessedVotes } from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"

export const useClaimStaking = (
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
) => {
  const { t } = useTranslation(["common", "staking"])

  const { native } = useAssets()
  const { papi } = useRpcProvider()

  const { data: staking } = useStakingRewards()
  const createBatch = useCreateBatchTx()

  const { newProcessedVotesIds, oldProcessedVotesIds } = useProcessedVotes(
    votes,
    votesSuccess,
  )

  const invalidateStakeData = useInvalidateStakeData()

  return useMutation({
    mutationFn: async () => {
      const txs = getClaimStakingTx(
        papi,
        positionId,
        newProcessedVotesIds,
        oldProcessedVotesIds,
      )

      const toasts = {
        submitted: t("staking:claim.toasts.onLoading", {
          value: staking?.rewards || "0",
          symbol: native.symbol,
        }),
        success: t("staking:claim.toasts.onSuccess", {
          value: staking?.rewards || "0",
          symbol: native.symbol,
        }),
      }

      await createBatch({
        txs: txs,
        transaction: { toasts },
      })

      await invalidateStakeData.mutateAsync()
    },
  })
}

export const getClaimStakingTx = (
  papi: Papi,
  positionId: bigint,
  newProcessedVotesIds: ReadonlyArray<NewVoteId>,
  oldProcessedVotesIds: ReadonlyArray<number>,
) => {
  const claimTx = papi.tx.Staking.claim({ position_id: positionId })

  if (!newProcessedVotesIds.length && !oldProcessedVotesIds.length) {
    return [claimTx]
  }

  return [
    ...oldProcessedVotesIds.map((id) =>
      papi.tx.Democracy.remove_vote({ index: id }),
    ),
    ...newProcessedVotesIds.map(({ classId, id }) =>
      papi.tx.ConvictionVoting.remove_vote({ class: classId, index: id }),
    ),
    claimTx,
  ]
}
