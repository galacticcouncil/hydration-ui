import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { zodResolver } from "@hookform/resolvers/zod"
import { FC } from "react"
import { FormProvider, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { PlaceOrderAssetField } from "@/modules/trade/otc/place-order/PlaceOrderAssetField"
import {
  PlaceOrderFormValues,
  placeOrderSchema,
} from "@/modules/trade/otc/place-order/placeOrderSchema"

export const PlaceOrderModalContent: FC = () => {
  const { t } = useTranslation(["trade", "common"])
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
        title={t("otc.placeOrder.title")}
        description={t("otc.placeOrder.description")}
      />
      <ModalBody>
        <FormProvider {...form}>
          <PlaceOrderAssetField
            label={t("common:offer")}
            maxBalance="1024436"
            assetIdFieldName="offerAssetId"
            assetAmountFieldName="offerAmount"
          />
          <PlaceOrderAssetField
            label={t("common:buy")}
            maxBalance="1024436"
            assetIdFieldName="buyAssetId"
            assetAmountFieldName="buyAmount"
          />
        </FormProvider>
      </ModalBody>
    </>
  )
}
