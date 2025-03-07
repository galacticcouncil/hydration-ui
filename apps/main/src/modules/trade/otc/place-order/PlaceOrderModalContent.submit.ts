import { useQueryClient } from "@tanstack/react-query"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { otcOffersQueryKey } from "@/modules/trade/otc/table/OtcTable.query"
import { TAsset } from "@/providers/assetsProvider"
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

  return useCallback(
    async (
      {
        offerAssetId,
        offerAmount,
        buyAssetId,
        buyAmount,
        isPartiallyFillable,
      }: PlaceOrderFormValues,
      offerAsset: TAsset | undefined,
      buyAsset: TAsset | undefined,
    ) => {
      if (!buyAsset || !offerAsset) {
        return
      }

      createTransaction({
        tx: papi.tx.OTC.place_order({
          amount_in: scale(buyAmount, buyAsset.decimals),
          amount_out: scale(offerAmount, offerAsset.decimals),
          asset_in: Number(buyAssetId),
          asset_out: Number(offerAssetId),
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
      }).then(() => client.invalidateQueries({ queryKey: otcOffersQueryKey }))

      onSubmit()
    },
    [client, papi, t, createTransaction, onSubmit],
  )
}
