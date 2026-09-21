import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useAccountBalances } from "@/api/balances"
import { bestSellQuery } from "@/api/trade"
import { TradeFormShell } from "@/modules/trade/swap/components/TradeFormShell/TradeFormShell"
import { TradeFormSubmit } from "@/modules/trade/swap/components/TradeFormSubmit"
import { marketPriceFromQuote } from "@/modules/trade/swap/lib/quotedPrice"
import { useQuotedPrice } from "@/modules/trade/swap/lib/quotedPrice.hook"
import { DcaErrors } from "@/modules/trade/swap/sections/DCA/DcaErrors"
import { DcaFields } from "@/modules/trade/swap/sections/DCA/DcaFields"
import { DcaFooterNote } from "@/modules/trade/swap/sections/DCA/DcaFooterNote"
import { DcaLimitedBudgetFields } from "@/modules/trade/swap/sections/DCA/DcaLimitedBudgetFields"
import { DcaLimitPrice } from "@/modules/trade/swap/sections/DCA/DcaLimitPrice"
import { DcaOpenBudgetFields } from "@/modules/trade/swap/sections/DCA/DcaOpenBudgetFields"
import { DcaSummary } from "@/modules/trade/swap/sections/DCA/DcaSummary"
import { DcaWarnings } from "@/modules/trade/swap/sections/DCA/DcaWarnings"
import { useDcaTradeOrder } from "@/modules/trade/swap/sections/DCA/useDcaTradeOrder"
import {
  DcaValidationError,
  DcaValidationWarning,
  useDcaValidation,
  useOpenBudgetDcaHfValidation,
} from "@/modules/trade/swap/sections/DCA/useDcaValidation"
import { useMaxOrderBalance } from "@/modules/trade/swap/sections/DCA/useMaxOrderBalance"
import { useSubmitDcaOrder } from "@/modules/trade/swap/sections/DCA/useSubmitDcaOrder"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useIsIceEnabled } from "@/states/intents"
import { maxBalanceError } from "@/utils/validators"

import {
  DcaOrdersMode,
  isOpenBudgetMinTradesExceeded,
  MIN_DCA_ORDERS,
  useDcaForm,
} from "./useDcaForm"

export const Dca: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const isIceEnabled = useIsIceEnabled()
  const { getTransferableBalance, isBalanceLoading } = useAccountBalances()
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })
  const { limitOrderMaxBalance, openBudgetOrderMaxBalance } =
    useMaxOrderBalance({
      assetIn,
      assetOut,
    })

  const form = useDcaForm({
    assetIn,
    assetOut,
    limitOrderMaxBalance,
    openBudgetOrderMaxBalance,
  })

  const {
    order,
    healthFactor: initialHealthFactor,
    isLoading,
  } = useDcaTradeOrder(form)

  const [duration, ordersType, sellAsset, buyAsset, sellAmount] = form.watch([
    "duration",
    "orders.type",
    "sellAsset",
    "buyAsset",
    "sellAmount",
  ])
  const { warnings, errors } = useDcaValidation(order, duration)

  const rpc = useRpcProvider()
  const { data: marketSwap } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount && Big(sellAmount).gt(0) ? sellAmount : "1",
    }),
  )

  const { setValue } = form
  const quotedPrice = useQuotedPrice({
    marketPrice: marketPriceFromQuote(
      marketSwap,
      sellAsset?.decimals,
      buyAsset?.decimals,
    ),
    pair: [sellAsset?.id ?? "", buyAsset?.id ?? ""],
    defaultInverted: true,
    onCanonicalChange: (canonical) =>
      setValue("limitPrice", canonical, { shouldValidate: true }),
  })

  const priceImpactLevel: "error" | "warning" | undefined = errors.includes(
    DcaValidationError.PriceImpact,
  )
    ? "error"
    : warnings.includes(DcaValidationWarning.PriceImpact)
      ? "warning"
      : undefined

  const isOpenBudget = ordersType === DcaOrdersMode.OpenBudget
  const openBudgetHealthFactor = useOpenBudgetDcaHfValidation(
    order,
    initialHealthFactor,
    isOpenBudget,
  )

  const healthFactor = isOpenBudget
    ? openBudgetHealthFactor
    : initialHealthFactor

  const submitDcaOrder = useSubmitDcaOrder()

  const [priceImpactLossAccepted, setPriceImpactLossAccepted] = useState(false)
  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const { watch } = form
  useEffect(() => {
    const subscription = watch((_, { type }) => {
      if (type !== "change") {
        return
      }

      setPriceImpactLossAccepted(false)
      setHealthFactorRiskAccepted(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [watch])

  const isFormValid = !!order && form.formState.isValid && !errors.length

  const isPriceImpactCheckSatisfied =
    !warnings.includes(DcaValidationWarning.PriceImpact) ||
    priceImpactLossAccepted

  const isHealthFactorCheckSatisfied =
    healthFactor?.isUserConsentRequired &&
    healthFactor.hasChanged &&
    healthFactor.future < healthFactor.current
      ? healthFactorRiskAccepted
      : true

  const isSubmitEnabled =
    isFormValid &&
    isPriceImpactCheckSatisfied &&
    isHealthFactorCheckSatisfied &&
    !isBalanceLoading

  const sellAmountError = form.formState.errors.sellAmount?.message

  const isHealthFactorShown = sellAmountError !== maxBalanceError

  const disabledLabel =
    isOpenBudget &&
    sellAsset &&
    isOpenBudgetMinTradesExceeded(
      sellAmount ?? "",
      getTransferableBalance(sellAsset.id),
      sellAsset.decimals,
    )
      ? t("trade:dca.cta.minTrades", { count: MIN_DCA_ORDERS })
      : sellAmountError
        ? t("trade:dca.cta.minBudget")
        : undefined

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => submitDcaOrder.mutate(values))}
      >
        <TradeFormShell
          fields={
            <DcaFields
              maxBalance={
                isOpenBudget ? openBudgetOrderMaxBalance : limitOrderMaxBalance
              }
            />
          }
          submit={
            <TradeFormSubmit
              isEnabled={isSubmitEnabled}
              isLoading={
                submitDcaOrder.isPending ||
                isLoading ||
                form.formState.isValidating
              }
              disabledLabel={disabledLabel}
            >
              {t("schedule")}
            </TradeFormSubmit>
          }
          summary={
            <DcaFooterNote
              isOpenBudget={isOpenBudget}
              order={order}
              isLoading={isLoading}
              healthFactor={isHealthFactorShown ? healthFactor : undefined}
              priceImpactLevel={priceImpactLevel}
            />
          }
        >
          {isOpenBudget ? <DcaOpenBudgetFields /> : <DcaLimitedBudgetFields />}
          {isIceEnabled && <DcaLimitPrice quotedPrice={quotedPrice} />}
          <DcaSummary
            order={order}
            isLoading={isLoading}
            quotedPrice={quotedPrice}
          />
          <DcaErrors priceImpact={order?.tradeImpactPct ?? 0} errors={errors} />
          <DcaWarnings
            isFormValid={isFormValid}
            order={order}
            isOpenBudget={isOpenBudget}
            warnings={warnings}
            healthFactor={healthFactor}
            priceImpactLossAccepted={priceImpactLossAccepted}
            healthFactorRiskAccepted={healthFactorRiskAccepted}
            onPriceImpactLossAcceptedChange={setPriceImpactLossAccepted}
            onHealthFactorRiskAcceptedChange={setHealthFactorRiskAccepted}
          />
        </TradeFormShell>
      </form>
    </FormProvider>
  )
}
