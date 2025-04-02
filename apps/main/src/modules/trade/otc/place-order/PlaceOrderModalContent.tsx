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
import { useAccountData } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly onClose: () => void
}

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

  const balances = useAccountData((data) => data.balances)

  const ownedAssets = useMemo(() => {
    const assetIds = new Set(Object.keys(balances))
    return allAssets.filter((asset) => assetIds.has(asset.id))
  }, [allAssets, balances])

  const form = usePlaceOrderForm()
  const submit = useSubmitPlaceOrder({ onSubmit: onClose })
  const [offerAsset, offerAmount, buyAsset] = form.watch([
    "offerAsset",
    "offerAmount",
    "buyAsset",
  ])

  const offerAmountBalance = scaleHuman(
    balances[offerAsset?.id ?? ""]?.total ?? 0n,
    offerAsset?.decimals ?? 12,
  )

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
                maxBalance={offerAmountBalance.toString()}
                assetFieldName="offerAsset"
                assetAmountFieldName="offerAmount"
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
              <PlaceOrderAssetField
                label={t("common:buy")}
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
