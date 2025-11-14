import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

type Args = {
  readonly onSubmit: () => void
}

export const useSubmitPlaceOrder = ({ onSubmit }: Args) => {
  const { t } = useTranslation(["trade", "common"])
  const { papi } = useRpcProvider()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      offerAsset,
      offerAmount,
      buyAsset,
      buyAmount,
      isPartiallyFillable,
    }: PlaceOrderFormValues) => {
      if (!buyAsset || !offerAsset) {
        return
      }

      const formattedAmount = t("common:currency", {
        value: offerAmount,
        symbol: offerAsset.symbol,
      })

      onSubmit()
      await createTransaction({
        tx: papi.tx.OTC.place_order({
          amount_in: BigInt(scale(buyAmount, buyAsset.decimals)),
          amount_out: BigInt(scale(offerAmount, offerAsset.decimals)),
          asset_in: Number(buyAsset.id),
          asset_out: Number(offerAsset.id),
          partially_fillable: isPartiallyFillable,
        }),
        toasts: {
          submitted: t("otc.placeOrder.loading", {
            amount: formattedAmount,
          }),
          success: t("otc.placeOrder.success", {
            amount: formattedAmount,
          }),
          error: t("otc.placeOrder.error", {
            amount: formattedAmount,
          }),
        },
      })
    },
  })
}
