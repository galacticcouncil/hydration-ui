import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { CancelOrderModalContent } from "@/modules/trade/otc/cancel-order/CancelOrderModalContent"
import { AvailableAmount } from "@/modules/trade/otc/fill-order/AvailableAmount"
import { useFillOrderForm } from "@/modules/trade/otc/fill-order/FillOrderModalContent.form"
import { useSubmitFillOrder } from "@/modules/trade/otc/fill-order/FillOrderModalContent.submit"
import { TokensConversion } from "@/modules/trade/otc/fill-order/TokensConversion"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { TradeFee } from "@/modules/trade/otc/TradeFee"
import { useAccountBalance } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly otcOffer: OtcOfferTabular
  readonly isUsersOffer: boolean
  readonly onClose: () => void
}

export const FillOrderModalContent: FC<Props> = ({
  otcOffer,
  isUsersOffer,
  onClose,
}) => {
  const { t } = useTranslation(["trade", "common"])
  const [isSubmitCancelOpen, setIsSubmitCancelOpen] = useState(false)

  const inBalance = useAccountBalance(otcOffer.assetIn.id)
  const assetInBalance = scaleHuman(
    inBalance?.total ?? 0n,
    otcOffer.assetIn?.decimals ?? 12,
  )

  const form = useFillOrderForm(otcOffer, assetInBalance, isUsersOffer)
  const submit = useSubmitFillOrder({
    otcOffer,
    onSubmit: onClose,
  })

  const isSubmitEnabled = isUsersOffer || form.formState.isValid

  if (isSubmitCancelOpen) {
    return (
      <CancelOrderModalContent
        otcOffer={otcOffer}
        onBack={() => setIsSubmitCancelOpen(false)}
        onClose={onClose}
      />
    )
  }

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
          onSubmit={
            isUsersOffer
              ? () => setIsSubmitCancelOpen(true)
              : form.handleSubmit((values) => submit.mutate(values))
          }
        >
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
                    onChange={(sellAmount) => {
                      field.onChange(sellAmount)

                      const percentage = new Big(sellAmount || "0").div(
                        otcOffer.assetAmountIn,
                      )
                      const newBuyAmount = percentage
                        .times(otcOffer.assetAmountOut)
                        .toString()

                      form.setValue("buyAmount", newBuyAmount, {
                        shouldValidate: true,
                      })
                    }}
                    assets={[]}
                    selectedAsset={otcOffer.assetIn}
                    disabled={isUsersOffer || !otcOffer.isPartiallyFillable}
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
                    onChange={(buyAmount) => {
                      field.onChange(buyAmount)

                      const percentage = new Big(buyAmount || "0").div(
                        otcOffer.assetAmountOut,
                      )
                      const newSellAmount = percentage
                        .times(otcOffer.assetAmountIn)
                        .toString()

                      form.setValue("sellAmount", newSellAmount, {
                        shouldValidate: true,
                      })
                    }}
                    assets={[]}
                    selectedAsset={otcOffer.assetOut}
                    disabled={isUsersOffer || !otcOffer.isPartiallyFillable}
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
              variant={isUsersOffer ? "danger" : "primary"}
              outline={isUsersOffer}
              size="large"
              width="100%"
              disabled={!isSubmitEnabled}
            >
              {isUsersOffer ? t("otc.cancelOrder.cta") : t("otc.fillOrder.cta")}
            </Button>
          </ModalFooter>
        </form>
      </FormProvider>
    </>
  )
}
