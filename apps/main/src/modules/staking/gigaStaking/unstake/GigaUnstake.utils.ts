import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { TAssetData } from "@/api/assets"
import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { accountUnlockClassesQuery } from "@/api/democracy"
import {
  claimableVotingRewardsQuery,
  gigaAccountStakesQuery,
  gigaQueryKey,
  gigaStakeConstantsQuery,
  gigaUnstakePositionsQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
import { useClaimAndCompound } from "@/modules/staking/gigaStaking/GigaHDXPosition.utils"
import { GigaUnstakeProps } from "@/modules/staking/gigaStaking/unstake/GigaUnstake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman, toBigInt } from "@/utils/formatting"
import { positive } from "@/utils/validators"

export type GigaUnstakeFormValues = {
  amount: string
  asset: TAssetData
}

export const useGigaUnstake = ({ userBorrowSummary }: GigaUnstakeProps) => {
  const { getAssetWithFallback } = useAssets()
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const { t } = useTranslation(["common", "staking"])
  const meta = getAssetWithFallback(HDX_ERC20_ASSET_ID)
  const { data: exchangeRate } = useGigaStakeExchangeRate()
  const { data: gigaAccountStakes } = useQuery(
    gigaAccountStakesQuery(rpc, account?.address ?? ""),
  )

  const { data: pendingPositions = [] } = useQuery(
    gigaUnstakePositionsQuery(rpc, account?.address ?? ""),
  )
  const { data: gigaStakeConstants } = useQuery(gigaStakeConstantsQuery(rpc))
  const maxPendingUnstakes = gigaStakeConstants?.maxPendingUnstakes ?? 0

  const { data: claimableRewards } = useQuery(
    claimableVotingRewardsQuery(rpc, account?.address ?? ""),
  )
  const claimMutation = useClaimAndCompound()

  const { hdxReserve, hollarReserve, borrowableHollar, userSummary } =
    userBorrowSummary

  const suppliedHdx = Big(hdxReserve.underlyingBalance)
  const availableBorrowUsd = Big(borrowableHollar)
  const currentLoanToValue = Big(userSummary.currentLoanToValue)

  const hdxPriceUsd = Big(hdxReserve.reserve.priceInUSD)
  const debtConstrainedMaxUnstake =
    currentLoanToValue.gt(0) &&
    hdxPriceUsd.gt(0) &&
    Big(hollarReserve.totalBorrows).gt(0)
      ? availableBorrowUsd.div(currentLoanToValue).div(hdxPriceUsd)
      : suppliedHdx
  const debtLockedInGigaHdx = Big.max(
    suppliedHdx.minus(debtConstrainedMaxUnstake),
    Big(0),
  ).toString()

  const ongoingLockedHdxPlanck = claimableRewards?.ongoingLockedHdx ?? 0n

  const pendingHdxPlanck = claimableRewards?.pendingHdx ?? 0n
  const allocReadyHdxPlanck = claimableRewards?.allocReadyHdx ?? 0n
  const totalClaimableHdxPlanck = pendingHdxPlanck + allocReadyHdxPlanck
  const totalClaimableHdxHuman = scaleHuman(
    totalClaimableHdxPlanck,
    meta.decimals,
  )
  const totalClaimableInGigaHdx = exchangeRate
    ? Big(totalClaimableHdxHuman).div(exchangeRate.toString())
    : Big(0)
  const ongoingLockedHdxHuman = scaleHuman(
    ongoingLockedHdxPlanck,
    meta.decimals,
  )
  const ongoingLockedInGigaHdx = exchangeRate
    ? Big(ongoingLockedHdxHuman).div(exchangeRate.toString()).toString()
    : "0"
  const frozenInGigaHdx = ongoingLockedInGigaHdx
  const maxUnstakeWithFrozen = Big.max(
    suppliedHdx.minus(ongoingLockedInGigaHdx),
    Big(0),
  )

  const maxUnstake = Big.min(
    suppliedHdx,
    debtConstrainedMaxUnstake,
    maxUnstakeWithFrozen,
  ).toString()

  const form = useForm<GigaUnstakeFormValues>({
    mode: "onChange",
    defaultValues: {
      amount: "",
      asset: meta,
    },

    resolver: standardSchemaResolver(
      z
        .object({
          amount: positive,
          asset: z.custom<TAssetData>(),
        })
        .check(
          z.refine<GigaUnstakeFormValues>(
            ({ amount }) => Big(amount || "0").lte(maxUnstake),
            {
              error: t("error.maxBalance"),
              path: ["amount"],
            },
          ),
        )
        .check(
          z.refine<GigaUnstakeFormValues>(
            ({ amount }) =>
              amount === "" ||
              !gigaStakeConstants ||
              pendingPositions.length < maxPendingUnstakes,
            {
              error: t(
                "staking:gigaStaking.unstake.error.maxPendingPositions",
                {
                  max: maxPendingUnstakes,
                },
              ),
              path: ["amount"],
            },
          ),
        ),
    ),
  })

  const amount = form.watch("amount") || "0"
  const displayAmount = Big(amount)
    .mul(hdxReserve.reserve.priceInUSD || 1)
    .toString()

  const amountInHdx = exchangeRate
    ? Big(amount).mul(exchangeRate.toString()).toString()
    : undefined

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!account) throw new Error("No account connected")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const unstakeTx = unsafeApi.tx.GigaHdx.giga_unstake({
        gigahdx_amount: toBigInt(amount, meta.decimals),
      })

      const rewards = await rpc.queryClient.ensureQueryData(
        claimableVotingRewardsQuery(rpc, account.address),
      )

      const allocReadyVotes = rewards.allocReadyVotes
      const unlockClasses = await rpc.queryClient.ensureQueryData(
        accountUnlockClassesQuery(rpc, account.address),
      )

      const calls = [
        ...allocReadyVotes.map(
          ({ refIndex, trackId }) =>
            rpc.papi.tx.ConvictionVoting.remove_vote({
              class: trackId ?? undefined,
              index: refIndex,
            }).decodedCall,
        ),
        ...unlockClasses.map(
          (classId) =>
            rpc.papi.tx.ConvictionVoting.unlock({
              target: account.address,
              class: classId,
            }).decodedCall,
        ),
      ]

      const tx =
        calls.length > 0
          ? rpc.papi.tx.Utility.batch_all({
              calls: [...calls, unstakeTx.decodedCall],
            })
          : unstakeTx

      const toasts = {
        submitted: t("staking:gigaStaking.unstake.toasts.submitted", {
          value: amount,
          symbol: meta.symbol,
        }),
        success: t("staking:gigaStaking.unstake.toasts.success", {
          value: amount,
          symbol: meta.symbol,
        }),
      }

      return createTransaction(
        {
          tx,
          invalidateQueries: [
            userGigaBorrowSummaryQueryKey(account.address),
            gigaQueryKey(account.address),
          ],
          toasts,
        },
        { onSuccess: () => form.reset() },
      )
    },
  })

  const accruedYieldExists = Big(suppliedHdx)
    .mul(exchangeRate?.toString() || "0")
    .gt(
      gigaAccountStakes
        ? scaleHuman(gigaAccountStakes.hdx, meta.decimals)
        : "0",
    )

  const hasAllocReadyVotes = (claimableRewards?.allocReadyVotes.length ?? 0) > 0
  const hasPendingRewards = (claimableRewards?.pendingHdx ?? 0n) > 0n

  const useCombinedBatch =
    hasAllocReadyVotes || hasPendingRewards || accruedYieldExists

  const onSubmit = form.handleSubmit((values) => {
    if (!account) throw new Error("No account connected")
    const amount = Big(values.amount || "0")

    if (useCombinedBatch && claimableRewards) {
      const submittingAtMax =
        totalClaimableInGigaHdx.gt(0) && amount.gte(maxUnstake)
      const chainAmountHuman = submittingAtMax
        ? amount.plus(totalClaimableInGigaHdx).toString()
        : amount.toString()

      const willClaimRewards = totalClaimableHdxPlanck > 0n

      claimMutation.mutate(
        {
          allocReadyVotes: claimableRewards.allocReadyVotes,
          accountAddress: account.address,
          hasAccruedYield: accruedYieldExists,
          hasClaimableRewards: willClaimRewards,
          unstakeGigahdxAmount: toBigInt(chainAmountHuman, meta.decimals),
          unstakeAmountHuman: chainAmountHuman,
          claimedRewardsHdxHuman: willClaimRewards
            ? totalClaimableHdxHuman
            : undefined,
        },
        { onSuccess: () => form.reset() },
      )
    } else {
      mutation.mutate(values.amount)
    }
  })

  return {
    form,
    meta,
    maxUnstake,
    amountInHdx,
    displayAmount,
    frozenInGigaHdx,
    debtLockedInGigaHdx,
    onSubmit,
  }
}
