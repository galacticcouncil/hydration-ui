import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AssetSelect } from "@/components/AssetSelect/AssetSelect"
import { CancelOtcOrderModalContent } from "@/modules/trade/otc/cancel-order/CancelOtcOrderModalContent"
import { AvailableAmount } from "@/modules/trade/otc/fill-order/AvailableAmount"
import { useFillOrderForm } from "@/modules/trade/otc/fill-order/FillOrderModalContent.form"
import { useSubmitFillOrder } from "@/modules/trade/otc/fill-order/FillOrderModalContent.submit"
import { TokensConversion } from "@/modules/trade/otc/fill-order/TokensConversion"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { TradeFee } from "@/modules/trade/otc/TradeFee"
import { otcTradeFeeQuery } from "@/modules/trade/otc/TradeFee.query"
import { useRpcProvider } from "@/providers/rpcProvider"

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
  const rpc = useRpcProvider()
  const { t } = useTranslation(["trade", "common"])
  const [isSubmitCancelOpen, setIsSubmitCancelOpen] = useState(false)

  const { data: feePrice = "0" } = useQuery(otcTradeFeeQuery(rpc))

  const form = useFillOrderForm(otcOffer, isUsersOffer, feePrice)
  const submit = useSubmitFillOrder({
    otcOffer,
    onSubmit: onClose,
  })

  const buyAmount = form.watch("buyAmount")

  const fee =
    !buyAmount || !feePrice
      ? undefined
      : Big(buyAmount).div(Big(1).minus(feePrice)).minus(buyAmount).toString()

  const isSubmitEnabled = isUsersOffer || form.formState.isValid

  if (isSubmitCancelOpen) {
    return (
      <CancelOtcOrderModalContent
        otcOffer={otcOffer}
        onBack={() => setIsSubmitCancelOpen(false)}
        onClose={onClose}
      />
    )
  }

  return (
    <>
      <ModalHeader title={t("otc.fillOrder.title")} />
      <FormProvider {...form}>
        <form
          onSubmit={
            isUsersOffer
              ? (e) => {
                  e.preventDefault()
                  setIsSubmitCancelOpen(true)
                }
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
                    label={t("common:pay")}
                    value={field.value}
                    onChange={(sellAmount) => {
                      field.onChange(sellAmount)

                      if (!sellAmount) {
                        form.setValue("buyAmount", "", {
                          shouldValidate: true,
                        })

                        return
                      }

                      const getBuyAmountAFterFee = (amount: string): string => {
                        const fee = Big(feePrice || "0").times(amount)

                        return Big(amount).minus(fee).toString()
                      }

                      if (sellAmount === otcOffer.assetAmountIn) {
                        form.setValue(
                          "buyAmount",
                          getBuyAmountAFterFee(otcOffer.assetAmountOut),
                          {
                            shouldValidate: true,
                          },
                        )

                        return
                      }

                      const percentage = new Big(sellAmount || "0").div(
                        otcOffer.assetAmountIn,
                      )
                      const newBuyAmount = percentage
                        .times(otcOffer.assetAmountOut)
                        .toString()

                      form.setValue(
                        "buyAmount",
                        getBuyAmountAFterFee(newBuyAmount),
                        {
                          shouldValidate: true,
                        },
                      )
                    }}
                    assets={[]}
                    selectedAsset={otcOffer.assetIn}
                    disabled={isUsersOffer || !otcOffer.isPartiallyFillable}
                    modalDisabled
                    maxButtonBalance={otcOffer.assetAmountIn}
                    maxBalanceFallback="0"
                    hideMaxBalanceAction={!otcOffer.isPartiallyFillable}
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
                    label={t("common:get")}
                    value={field.value}
                    onChange={(buyAmount) => {
                      field.onChange(buyAmount)

                      if (!buyAmount) {
                        form.setValue("sellAmount", "", {
                          shouldValidate: true,
                        })

                        return
                      }

                      const buyAmountBeforeFee = Big(buyAmount)
                        .div(Big(1).minus(feePrice || "0"))
                        .toString()

                      if (buyAmountBeforeFee === otcOffer.assetAmountOut) {
                        form.setValue("sellAmount", otcOffer.assetAmountIn, {
                          shouldValidate: true,
                        })

                        return
                      }

                      const percentage = new Big(buyAmountBeforeFee || "0").div(
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
                    maxBalanceFallback="0"
                    hideMaxBalanceAction
                    error={fieldState.error?.message}
                  />
                )}
              />
            </Box>
            <Separator />
            <TradeFee fee={fee} feeSymbol={otcOffer.assetOut.symbol} />
            <Separator />
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
              {isUsersOffer
                ? t("trade.cancelOrder.cta")
                : t("otc.fillOrder.cta")}
            </Button>
          </ModalFooter>
        </form>
      </FormProvider>
    </>
  )
}
