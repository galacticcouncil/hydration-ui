import { useCallback } from "react"
import { useTranslation } from "react-i18next"

import { FillOrderFormValues } from "@/modules/trade/otc/fill-order/fillOrderSchema"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useToasts } from "@/states/toasts"

type Args = {
  readonly onSubmit: () => void
}

export const useSubmitFillOrder = ({ onSubmit }: Args) => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { successToast, unknownToast } = useToasts()

  return useCallback(
    async (form: FillOrderFormValues, offer: OtcOfferTabular) => {
      (await offer.isPartiallyFillable)
        ? api.tx.otc.partialFillOrder(offer.id, form.buyAmount)
        : api.tx.otc.fillOrder(offer.id)
    },
    [t, api, onSubmit, successToast, unknownToast],
  )
}
