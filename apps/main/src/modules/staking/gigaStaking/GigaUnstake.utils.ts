import { HDX_ERC20_ASSET_ID } from "@galacticcouncil/money-market/ui-config"
import { useAccount } from "@galacticcouncil/web3-connect"
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { z } from "zod/v4"

import { TAssetData } from "@/api/assets"
import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { GigaUnstakeProps } from "@/modules/staking/gigaStaking/GigaUnstake"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { toBigInt } from "@/utils/formatting"
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

  const hdxReserve = userBorrowSummary.hdxReserve
  const borrowableHollar = userBorrowSummary.borrowableHollar

  const suppliedHdx = Big(hdxReserve.underlyingBalance)
  const availableBorrowUsd = Big(borrowableHollar)
  const currentLoanToValue = Big(
    userBorrowSummary.userSummary.currentLoanToValue,
  )

  const hdxPriceUsd = Big(hdxReserve.reserve.priceInUSD)
  const debtConstrainedMaxUnstake =
    currentLoanToValue.gt(0) && hdxPriceUsd.gt(0)
      ? availableBorrowUsd.div(currentLoanToValue).div(hdxPriceUsd)
      : suppliedHdx
  const maxUnstake = Big.min(suppliedHdx, debtConstrainedMaxUnstake).toString()

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
          invalidateQueries: [userGigaBorrowSummaryQueryKey(account.address)],
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
    onSubmit,
  }
}
