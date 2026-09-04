import { SliderTabs } from "@galacticcouncil/ui/components"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { useAccountBalances } from "@/api/balances"
import { bestSellQuery } from "@/api/trade"
import { marketPriceFromQuote } from "@/modules/trade/swap/lib/quotedPrice"
import { useQuotedPrice } from "@/modules/trade/swap/lib/quotedPrice.hook"
import { DcaErrors } from "@/modules/trade/swap/sections/DCA/DcaErrors"
import { DcaFooter } from "@/modules/trade/swap/sections/DCA/DcaFooter"
import { DcaForm } from "@/modules/trade/swap/sections/DCA/DcaForm"
import { DcaHealthFactor } from "@/modules/trade/swap/sections/DCA/DcaHealthFactor"
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
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useRpcProvider } from "@/providers/rpcProvider"
import { maxBalanceError } from "@/utils/validators"

import { DcaOrdersMode, DEFAULT_DCA_DURATION, useDcaForm } from "./useDcaForm"

export const Dca: FC = () => {
  const { t } = useTranslation(["trade"])
  const { isBalanceLoading } = useAccountBalances()
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
    defaultInverted: false,
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
    healthFactor.isSignificantChange &&
    healthFactor.future < healthFactor.current
      ? healthFactorRiskAccepted
      : true

  const isSubmitEnabled =
    isFormValid &&
    isPriceImpactCheckSatisfied &&
    isHealthFactorCheckSatisfied &&
    !isBalanceLoading

  const isHealthFactorShown =
    form.formState.errors.sellAmount?.message !== maxBalanceError

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => order && submitDcaOrder.mutate([values, order]),
        )}
      >
        <Controller
          control={form.control}
          name="orders"
          render={({ field }) => (
            <SliderTabs
              sx={{ mt: "m" }}
              options={[
                {
                  id: DcaOrdersMode.Auto,
                  label: t("trade:trade.orders.limitedBudget"),
                },
                {
                  id: DcaOrdersMode.OpenBudget,
                  label: t("trade:trade.orders.openBudget"),
                },
              ]}
              selected={
                field.value.type === DcaOrdersMode.OpenBudget
                  ? DcaOrdersMode.OpenBudget
                  : DcaOrdersMode.Auto
              }
              onSelect={({ id: type }) => {
                form.reset({
                  ...form.getValues(),
                  orders: {
                    ...(type === DcaOrdersMode.OpenBudget
                      ? { type, useSplitTrade: true }
                      : { type }),
                  },
                  duration: DEFAULT_DCA_DURATION,
                })

                form.trigger()
              }}
            />
          )}
        />
        <DcaForm
          maxBalance={
            isOpenBudget ? openBudgetOrderMaxBalance : limitOrderMaxBalance
          }
          quotedPrice={quotedPrice}
        />
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
        <DcaHealthFactor
          order={order}
          healthFactor={isHealthFactorShown ? healthFactor : undefined}
          isLoading={isLoading}
        />
        <SwapSectionSeparator />
        <DcaFooter
          isEnabled={isSubmitEnabled}
          isLoading={submitDcaOrder.isPending}
          isOpenBudget={isOpenBudget}
          order={order}
          priceImpactLevel={priceImpactLevel}
        />
      </form>
    </FormProvider>
  )
}
