import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { HDXSupplyQueryKey, useInvalidateStakeData } from "@/api/staking"
import { useProcessedVotes } from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toBigInt } from "@/utils/formatting"

export const useStake = (
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
  onSuccess: () => void,
) => {
  const { t } = useTranslation(["common", "staking"])

  const rpc = useRpcProvider()
  const { papi } = rpc

  const { native } = useAssets()
  const createBatch = useCreateBatchTx()

  const { newProcessedVotesIds, oldProcessedVotesIds } = useProcessedVotes(
    votes,
    votesSuccess,
  )

  const getMessage = (amount: string, type: "onLoading" | "onSuccess") =>
    t(
      `staking:stake.${positionId === 0n ? "stake" : "increaseStake"}.toasts.${type}`,
      {
        amount,
      },
    )

  const invalidateStakeData = useInvalidateStakeData()

  return useMutation({
    mutationFn: async (amount: string) => {
      const isStakePosition = positionId != 0n

      const formattedAmount = t("currency", {
        value: amount,
        symbol: native.symbol,
      })

      const rawAmount = toBigInt(amount, native.decimals)

      const txs = (() => {
        if (!isStakePosition) {
          return [papi.tx.Staking.stake({ amount: rawAmount })]
        }

        const increaseStakeTx = papi.tx.Staking.increase_stake({
          position_id: positionId,
          amount: rawAmount,
        })

        if (!newProcessedVotesIds.length && !oldProcessedVotesIds.length) {
          return [increaseStakeTx]
        }

        return [
          ...oldProcessedVotesIds.map((id) =>
            papi.tx.Democracy.remove_vote({ index: id }),
          ),
          ...newProcessedVotesIds.map(({ classId, id }) =>
            papi.tx.ConvictionVoting.remove_vote({ class: classId, index: id }),
          ),
          increaseStakeTx,
        ]
      })()
      await createBatch({
        txs,
        transaction: {
          toasts: {
            submitted: getMessage(formattedAmount, "onLoading"),
            success: getMessage(formattedAmount, "onSuccess"),
          },
          invalidateQueries: [HDXSupplyQueryKey],
        },
        options: {
          onSuccess,
        },
      })

      await invalidateStakeData.mutateAsync()
    },
  })
}
