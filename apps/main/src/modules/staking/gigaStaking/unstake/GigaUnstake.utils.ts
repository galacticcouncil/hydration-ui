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
  gigaAccountStakesQuery,
  gigaQueryKey,
  gigaTotalLockedQuery,
  useGigaStakeExchangeRate,
} from "@/api/gigaStake"
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

  // Frozen-bound unstake cap — must mirror the runtime's check exactly:
  //   pallet-gigahdx::do_unstake enforces `stake.hdx - payout >= stake.frozen`
  //   where payout = gigahdx_amount × current_rate (floor-rounded).
  //
  // Rearranged:  max_gigahdx = (stake.hdx − stake.frozen) / current_rate
  //
  // Earlier we used `userGhdx − stake.frozen/rate`, but `userGhdx` (= the
  // aToken balance) drifts from `stake.hdx / rate` as accrued yield builds
  // up — leading the UI to allow an amount the runtime would reject with
  // `StakeFrozen`. Use the runtime's exact quantities + a 1 µHDX safety
  // margin to absorb floor-rounding mismatches between Big.js and the
  // integer-math `multiply_by_rational_with_rounding`.
  const stakeHdxHuman = gigaAccountStakes
    ? scaleHuman(gigaAccountStakes.hdx, meta.decimals)
    : "0"
  const frozen = gigaAccountStakes?.frozen ?? 0n
  const frozenHuman = scaleHuman(frozen, meta.decimals)
  const unstakeablePrincipalHdx = Big.max(
    Big(stakeHdxHuman).minus(frozenHuman),
    Big(0),
  )
  const SAFETY_DUST_HDX = Big("0.000001") // 1 µHDX
  const maxUnstakeWithFrozen =
    exchangeRate && exchangeRate.gt(0)
      ? Big.max(
          unstakeablePrincipalHdx
            .minus(SAFETY_DUST_HDX)
            .div(exchangeRate.toString()),
          Big(0),
        )
      : suppliedHdx
  // Backwards-compat alias for any consumer expecting GHDX-equivalent of
  // the rewards-pallet freeze — used by the existing alert text.
  const frozenInGigaHdx = exchangeRate
    ? Big(frozenHuman).div(exchangeRate.toString()).toString()
    : "0"

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

  const onSubmit = form.handleSubmit((values) => {
    mutation.mutate(values.amount)
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
