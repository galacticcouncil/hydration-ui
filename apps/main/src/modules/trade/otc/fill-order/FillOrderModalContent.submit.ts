import { useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { FillOrderFormValues } from "@/modules/trade/otc/fill-order/FillOrderModalContent.form"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { otcOffersQueryKey } from "@/modules/trade/otc/table/OtcTable.query"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

const FULL_ORDER_PCT_LBOUND = 99

type Args = {
  readonly onSubmit: () => void
}

export const useSubmitFillOrder = ({ onSubmit }: Args) => {
  const { t } = useTranslation("trade")
  const { papi } = useRpcProvider()
  const client = useQueryClient()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useCallback(
    async (form: FillOrderFormValues, offer: OtcOfferTabular) => {
      const filledPct = new Big(form.sellAmount)
        .div(offer.assetAmountIn)
        .mul(100)
        .toNumber()

      const tx =
        offer.isPartiallyFillable && filledPct <= FULL_ORDER_PCT_LBOUND
          ? papi.tx.OTC.partial_fill_order({
              order_id: Number(offer.id),
              amount_in: scale(form.sellAmount, offer.assetIn.decimals),
            })
          : papi.tx.OTC.fill_order({
              order_id: Number(offer.id),
            })

      createTransaction({
        tx,
        toasts: {
          submitted: t("otc.fillOrder.loading", {
            symbol: offer.assetOut.symbol,
            amount: offer.assetAmountOut,
          }),
          success: t("otc.fillOrder.success", {
            symbol: offer.assetOut.symbol,
            amount: offer.assetAmountOut,
          }),
          error: t("otc.fillOrder.error", {
            symbol: offer.assetOut.symbol,
            amount: offer.assetAmountOut,
          }),
        },
      }).then(() => client.invalidateQueries({ queryKey: otcOffersQueryKey }))

      onSubmit()
    },
    [client, t, papi, createTransaction, onSubmit],
  )
}
