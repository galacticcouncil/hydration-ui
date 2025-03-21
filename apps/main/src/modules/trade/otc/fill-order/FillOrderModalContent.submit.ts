import { useMutation, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { FillOrderFormValues } from "@/modules/trade/otc/fill-order/FillOrderModalContent.form"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { otcOffersQueryKey } from "@/modules/trade/otc/table/OtcTable.query"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

const FULL_ORDER_PCT_LBOUND = 99

type Args = {
  readonly otcOffer: OtcOfferTabular
  readonly onSubmit: () => void
}

export const useSubmitFillOrder = ({ otcOffer, onSubmit }: Args) => {
  const { t } = useTranslation("trade")
  const { papi } = useRpcProvider()
  const client = useQueryClient()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async (form: FillOrderFormValues): Promise<void> => {
      const filledPct = new Big(form.sellAmount)
        .div(otcOffer.assetAmountIn)
        .mul(100)
        .toNumber()

      const tx =
        otcOffer.isPartiallyFillable && filledPct <= FULL_ORDER_PCT_LBOUND
          ? papi.tx.OTC.partial_fill_order({
              order_id: Number(otcOffer.id),
              amount_in: scale(form.sellAmount, otcOffer.assetIn.decimals),
            })
          : papi.tx.OTC.fill_order({
              order_id: Number(otcOffer.id),
            })

      onSubmit()
      await createTransaction({
        tx,
        toasts: {
          submitted: t("otc.fillOrder.loading", {
            symbol: otcOffer.assetOut.symbol,
            amount: otcOffer.assetAmountOut,
          }),
          success: t("otc.fillOrder.success", {
            symbol: otcOffer.assetOut.symbol,
            amount: otcOffer.assetAmountOut,
          }),
          error: t("otc.fillOrder.error", {
            symbol: otcOffer.assetOut.symbol,
            amount: otcOffer.assetAmountOut,
          }),
        },
      })
    },
    onSuccess: () => client.invalidateQueries({ queryKey: otcOffersQueryKey }),
  })
}
