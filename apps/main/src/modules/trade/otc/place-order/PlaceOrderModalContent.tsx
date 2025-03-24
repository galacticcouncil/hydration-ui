import {
  Box,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { FC, useMemo } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { PartiallyFillableToggle } from "@/modules/trade/otc/place-order/PartiallyFillableToggle"
import { PlaceOrderAssetField } from "@/modules/trade/otc/place-order/PlaceOrderAssetField"
import { usePlaceOrderForm } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { useSubmitPlaceOrder } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.submit"
import { PlaceOrderPrice } from "@/modules/trade/otc/place-order/PlaceOrderPrice"
import { TradeFee } from "@/modules/trade/otc/TradeFee"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly onClose: () => void
}

// TODO integrate from account assets
const offerAmountBalance = "30"
const buyAmountBalance = "5"

export const PlaceOrderModalContent: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation(["trade", "common"])
  const { all, isExternal } = useAssets()
  const allAssets = useMemo(
    () =>
      all
        .values()
        .filter((asset) => !isExternal(asset) && !!asset.name)
        .toArray(),
    [all, isExternal],
  )

  const form = usePlaceOrderForm(offerAmountBalance)
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
              <PlaceOrderAssetField
                label={t("common:offer")}
                maxBalance={offerAmountBalance}
                assetFieldName="offerAsset"
                assetAmountFieldName="offerAmount"
                assets={allAssets}
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
              <PlaceOrderAssetField
                label={t("common:buy")}
                maxBalance={buyAmountBalance}
                assetFieldName="buyAsset"
                assetAmountFieldName="buyAmount"
                assets={allAssets}
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
