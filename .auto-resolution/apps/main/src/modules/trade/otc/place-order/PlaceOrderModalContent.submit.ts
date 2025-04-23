import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { otcOffersQueryKey } from "@/modules/trade/otc/table/OtcTable.query"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

type Args = {
  readonly onSubmit: () => void
}

export const useSubmitPlaceOrder = ({ onSubmit }: Args) => {
  const { t } = useTranslation("trade")
  const { papi } = useRpcProvider()
  const client = useQueryClient()
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
            symbol: offerAsset.symbol,
            amount: offerAmount,
          }),
          success: t("otc.placeOrder.success", {
            symbol: offerAsset.symbol,
            amount: offerAmount,
          }),
          error: t("otc.placeOrder.success", {
            symbol: offerAsset.symbol,
            amount: offerAmount,
          }),
        },
      })
    },
    onSuccess: () => client.invalidateQueries({ queryKey: otcOffersQueryKey }),
  })
}
