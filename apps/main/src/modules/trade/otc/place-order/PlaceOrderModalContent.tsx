import {
  Box,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useOwnedAssets } from "@/hooks/data/useOwnedAssets"
import { PartiallyFillableToggle } from "@/modules/trade/otc/place-order/PartiallyFillableToggle"
import {
  PlaceOrderFormValues,
  usePlaceOrderForm,
} from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { useSubmitPlaceOrder } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.submit"
import { PlaceOrderPrice } from "@/modules/trade/otc/place-order/PlaceOrderPrice"
import { TradeFee } from "@/modules/trade/otc/TradeFee"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly onClose: () => void
}

export const PlaceOrderModalContent: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation(["trade", "common"])
  const { tradable } = useAssets()

  const ownedAssets = useOwnedAssets()

  const form = usePlaceOrderForm()
  const submit = useSubmitPlaceOrder({ onSubmit: onClose })
  const [offerAsset, offerAmount, buyAsset] = form.watch([
    "offerAsset",
    "offerAmount",
    "buyAsset",
  ])

  const isSubmitEnabled = form.formState.isValid

  return (
    <>
      <ModalHeader
        title={t("otc.placeOrder.title")}
        description={t("otc.placeOrder.description")}
      />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((value) => submit.mutate(value))}>
          <ModalBody sx={{ p: 0 }}>
            <Box px={20}>
              <AssetSelectFormField<PlaceOrderFormValues>
                assetFieldName="offerAsset"
                amountFieldName="offerAmount"
                label={t("common:offer")}
                assets={ownedAssets}
              />
              <ModalContentDivider />
              {offerAsset && buyAsset && (
                <>
                  <PlaceOrderPrice
                    offerAsset={offerAsset}
                    buyAsset={buyAsset}
                  />
                  <ModalContentDivider />
                </>
              )}
              <AssetSelectFormField<PlaceOrderFormValues>
                assetFieldName="buyAsset"
                amountFieldName="buyAmount"
                label={t("common:buy")}
                assets={tradable}
                ignoreBalance
              />
            </Box>
            <Separator />
            <PartiallyFillableToggle />
            <Separator />
            <TradeFee
              assetOut={offerAsset}
              assetAmountOut={offerAmount || "0"}
            />
            <Separator />
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              size="large"
              width="100%"
              disabled={!isSubmitEnabled}
            >
              {t("otc.placeOrder.cta")}
            </Button>
          </ModalFooter>
        </form>
      </FormProvider>
    </>
  )
}
