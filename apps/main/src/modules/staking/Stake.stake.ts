import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { AccountUniquesQueryKey } from "@/api/account"
import { TAccountVote } from "@/api/democracy"
import { HDXSupplyQueryKey, useInvalidateStakeData } from "@/api/staking"
import { useProcessedVotes } from "@/modules/staking/Stake.data"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

export const useStake = (
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
  onSuccess: () => void,
) => {
  const { t } = useTranslation(["common", "staking"])
  const queryClient = useQueryClient()

  const { account } = useAccount()
  const address = account?.address

  const rpc = useRpcProvider()
  const { papi } = rpc

  const { native } = useAssets()
  const { createTransaction } = useTransactionsStore()

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

      const rawAmount = scale(amount, native.decimals)

      const tx = (() => {
        if (!isStakePosition) {
          return papi.tx.Staking.stake({ amount: BigInt(rawAmount) })
        }

        const increaseStakeTx = papi.tx.Staking.increase_stake({
          position_id: positionId,
          amount: BigInt(rawAmount),
        })

        if (!newProcessedVotesIds.length && !oldProcessedVotesIds.length) {
          return increaseStakeTx
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
            increaseStakeTx.decodedCall,
          ],
        })
      })()

      await createTransaction({
        tx,
        toasts: {
          submitted: getMessage(formattedAmount, "onLoading"),
          success: getMessage(formattedAmount, "onSuccess"),
        },
      })

      onSuccess()

      await Promise.all([
        invalidateStakeData.mutateAsync(),
        queryClient.invalidateQueries({ queryKey: HDXSupplyQueryKey }),
        queryClient.invalidateQueries({
          queryKey: AccountUniquesQueryKey(address),
        }),
      ])
    },
  })
}
