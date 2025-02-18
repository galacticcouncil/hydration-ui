import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { zodResolver } from "@hookform/resolvers/zod"
import { t } from "i18next"
import { FC } from "react"
import { FormProvider, useForm } from "react-hook-form"

import { PlaceOrderAssetField } from "@/modules/trade/otc/place-order/PlaceOrderAssetField"
import {
  PlaceOrderFormValues,
  placeOrderSchema,
} from "@/modules/trade/otc/place-order/placeOrderSchema"

export const PlaceOrderModalContent: FC = () => {
  const defaultValues: PlaceOrderFormValues = {
    offerAssetId: "",
    offerAmount: "",
    buyAssetId: "",
    buyAmount: "",
  }

  const form = useForm<PlaceOrderFormValues>({
    defaultValues,
    resolver: zodResolver(placeOrderSchema),
  })

  return (
    <>
      <ModalHeader
        title={t("trade.otc.placeOrder.title")}
        description={t("trade.otc.placeOrder.description")}
      />
      <ModalBody>
        <FormProvider {...form}>
          <PlaceOrderAssetField
            label={t("offer")}
            maxBalance="1024436"
            assetIdFieldName="offerAssetId"
            assetAmountFieldName="offerAmount"
          />
          <PlaceOrderAssetField
            label={t("buy")}
            maxBalance="1024436"
            assetIdFieldName="buyAssetId"
            assetAmountFieldName="buyAmount"
          />
        </FormProvider>
      </ModalBody>
    </>
  )
}
