import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import type { StableBondsFormValues } from "@/modules/strategies/stable-bonds/components/StableBondsDeposit.form"
import { getOtcFillOrderTx } from "@/modules/trade/otc/fill-order/FillOrder.utils"
import { type OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

type SubmitStableBondsOrderArgs = {
  values: StableBondsFormValues
  order: OtcOffer
  receiveAmount: string
}

type SubmitStableBondsOrderOptions = {
  mode?: "deposit" | "rollover"
  onSubmitted?: () => void
}

const TOAST_KEYS = {
  deposit: {
    submitted: "bonds.deposit.toast.submitted",
    success: "bonds.deposit.toast.success",
  },
  rollover: {
    submitted: "bonds.rollover.toast.submitted",
    success: "bonds.rollover.toast.success",
  },
} as const

export const useSubmitStableBondsOrder = ({
  mode = "deposit",
  onSubmitted,
}: SubmitStableBondsOrderOptions = {}) => {
  const { t } = useTranslation(["strategies", "common"])
  const { papi } = useRpcProvider()
  const { isErc20AToken } = useAssets()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      values,
      order,
      receiveAmount,
    }: SubmitStableBondsOrderArgs) => {
      const tx = getOtcFillOrderTx(papi, order, values.depositAmount)

      const hasAToken =
        isErc20AToken(order.assetIn) || isErc20AToken(order.assetOut)

      const toastValues = {
        amount: receiveAmount,
        symbol: order.assetIn.symbol,
        bond: order.assetOut.symbol,
      }

      return createTransaction(
        {
          withExtraGas: hasAToken,
          tx,
          toasts: {
            submitted: t(TOAST_KEYS[mode].submitted, toastValues),
            success: t(TOAST_KEYS[mode].success, toastValues),
          },
        },
        { onSubmitted },
      )
    },
  })
}
