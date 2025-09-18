import {
  Box,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
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

  const handleOfferAmountChange = (newOfferAmount: string): void => {
    const formValues = form.getValues()

    const { buyAmount, price } = formValues

    const priceBn = new Big(price || "0")
    const offerAmountBn = new Big(newOfferAmount || "0")
    const buyAmountBn = new Big(buyAmount || "0")

    if (buyAmountBn.gt(0)) {
      form.reset({
        ...formValues,
        price: buyAmountBn.div(offerAmountBn).toString(),
      })
      form.trigger()
    } else if (priceBn.gt(0)) {
      form.reset({
        ...formValues,
        buyAmount: offerAmountBn.mul(priceBn).toString(),
      })
      form.trigger()
    }
  }

  const handleBuyAmountChange = (newBuyAmount: string): void => {
    const formValues = form.getValues()

    const { offerAmount, price } = formValues

    const priceBn = new Big(price || "0")
    const offerAmountBn = new Big(offerAmount || "0")
    const buyAmountBn = new Big(newBuyAmount || "0")

    if (offerAmountBn.gt(0)) {
      form.reset({
        ...formValues,
        price: buyAmountBn.div(offerAmountBn).toString(),
      })
      form.trigger()
    } else if (priceBn.gt(0)) {
      form.reset({
        ...formValues,
        offerAmount: buyAmountBn.div(priceBn).toString(),
      })
      form.trigger()
    }
  }

  const handlePriceChange = (newPrice: string): void => {
    const formValues = form.getValues()

    const { offerAmount, buyAmount } = formValues

    const priceBn = new Big(newPrice || "0")
    const offerAmountBn = new Big(offerAmount || "0")
    const buyAmountBn = new Big(buyAmount || "0")

    if (offerAmountBn.gt(0)) {
      form.reset({
        ...formValues,
        buyAmount: offerAmountBn.mul(priceBn).toString(),
      })
      form.trigger()
    } else if (buyAmountBn.gt(0)) {
      form.reset({
        ...formValues,
        offerAmount: buyAmountBn.div(priceBn).toString(),
      })
      form.trigger()
    }
  }

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
                onAmountChange={handleOfferAmountChange}
              />
              <ModalContentDivider />
              {offerAsset && buyAsset && (
                <>
                  <PlaceOrderPrice
                    offerAsset={offerAsset}
                    buyAsset={buyAsset}
                    onChange={handlePriceChange}
                    onSwitch={() => {
                      const values = form.getValues()

                      form.reset({
                        ...values,
                        buyAsset: values.offerAsset,
                        buyAmount: values.offerAmount,
                        offerAsset: values.buyAsset,
                        offerAmount: values.buyAmount,
                        price: Big(values.price || "0").gte(0)
                          ? Big(1).div(values.price).toString()
                          : values.price,
                      })
                      form.trigger()
                    }}
                  />
                  <ModalContentDivider />
                </>
              )}
              <AssetSelectFormField<PlaceOrderFormValues>
                assetFieldName="buyAsset"
                amountFieldName="buyAmount"
                label={t("otc.placeOrder.buy")}
                assets={tradable}
                ignoreBalance
                onAmountChange={handleBuyAmountChange}
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
