import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { AvailableAmount } from "@/modules/trade/otc/fill-order/AvailableAmount"
import { useFillOrderForm } from "@/modules/trade/otc/fill-order/FillOrderModalContent.form"
import { useSubmitFillOrder } from "@/modules/trade/otc/fill-order/FillOrderModalContent.submit"
import { TokensConversion } from "@/modules/trade/otc/fill-order/TokensConversion"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { TradeFee } from "@/modules/trade/otc/TradeFee"

type Props = {
  readonly otcOffer: OtcOfferTabular
  readonly onClose: () => void
}

// TODO asset in balance from account assets
const assetInBalance = "30"

export const FillOrderModalContent: FC<Props> = ({ otcOffer, onClose }) => {
  const { t } = useTranslation(["trade", "common"])
  const form = useFillOrderForm(otcOffer, assetInBalance)
  const submit = useSubmitFillOrder({
    otcOffer,
    onSubmit: onClose,
  })

  const isSubmitEnabled = form.formState.isValid

  return (
    <>
      <ModalHeader
        title={t(
          otcOffer.isPartiallyFillable
            ? "otc.fillOrder.partial.title"
            : "otc.fillOrder.nonPartial.title",
        )}
        description={
          !otcOffer.isPartiallyFillable
            ? t("otc.fillOrder.nonPartial.description")
            : ""
        }
      />
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit((values) => submit.mutate(values))}>
          <ModalBody sx={{ p: 0 }}>
            <Controller
              control={form.control}
              name="sellAmount"
              render={({ field }) => (
                <AvailableAmount
                  assetIn={otcOffer.assetIn}
                  assetInAmount={otcOffer.assetAmountIn}
                  isPartiallyFillable={otcOffer.isPartiallyFillable}
                  userSellAmount={field.value}
                />
              )}
            />
            <Separator />
            <Box px={20}>
              <Controller
                control={form.control}
                name="sellAmount"
                render={({ field, fieldState }) => (
                  <AssetSelect
                    label={t("common:sell")}
                    maxBalance={assetInBalance}
                    value={field.value}
                    onChange={field.onChange}
                    assets={[]}
                    selectedAsset={otcOffer.assetIn}
                    disabled={!otcOffer.isPartiallyFillable}
                    modalDisabled
                    error={fieldState.error?.message}
                  />
                )}
              />
              <TokensConversion offer={otcOffer} />
              <Controller
                control={form.control}
                name="buyAmount"
                render={({ field, fieldState }) => (
                  <AssetSelect
                    label={t("common:buy")}
                    maxBalance={otcOffer.assetAmountOut}
                    value={field.value}
                    onChange={field.onChange}
                    assets={[]}
                    selectedAsset={otcOffer.assetOut}
                    disabled={!otcOffer.isPartiallyFillable}
                    modalDisabled
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Box>
            <Separator />
            <Controller
              name="buyAmount"
              control={form.control}
              render={({ field }) => (
                <TradeFee
                  assetOut={otcOffer.assetOut}
                  assetAmountOut={field.value || "0"}
                />
              )}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              size="large"
              width="100%"
              disabled={!isSubmitEnabled}
            >
              {t("otc.fillOrder.cta")}
            </Button>
          </ModalFooter>
        </form>
      </FormProvider>
    </>
  )
}
