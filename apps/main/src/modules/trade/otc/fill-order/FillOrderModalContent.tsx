import {
  Box,
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Separator,
} from "@galacticcouncil/ui/components"
import { formatAssetAmount } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useDisplayAssetPrice } from "@/components/AssetPrice"
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
  const rpc = useRpcProvider()
  const { t } = useTranslation(["trade", "common"])
  const [isSubmitCancelOpen, setIsSubmitCancelOpen] = useState(false)

  const inBalance = useAccountBalance(otcOffer.assetIn.id)
  const assetInBalance = inBalance
    ? scaleHuman(inBalance.transferable, otcOffer.assetIn.decimals)
    : "0"
  const assetInMax = Big.min(otcOffer.assetAmountIn, assetInBalance).toString()

  const { data: feePct = "0" } = useQuery(otcTradeFeeQuery(rpc))

  const form = useFillOrderForm(otcOffer, isUsersOffer, feePct)
  const submit = useSubmitFillOrder({
    otcOffer,
    onSubmitted: onClose,
  })

  const { trigger } = form
  useEffect(() => {
    if (!otcOffer.isPartiallyFillable) {
      trigger()
    }
  }, [otcOffer.isPartiallyFillable, trigger])

  const sellAmount = form.watch("sellAmount")

  const feeAsset = otcOffer.assetIn
  const fee =
    !sellAmount || !feePct
      ? undefined
      : Big(sellAmount).times(feePct).toString()

  const [feeDisplay] = useDisplayAssetPrice(feeAsset.id, fee || "0")

  const isSubmitEnabled =
    isUsersOffer || (!!sellAmount && form.formState.isValid)

  if (isSubmitCancelOpen) {
    return (
      <CancelOtcOrderModalContent
        otcOffer={otcOffer}
        onBack={() => setIsSubmitCancelOpen(false)}
        onClose={onClose}
      />
    )
  }

  const ratio = new Big(otcOffer.assetAmountIn).div(otcOffer.assetAmountOut)

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
            <AvailableAmount
              assetIn={otcOffer.assetIn}
              assetInAmount={otcOffer.assetAmountIn}
              isPartiallyFillable={otcOffer.isPartiallyFillable}
              userSellAmount={sellAmount}
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

                      const fee = formatAssetAmount(
                        Big(sellAmount).times(feePct).toString(),
                        otcOffer.assetIn.decimals,
                      )

                      const sellAmountAfterFee = Big(sellAmount)
                        .minus(fee)
                        .toString()

                      const newBuyAmount = formatAssetAmount(
                        Big(sellAmountAfterFee).div(ratio).toString(),
                        otcOffer.assetOut.decimals,
                      )

                      form.setValue("buyAmount", newBuyAmount, {
                        shouldValidate: true,
                      })
                    }}
                    assets={[]}
                    selectedAsset={otcOffer.assetIn}
                    disabled={isUsersOffer || !otcOffer.isPartiallyFillable}
                    modalDisabled
                    maxButtonBalance={assetInMax}
                    maxBalanceFallback="0"
                    hideMaxBalanceAction={!otcOffer.isPartiallyFillable}
                    amountError={fieldState.error?.message}
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

                      const sellAmountAfterFee = formatAssetAmount(
                        Big(buyAmount).times(ratio).toString(),
                        otcOffer.assetIn.decimals,
                      )

                      const sellAmountBeforeFee = formatAssetAmount(
                        Big(sellAmountAfterFee)
                          .div(Big(1).minus(feePct))
                          .toString(),
                        otcOffer.assetIn.decimals,
                      )

                      form.setValue("sellAmount", sellAmountBeforeFee, {
                        shouldValidate: true,
                      })
                    }}
                    assets={[]}
                    selectedAsset={otcOffer.assetOut}
                    disabled={isUsersOffer || !otcOffer.isPartiallyFillable}
                    modalDisabled
                    maxBalanceFallback="0"
                    hideMaxBalanceAction
                    amountError={fieldState.error?.message}
                  />
                )}
              />
            </Box>
            <Separator />
            <TradeFee
              fee={fee}
              feeDisplay={feeDisplay}
              feePct={feePct}
              feeSymbol={feeAsset.symbol}
            />
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
