import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/placeOrderSchema"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useToasts } from "@/states/toasts"

type Args = {
  readonly onSubmit: () => void
}

export const useSubmitPlaceOrder = ({ onSubmit }: Args) => {
  const { t } = useTranslation("trade")
  const { api } = useRpcProvider()
  const { successToast, unknownToast } = useToasts()

  return useCallback(
    ({
      offerAssetId,
      offerAmount,
      buyAssetId,
      buyAmount,
      isPartiallyFillable,
    }: PlaceOrderFormValues) => {
      api.tx.otc.placeOrder(
        buyAssetId,
        offerAssetId,
        buyAmount,
        offerAmount,
        isPartiallyFillable,
      ),
        unknownToast({ title: t("otc.placeOrder.loading") })
      successToast({ title: t("otc.placeOrder.success") })
    },
    [api, t, successToast, unknownToast],
  )
}
