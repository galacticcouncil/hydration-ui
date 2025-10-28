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
import { FC, useRef } from "react"
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
import { PriceGainWarning } from "@/modules/trade/otc/place-order/PriceGainWarning"
import { TradeFee } from "@/modules/trade/otc/TradeFee"
import { TAsset, useAssets } from "@/providers/assetsProvider"

type LastTouchedAsset = "offer" | "buy"

type Props = {
  readonly onClose: () => void
}

export const PlaceOrderModalContent: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation(["trade", "common"])
  const { tradable } = useAssets()

  const ownedAssets = useOwnedAssets()

  const form = usePlaceOrderForm()

  const submit = useSubmitPlaceOrder({ onSubmit: onClose })
  const [offerAsset, offerAmount, buyAsset, buyAmount, priceGainConfirmation] =
    form.watch([
      "offerAsset",
      "offerAmount",
      "buyAsset",
      "buyAmount",
      "priceGainConfirmation",
    ])

  const isSubmitEnabled =
    !!offerAmount &&
    !!buyAmount &&
    form.formState.isValid &&
    (!priceGainConfirmation || priceGainConfirmation.confirmed)

  const lastTouchedAssetRef = useRef<LastTouchedAsset | null>(null)

  const handleOfferAmountChange = (newOfferAmount: string): void => {
    lastTouchedAssetRef.current = "offer"
    const formValues = form.getValues()

    if (!newOfferAmount) {
      form.setValue("buyAmount", "")
      form.trigger()

      return
    }

    const priceBn = new Big(formValues.price || "0")

    if (!priceBn.gt(0)) {
      return
    }

    form.setValue(
      "buyAmount",
      Big(newOfferAmount)
        .mul(formValues.isPriceSwitched ? Big(1).div(priceBn) : priceBn)
        .toString(),
    )

    form.trigger()
  }

  const handleBuyAmountChange = (newBuyAmount: string): void => {
    lastTouchedAssetRef.current = "buy"
    const formValues = form.getValues()

    if (!newBuyAmount) {
      form.setValue("offerAmount", "")
      form.trigger()

      return
    }

    const priceBn = new Big(formValues.price || "0")

    if (!priceBn.gt(0)) {
      return
    }

    form.setValue(
      "offerAmount",
      Big(newBuyAmount)
        .div(formValues.isPriceSwitched ? Big(1).div(priceBn) : priceBn)
        .toString(),
    )

    form.trigger()
  }

  const handlePriceChange = (newPrice: string): void => {
    const formValues = form.getValues()

    const {
      offerAmount,
      buyAmount,
      isPriceSwitched,
      priceGainConfirmation,
      priceGain,
    } = formValues

    const priceBn =
      !newPrice || newPrice === "0"
        ? Big(0)
        : Big(isPriceSwitched ? Big(1).div(newPrice) : newPrice)

    const offerAmountBn = Big(offerAmount || "0")
    const buyAmountBn = Big(buyAmount || "0")

    const priceGainNeedsConfirmation =
      !!priceGain &&
      (isPriceSwitched
        ? Big(priceGain).gt(0)
        : !Big(priceGain).eq(0) && Big(1).div(priceGain).lt(0))

    const priceGainConfirmationNew = (() => {
      if (priceGainNeedsConfirmation) {
        if (priceGainConfirmation) {
          return priceGainConfirmation
        } else {
          return { confirmed: false }
        }
      }

      return null
    })()

    if (lastTouchedAssetRef.current === "offer" && offerAmountBn.gt(0)) {
      form.reset({
        ...formValues,
        buyAmount: offerAmountBn.mul(priceBn).toString(),
        priceGainConfirmation: priceGainConfirmationNew,
      })

      form.trigger()
    } else if (lastTouchedAssetRef.current === "buy" && buyAmountBn.gt(0)) {
      form.reset({
        ...formValues,
        offerAmount: buyAmountBn.div(priceBn).toString(),
        priceGainConfirmation: priceGainConfirmationNew,
      })

      form.trigger()
    } else {
      form.setValue("priceGainConfirmation", priceGainConfirmationNew)
    }
  }

  const handleOfferAssetChange = (newOfferAsset: TAsset): void => {
    lastTouchedAssetRef.current = "offer"
    form.reset({
      ...form.getValues(),
      offerAsset: newOfferAsset,
      // TODO should be 1 but then buy amount should be recalced with spot price???
      offerAmount: "",
      buyAmount: "",
      price: null,
      priceGain: "0",
      priceGainConfirmation: null,
      isPriceSwitched: false,
    })

    form.trigger()
  }

  const handleBuyAssetChange = (newBuyAsset: TAsset): void => {
    lastTouchedAssetRef.current = "buy"
    form.reset({
      ...form.getValues(),
      // TODO should be 1 but then buy amount should be recalced with spot price???
      offerAmount: "",
      buyAsset: newBuyAsset,
      buyAmount: "",
      price: null,
      priceGain: "0",
      priceGainConfirmation: null,
      isPriceSwitched: false,
    })

    form.trigger()
  }

  const areAssetsSelected = !!offerAsset && !!buyAsset

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
                ignoreBalance={!areAssetsSelected}
                ignoreDollarValue={!areAssetsSelected}
                amountDisabled={!areAssetsSelected}
                onAmountChange={handleOfferAmountChange}
                onAssetChange={handleOfferAssetChange}
              />
              <ModalContentDivider />
              {offerAsset && buyAsset && (
                <>
                  <PlaceOrderPrice
                    offerAsset={offerAsset}
                    buyAsset={buyAsset}
                    onChange={handlePriceChange}
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
                ignoreDollarValue={!areAssetsSelected}
                amountDisabled={!areAssetsSelected}
                onAmountChange={handleBuyAmountChange}
                onAssetChange={handleBuyAssetChange}
              />
            </Box>
            <Separator />
            <PartiallyFillableToggle />
            <Separator />
            {priceGainConfirmation && offerAsset && buyAsset ? (
              <PriceGainWarning
                offerAsset={offerAsset}
                buyAsset={buyAsset}
                isConfirmed={priceGainConfirmation.confirmed}
              />
            ) : (
              <TradeFee
                assetOut={offerAsset}
                assetAmountOut={offerAmount || "0"}
              />
            )}
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
