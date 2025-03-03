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
import { PlaceOrderPrice } from "@/modules/trade/otc/place-order/PlaceOrderPrice"
import { usePlaceOrderForm } from "@/modules/trade/otc/place-order/placeOrderSchema"
import { useSubmitPlaceOrder } from "@/modules/trade/otc/place-order/useSubmitPlaceOrder"
import { TradeFee } from "@/modules/trade/otc/TradeFee"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly onClose: () => void
}

export const PlaceOrderModalContent: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation(["trade", "common"])
  const { getAsset, all } = useAssets()
  const allAssets = useMemo(() => all.values().toArray(), [all])
  // TODO integrate account assets
  const accountAssets = useMemo(() => [], [])

  const form = usePlaceOrderForm()
  const submit = useSubmitPlaceOrder({ onSubmit: onClose })
  const [offerAssetId, offerAmount, buyAssetId] = form.watch([
    "offerAssetId",
    "offerAmount",
    "buyAssetId",
  ])

  const offerAsset = getAsset(offerAssetId)
  const buyAsset = getAsset(buyAssetId)

  // TODO disable when not enough balance in non partial and 0 in partial
  // in asset cant be out, both needs to be selected, balance check, amounts check
  const isSubmitEnabled = form.formState.isValid

  return (
    <>
      <ModalHeader
        title={t("otc.placeOrder.title")}
        description={t("otc.placeOrder.description")}
      />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(submit)}>
          <ModalBody sx={{ p: 0 }}>
            <Box px={20}>
              <PlaceOrderAssetField
                label={t("common:offer")}
                maxBalance="1024436"
                assetIdFieldName="offerAssetId"
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
                maxBalance="1024436"
                assetIdFieldName="buyAssetId"
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
