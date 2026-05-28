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

      return createTransaction({
        withExtraGas: hasAToken,
        tx,
        toasts: {
          submitted: t("bonds.deposit.toast.submitted", {
            amount: receiveAmount,
            symbol: order.assetIn.symbol,
            bond: order.assetOut.symbol,
          }),
          success: t("bonds.deposit.toast.success", {
            amount: receiveAmount,
            symbol: order.assetIn.symbol,
            bond: order.assetOut.symbol,
          }),
        },
      })
    },
  })
}
