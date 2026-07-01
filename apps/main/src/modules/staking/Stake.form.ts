import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { refine, z } from "zod/v4"

import { stakingConstsQuery } from "@/api/constants"
import { TAccountVote } from "@/api/democracy"
import { gigaAccountStakesQuery } from "@/api/gigaStake"
import { HDXSupplyQueryKey, useInvalidateStakeData } from "@/api/staking"
import i18n from "@/i18n"
import { useProcessedVotes } from "@/modules/staking/Stake.data"
import { useCreateBatchTx } from "@/modules/transactions/hooks/useBatchTx"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale, scaleHuman, toBigInt, toDecimal } from "@/utils/formatting"
import { positive, required, validateFieldMaxBalance } from "@/utils/validators"

const MIN_INCREASE_PERCENTAGE = 1

const getSchema = (balance: string, minStake: string, nativeSymbol: string) =>
  z.object({
    amount: required
      .pipe(positive)
      .check(
        refine<string>((value) => Big(value || "0").gte(minStake), {
          error: i18n.t("staking:stake.stake.minStakeError", {
            amount: i18n.t("currency", {
              value: minStake,
              symbol: nativeSymbol,
            }),
          }),
        }),
      )
      .check(validateFieldMaxBalance(balance)),
  })

export type StakeFormValues = z.infer<ReturnType<typeof getSchema>>

export const useStake = (
  balance: string,
  stakedBalance: string,
  positionId: bigint,
  votes: ReadonlyArray<TAccountVote>,
  votesSuccess: boolean,
) => {
  const { t } = useTranslation(["common", "staking"])
  const rpc = useRpcProvider()
  const { papi } = rpc
  const { native } = useAssets()
  const { account } = useAccount()
  const createBatch = useCreateBatchTx()

  const { data: stakingConsts, isLoading: minStakeLoading } = useQuery(
    stakingConstsQuery(rpc),
  )
  const { data: gigaStakes } = useQuery(
    gigaAccountStakesQuery(rpc, account?.address ?? ""),
  )
  const hasGigaStakes = !!gigaStakes

  const { newProcessedVotesIds, oldProcessedVotesIds } = useProcessedVotes(
    votes,
    votesSuccess,
  )

  const stakeTx = papi.tx.Utility.batch_all({
    calls: [
      ...oldProcessedVotesIds.map(
        (id) => papi.tx.Democracy.remove_vote({ index: id }).decodedCall,
      ),
      ...newProcessedVotesIds.map(
        ({ classId, id }) =>
          papi.tx.ConvictionVoting.remove_vote({ class: classId, index: id })
            .decodedCall,
      ),
      papi.tx.Staking.stake({
        amount: BigInt(scale(balance, native.decimals)),
      }).decodedCall,
    ],
  })

  const { data: fee } = useEstimateFee(stakeTx)

  const maxBalanceHuman =
    fee && fee.feeAssetId === native.id
      ? Big.max(
          0,
          Big(balance)
            .minus(fee.feeEstimate)
            .minus(scaleHuman(native.existentialDeposit, native.decimals)),
        ).toString()
      : balance

  const defaultValues: StakeFormValues = {
    amount: "",
  }

  const minIncreaseStakePosition = Big(stakedBalance)
    .times(MIN_INCREASE_PERCENTAGE)
    .div(100)
    .toString()

  const minStakeUsed = Big.max(
    minIncreaseStakePosition,
    toDecimal(stakingConsts?.minStake ?? 0n, native.decimals),
  ).toString()

  const form = useForm<StakeFormValues>({
    defaultValues,
    resolver: standardSchemaResolver(
      getSchema(maxBalanceHuman, minStakeUsed, native.symbol),
    ),
    disabled: minStakeLoading,
    mode: "onChange",
  })

  const getMessage = (amount: string, type: "onLoading" | "onSuccess") =>
    t(
      `staking:stake.${positionId === 0n ? "stake" : "increaseStake"}.toasts.${type}`,
      {
        amount,
      },
    )

  const invalidateStakeData = useInvalidateStakeData()

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      const isStakePosition = positionId !== 0n

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
          onSuccess: () => form.reset(),
        },
      })

      await invalidateStakeData.mutateAsync()
    },
  })

  return {
    mutation,
    maxBalanceHuman,
    minStake: minStakeUsed,
    form,
    hasGigaStakes,
  }
}
