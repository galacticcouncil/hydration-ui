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
import {
  claimableVotingRewardsQuery,
  gigaAccountStakesQuery,
  gigaQueryKey,
  gigaTotalLockedQuery,
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
  // Two-tier freeze breakdown — needed to decide how much is unstakeable
  // and whether to route the submit through the combined unlock+unstake
  // batch or just a plain `giga_unstake`.
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

  // Freeze breakdown:
  //   - `ongoingLockedHdx`  → votes on still-running referenda; can't be
  //     unstaked without abandoning the vote. Show as a warning, exclude
  //     from MAX.
  //   - `unfreezableHdx`    → votes on completed referenda; auto-released
  //     by the combined batch (`remove_vote × N + giga_unstake`). Include
  //     in MAX — when the user enters more than the runtime currently
  //     allows, we route through the combined batch instead of a plain
  //     unstake.
  const ongoingLockedHdxPlanck = claimableRewards?.ongoingLockedHdx ?? 0n
  // Total HDX that `claim_rewards` will drain into auto-staked GIGAHDX
  // inside the combined batch — sum of already-pending and allocations
  // about to be credited by `remove_vote`. Used to (a) silently bump
  // the chain-side unstake amount when the user submits at MAX, so the
  // freshly auto-staked shares get unstaked too (clean exit), and
  // (b) drive the "...claimed N HDX rewards" suffix in the toast.
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
  // `frozenInGigaHdx` retained for back-compat with the alert UI — but
  // now represents only the permanently-locked portion (ongoing votes),
  // which is what the alert text was always meant to communicate.
  const frozenInGigaHdx = ongoingLockedInGigaHdx
  // MAX with frozen — only the ongoing portion limits us, completed-ref
  // freeze gets cleaned up in the combined batch. Defensive clamp at 0
  // for the runtime-invariant-violation case (frozen > hdx).
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
      z.object({
        amount: positive.refine((value) => Big(value || "0").lte(maxUnstake), {
          error: t("error.maxBalance"),
        }),
        asset: z.custom<TAssetData>(),
      }),
    ),
  })

  const amount = form.watch("amount") || "0"

  const amountInHdx = exchangeRate
    ? Big(amount).mul(exchangeRate.toString()).toString()
    : undefined

  const mutation = useMutation({
    mutationFn: async (amount: string) => {
      if (!account) throw new Error("No account connected")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const stakeTx = unsafeApi.tx.GigaHdx.giga_unstake({
        gigahdx_amount: toBigInt(amount, meta.decimals),
      })

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
          tx: stakeTx,
          invalidateQueries: [
            userGigaBorrowSummaryQueryKey(account.address),
            gigaQueryKey(account.address),
            gigaTotalLockedQuery(rpc).queryKey,
          ],
          toasts,
        },
        { onSuccess: () => form.reset() },
      )
    },
  })

  // `Stakes.gigahdx × rate > Stakes.hdx` means there's passive yield that
  // hasn't been folded into `Stakes.hdx` yet — `realize_yield` will do it.
  const accruedYieldExists = Big(suppliedHdx)
    .mul(exchangeRate?.toString() || "0")
    .gt(
      gigaAccountStakes
        ? scaleHuman(gigaAccountStakes.hdx, meta.decimals)
        : "0",
    )

  const hasAllocReadyVotes =
    (claimableRewards?.allocReadyVotes.length ?? 0) > 0
  const hasPendingRewards = (claimableRewards?.pendingHdx ?? 0n) > 0n

  /**
   * Decide whether to route the submit through the combined claim+unstake
   * batch, or just `giga_unstake` alone.
   *
   * Use the batch whenever there's anything worth bundling alongside the
   * unstake — so the user signs once for "unstake + claim everything I'm
   * entitled to":
   *
   *   - completed-ref votes (`allocReadyVotes`) → `remove_vote` releases
   *     `Stakes.frozen` AND credits the user's reward share into
   *     `PendingRewards`. Required when `unfreezableHdx > 0`; harmless
   *     otherwise.
   *   - pending rewards (`pendingHdx > 0`) → `claim_rewards` drains them
   *     into auto-staked GIGAHDX.
   *   - accrued passive yield → `realize_yield` folds it into `Stakes.hdx`.
   *
   * If none of these apply, plain `giga_unstake` is enough.
   */
  const useCombinedBatch =
    hasAllocReadyVotes || hasPendingRewards || accruedYieldExists

  const onSubmit = form.handleSubmit((values) => {
    if (!account) return
    if (useCombinedBatch && claimableRewards) {
      // When the user submits at MAX, `claim_rewards` inside the batch
      // will auto-stake `totalClaimableHdx` worth of GIGAHDX into the
      // position right before `giga_unstake` runs. Without compensating,
      // those fresh shares would be left as a residual. Bumping the
      // chain-side amount by the equivalent so the unstake clears them
      // too — the displayed MAX stays unchanged (matches the form input
      // the user actually saw); the toast suffix carries the receipt.
      const submittingAtMax =
        totalClaimableInGigaHdx.gt(0) &&
        Big(values.amount || "0").gte(maxUnstake)
      const chainAmountHuman = submittingAtMax
        ? Big(values.amount).plus(totalClaimableInGigaHdx).toString()
        : values.amount

      const willClaimRewards = totalClaimableHdxPlanck > 0n

      claimMutation.mutate(
        {
          allocReadyVotes: claimableRewards.allocReadyVotes,
          unlockClasses: claimableRewards.unlockClasses,
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
    frozenInGigaHdx,
    onSubmit,
  }
}
