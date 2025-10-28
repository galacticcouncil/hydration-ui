import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { otcOffersQueryKey } from "@/modules/trade/otc/table/OtcTable.query"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useSubmitCancelOtcOrder = (
  otcOffer: OtcOfferTabular,
  onSubmit: () => void,
) => {
  const { t } = useTranslation(["trade", "common"])
  const { papi } = useRpcProvider()
  const client = useQueryClient()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async (): Promise<void> => {
      const tx = papi.tx.OTC.cancel_order({
        order_id: Number(otcOffer.id),
      })

      const formattedAmount = t("common:currency", {
        value: otcOffer.assetAmountOut,
        symbol: otcOffer.assetOut.symbol,
      })

      onSubmit()
      await createTransaction({
        tx,
        toasts: {
          submitted: t("otc.cancelOrder.loading", {
            amount: formattedAmount,
          }),
          success: t("otc.cancelOrder.success", {
            amount: formattedAmount,
          }),
          error: t("otc.cancelOrder.error", {
            amount: formattedAmount,
          }),
        },
      })
    },
    onSuccess: () => client.invalidateQueries({ queryKey: otcOffersQueryKey }),
  })
}
