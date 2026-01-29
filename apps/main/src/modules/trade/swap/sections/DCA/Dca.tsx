import { SliderTabs } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useEffect, useState } from "react"
import { Controller, FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

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
} from "@/modules/trade/swap/sections/DCA/useDcaValidation"
import { useSubmitDcaOrder } from "@/modules/trade/swap/sections/DCA/useSubmitDcaOrder"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { maxBalanceError } from "@/utils/validators"

import { DcaOrdersMode, DEFAULT_DCA_DURATION, useDcaForm } from "./useDcaForm"

export const Dca: FC = () => {
  const { t } = useTranslation(["trade"])
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const form = useDcaForm({ assetIn, assetOut })

  const { order, orderTx, dryRunError, healthFactor, isLoading } =
    useDcaTradeOrder(form)

  const [duration, ordersType] = form.watch(["duration", "orders.type"])
  const { warnings, errors } = useDcaValidation(order, duration, ordersType)

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
    healthFactor.future < healthFactor.current
      ? healthFactorRiskAccepted
      : true

  const isCollateralWarning = warnings.includes(DcaValidationWarning.Collateral)

  const isSubmitEnabled =
    isFormValid &&
    isPriceImpactCheckSatisfied &&
    isHealthFactorCheckSatisfied &&
    !isCollateralWarning

  const isHealthFactorShown =
    form.formState.errors.sellAmount?.message !== maxBalanceError

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) =>
            order && orderTx && submitDcaOrder.mutate([values, order, orderTx]),
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
                  sellAmount: "",
                  duration: DEFAULT_DCA_DURATION,
                })

                form.trigger()
              }}
            />
          )}
        />
        <DcaForm />
        <DcaSummary
          order={order}
          priceImpactLevel={
            errors.includes(DcaValidationError.PriceImpact)
              ? "error"
              : warnings.includes(DcaValidationWarning.PriceImpact)
                ? "warning"
                : undefined
          }
          isLoading={isLoading}
        />
        <DcaErrors
          priceImpact={order?.tradeImpactPct ?? 0}
          errors={errors}
          dryRunError={dryRunError}
        />
        <DcaWarnings
          isFormValid={isFormValid}
          order={order}
          warnings={warnings}
          priceImpactLossAccepted={priceImpactLossAccepted}
          healthFactor={healthFactor}
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
        <DcaFooter isEnabled={isSubmitEnabled} />
      </form>
    </FormProvider>
  )
}
