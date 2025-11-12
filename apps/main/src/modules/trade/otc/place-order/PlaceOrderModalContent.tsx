import {
  Box,
  Button,
  ModalBody,
  ModalContentDivider,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useCallback, useEffect, useRef } from "react"
import { FormProvider, useController } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { spotPriceQuery } from "@/api/spotPrice"
import { AssetSelectFormField } from "@/form/AssetSelectFormField"
import { useOwnedAssets } from "@/hooks/data/useOwnedAssets"
import { PartiallyFillableToggle } from "@/modules/trade/otc/place-order/PartiallyFillableToggle"
import {
  PlaceOrderFormValues,
  PriceSettings,
  usePlaceOrderForm,
} from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { useSubmitPlaceOrder } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.submit"
import {
  getOmnipoolPrice,
  getPrice,
} from "@/modules/trade/otc/place-order/PlaceOrderModalContent.utils"
import {
  PlaceOrderPrice,
  PRICE_GAIN_DIFF_THRESHOLD,
} from "@/modules/trade/otc/place-order/PlaceOrderPrice"
import { PriceGainWarning } from "@/modules/trade/otc/place-order/PriceGainWarning"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type Props = {
  readonly onClose: () => void
}

export const PlaceOrderModalContent: FC<Props> = ({ onClose }) => {
  const { t } = useTranslation(["trade", "common"])
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()

  const { tradable } = useAssets()
  const ownedAssets = useOwnedAssets()

  const form = usePlaceOrderForm()
  const { getValues, setValue, watch, control } = form

  const [
    offerAsset,
    offerAmount,
    buyAsset,
    buyAmount,
    priceSettings,
    isPriceSwitched,
  ] = watch([
    "offerAsset",
    "offerAmount",
    "buyAsset",
    "buyAmount",
    "priceSettings",
    "isPriceSwitched",
  ])

  const { field: priceConfirmationField } = useController({
    control,
    name: "priceConfirmation",
  })

  const { data: spotPrice, isLoading: priceLoading } = useQuery(
    spotPriceQuery(rpc, offerAsset?.id ?? "", buyAsset?.id ?? ""),
  )

  const [omnipoolPrice, { isPriceValid }] = getOmnipoolPrice(
    spotPrice?.spotPrice,
  )
  const { price, priceGain } = getPrice(priceSettings, omnipoolPrice)

  const submit = useSubmitPlaceOrder({ onSubmit: onClose })
  const lastTouchedAssetRef = useRef<"offer" | "buy">("offer")

  const handleOfferAmountChange = (newOfferAmount: string): void => {
    lastTouchedAssetRef.current = "offer"

    if (!newOfferAmount) {
      form.setValue("buyAmount", "", { shouldValidate: true })

      return
    }

    const priceBig = new Big(price)

    if (!priceBig.gt(0)) {
      return
    }

    form.setValue("buyAmount", Big(newOfferAmount).mul(priceBig).toString(), {
      shouldValidate: true,
    })
  }

  const handleBuyAmountChange = (newBuyAmount: string): void => {
    lastTouchedAssetRef.current = "buy"

    if (!newBuyAmount) {
      form.setValue("offerAmount", "", { shouldValidate: true })

      return
    }

    const priceBig = new Big(price)

    if (!priceBig.gt(0)) {
      return
    }

    form.setValue("offerAmount", Big(newBuyAmount).div(priceBig).toString(), {
      shouldValidate: true,
    })
  }

  const handlePriceUpdate = useCallback(
    (formValues: PlaceOrderFormValues, omnipoolPrice: string): void => {
      const {
        offerAsset,
        offerAmount,
        buyAsset,
        buyAmount,
        priceSettings,
        priceConfirmation,
      } = formValues

      if (!offerAsset || !buyAsset) {
        return
      }

      const { price, priceGain } = getPrice(priceSettings, omnipoolPrice)

      const priceBig = Big(price)
      const priceGainBig = Big(priceGain)
      const offerAmountBig = Big(offerAmount || "0")
      const buyAmountBig = Big(buyAmount || "0")

      if (
        (!buyAmount || lastTouchedAssetRef.current === "offer") &&
        offerAmountBig.gt(0) &&
        priceBig.gt(0)
      ) {
        setValue("buyAmount", offerAmountBig.mul(price).toString(), {
          shouldValidate: true,
        })
      } else if (
        (!offerAmount || lastTouchedAssetRef.current === "buy") &&
        buyAmountBig.gt(0) &&
        priceBig.gt(0)
      ) {
        setValue("offerAmount", buyAmountBig.div(price).toString(), {
          shouldValidate: true,
        })
      }

      const priceNeedsConfirmation =
        !priceBig.eq(0) && priceGainBig.lte(-PRICE_GAIN_DIFF_THRESHOLD)

      const priceConfirmationNew = (() => {
        if (priceNeedsConfirmation) {
          if (priceConfirmation) {
            return priceConfirmation
          } else {
            return { confirmed: false }
          }
        }

        return null
      })()

      setValue("priceConfirmation", priceConfirmationNew)
    },
    [setValue],
  )

  const handlePriceSettingsChange = (priceSettings: PriceSettings): void => {
    if (!offerAsset || !buyAsset) {
      return
    }

    const spotPrice = queryClient.getQueryData(
      spotPriceQuery(rpc, offerAsset.id, buyAsset.id).queryKey,
    )
    const [omnipoolPrice, { isPriceValid }] = getOmnipoolPrice(
      spotPrice?.spotPrice,
    )

    if (priceSettings.type === "fixed" || isPriceValid) {
      const formValues = getValues()
      handlePriceUpdate(formValues, omnipoolPrice)
    }
  }

  const handleOfferAssetChange = (
    newOfferAsset: TAsset,
    previousOfferAsset: TAsset | null,
  ): void => {
    const formValues = form.getValues()

    if (!previousOfferAsset || !formValues.buyAsset) {
      return
    }

    lastTouchedAssetRef.current = "offer"

    const updatedFormValues: PlaceOrderFormValues = {
      ...formValues,
      offerAsset: newOfferAsset,
      offerAmount: "1",
      buyAmount: "",
      priceSettings: { type: "relative", percentage: 0 },
      priceConfirmation: null,
      isPriceSwitched: false,
    }

    form.reset(updatedFormValues)
    handlePriceUpdate(updatedFormValues, omnipoolPrice)
    form.trigger()
  }

  const handleBuyAssetChange = (
    newBuyAsset: TAsset,
    previousBuyAsset: TAsset | null,
  ): void => {
    const formValues = form.getValues()

    if (!formValues.offerAsset || !previousBuyAsset) {
      return
    }

    lastTouchedAssetRef.current = "offer"

    const updatedFormValues: PlaceOrderFormValues = {
      ...formValues,
      offerAmount: "1",
      buyAsset: newBuyAsset,
      buyAmount: "",
      priceSettings: { type: "relative", percentage: 0 },
      priceConfirmation: null,
      isPriceSwitched: false,
    }

    form.reset(updatedFormValues)
    handlePriceUpdate(updatedFormValues, omnipoolPrice)
    form.trigger()
  }

  useEffect(() => {
    if (isPriceValid) {
      const formValues = getValues()
      handlePriceUpdate(formValues, omnipoolPrice)
    }
  }, [omnipoolPrice, isPriceValid, getValues, handlePriceUpdate])

  const areAssetsSelected = !!offerAsset && !!buyAsset

  const inputPrice =
    priceSettings.type === "fixed" &&
    priceSettings.wasPriceSwitched === isPriceSwitched
      ? priceSettings.inputValue
      : isPriceValid
        ? t("common:number", {
            value:
              isPriceSwitched && !Big(price).eq(0)
                ? Big(1).div(price).toString()
                : price,
          })
            // just using decimals part
            .replaceAll(" ", "")
        : ""

  const isSubmitEnabled =
    !!offerAmount &&
    !!buyAmount &&
    form.formState.isValid &&
    (!priceConfirmationField.value || priceConfirmationField.value.confirmed)

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
                ignoreDisplayValue={!areAssetsSelected}
                disabledInput={!areAssetsSelected}
                onAmountChange={handleOfferAmountChange}
                onAssetChange={handleOfferAssetChange}
              />
              <ModalContentDivider />
              {offerAsset && buyAsset && (
                <>
                  <PlaceOrderPrice
                    offerAsset={offerAsset}
                    buyAsset={buyAsset}
                    price={inputPrice}
                    priceGain={priceGain}
                    isPriceLoaded={!priceLoading && isPriceValid}
                    onChange={handlePriceSettingsChange}
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
                ignoreDisplayValue={!areAssetsSelected}
                disabledInput={!areAssetsSelected}
                onAmountChange={handleBuyAmountChange}
                onAssetChange={handleBuyAssetChange}
              />
            </Box>
            {areAssetsSelected && (
              <>
                <Separator />
                <PartiallyFillableToggle />
                <Separator />
                {offerAsset && buyAsset && (
                  <PriceGainWarning
                    offerAsset={offerAsset}
                    buyAsset={buyAsset}
                    priceGain={priceGain}
                    isPriceSwitched={isPriceSwitched}
                  />
                )}
              </>
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
