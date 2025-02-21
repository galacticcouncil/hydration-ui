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
import { useFillOrderForm } from "@/modules/trade/otc/fill-order/fillOrderSchema"
import { TradeDivider } from "@/modules/trade/otc/fill-order/TradeDivider"
import { useSubmitFillOrder } from "@/modules/trade/otc/fill-order/useSubmitFillOrder"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { TradeFee } from "@/modules/trade/otc/TradeFee"

type Props = {
  readonly otcOffer: OtcOfferTabular
  readonly onClose: () => void
}

// TODO integrate max balance
export const FillOrderModalContent: FC<Props> = ({ otcOffer, onClose }) => {
  const { t } = useTranslation(["trade", "common"])
  const form = useFillOrderForm(otcOffer)
  const submit = useSubmitFillOrder({
    onSubmit: onClose,
  })

  // TODO disable when not enough balance in non partial and 0 in partial
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
        <form
          onSubmit={form.handleSubmit((values) => submit(values, otcOffer))}
        >
          <ModalBody sx={{ p: 0 }}>
            <AvailableAmount
              assetIn={otcOffer.assetIn}
              assetInAmount={otcOffer.assetAmountIn}
              isPartiallyFillable={otcOffer.isPartiallyFillable}
            />
            <Separator />
            <Box px={20}>
              <Controller
                control={form.control}
                name="sellAmount"
                render={({ field }) => (
                  <AssetSelect
                    label={t("common:sell")}
                    maxBalance="1024436"
                    value={field.value}
                    onChange={field.onChange}
                    assets={[]}
                    selectedAsset={otcOffer.assetIn}
                    disabled={!otcOffer.isPartiallyFillable}
                    modalDisabled
                  />
                )}
              />
              <TradeDivider assetIn={otcOffer.assetIn} />
              <Controller
                control={form.control}
                name="buyAmount"
                render={({ field }) => (
                  <AssetSelect
                    label={t("common:buy")}
                    maxBalance="1024436"
                    value={field.value}
                    onChange={field.onChange}
                    assets={[]}
                    selectedAsset={otcOffer.assetOut}
                    disabled={!otcOffer.isPartiallyFillable}
                    modalDisabled
                  />
                )}
              />
            </Box>
            <Separator />
            <TradeFee
              assetOut={otcOffer.assetOut}
              assetAmountOut={otcOffer.assetAmountOut}
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
