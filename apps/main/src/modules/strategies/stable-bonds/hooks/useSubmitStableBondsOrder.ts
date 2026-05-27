import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import type { StableBondsFormValues } from "@/modules/strategies/stable-bonds/components/StableBondsDeposit.form"
import { getOtcFillOrderTx } from "@/modules/trade/otc/fill-order/FillOrderModalContent.submit"
import { type OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

type SubmitStableBondsOrderArgs = {
  values: StableBondsFormValues
  order: OtcOffer
  receiveAmount: string
}

export const useSubmitStableBondsOrder = () => {
  const { t } = useTranslation(["trade", "common"])
  const { papi } = useRpcProvider()
  const { isErc20AToken } = useAssets()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      values,
      order,
      receiveAmount,
    }: SubmitStableBondsOrderArgs) => {
      const formattedAmount = t("common:currency", {
        value: receiveAmount,
        symbol: order.assetOut.symbol,
      })

      const tx = getOtcFillOrderTx(papi, order, values.depositAmount)

      const hasAToken =
        isErc20AToken(order.assetIn) || isErc20AToken(order.assetOut)

      return createTransaction({
        withExtraGas: hasAToken,
        tx,
        toasts: {
          submitted: t("otc.fillOrder.loading", {
            amount: formattedAmount,
          }),
          success: t("otc.fillOrder.success", {
            amount: formattedAmount,
          }),
          error: t("otc.fillOrder.error", {
            amount: formattedAmount,
          }),
        },
      })
    },
  })
}
