import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC, useEffect, useState } from "react"
import { FormProvider, useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TradeFormShell } from "@/modules/trade/swap/components/TradeFormShell/TradeFormShell"
import { TradeFormSubmit } from "@/modules/trade/swap/components/TradeFormSubmit"
import { LimitFields } from "@/modules/trade/swap/sections/Limit/LimitFields"
import { LimitFooterNote } from "@/modules/trade/swap/sections/Limit/LimitFooterNote"
import { LimitOrderSettings } from "@/modules/trade/swap/sections/Limit/LimitOrderSettings"
import { LimitPriceField } from "@/modules/trade/swap/sections/Limit/LimitPriceField"
import { LimitSummary } from "@/modules/trade/swap/sections/Limit/LimitSummary"
import { useLimitCascade } from "@/modules/trade/swap/sections/Limit/useLimitCascade"
import {
  LimitFormValues,
  useLimitForm,
} from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useLimitHealthFactor } from "@/modules/trade/swap/sections/Limit/useLimitHealthFactor"
import { useSubmitLimitOrder } from "@/modules/trade/swap/sections/Limit/useSubmitLimitOrder"

export const Limit: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const form = useLimitForm({ assetIn, assetOut })

  return (
    <FormProvider {...form}>
      <LimitForm />
    </FormProvider>
  )
}

const LimitForm: FC = () => {
  const { t } = useTranslation(["trade", "common"])
  const form = useFormContext<LimitFormValues>()
  const submitLimitOrder = useSubmitLimitOrder()

  const { quotedPrice, isMarketLoading, isRecalculating, ...cascade } =
    useLimitCascade()

  const buyAmount = form.watch("buyAmount")
  const hasBuyAmount = !!buyAmount && Big(buyAmount).gt(0)

  const { healthFactor, isLoading: isHealthFactorLoading } =
    useLimitHealthFactor()

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const { watch } = form
  useEffect(() => {
    const subscription = watch((_, { type }) => {
      if (type === "change") setHealthFactorRiskAccepted(false)
    })

    return () => subscription.unsubscribe()
  }, [watch])

  const isFormValid = form.formState.isValid && hasBuyAmount

  const isHealthFactorConsentRequired =
    !!healthFactor &&
    healthFactor.isUserConsentRequired &&
    healthFactor.hasChanged &&
    healthFactor.future < healthFactor.current

  const isHealthFactorCheckSatisfied =
    !isHealthFactorConsentRequired || healthFactorRiskAccepted

  const shouldRenderHealthFactorWarning =
    isHealthFactorConsentRequired && Big(healthFactor.future).gt(1)

  const disabledLabel = !hasBuyAmount
    ? t("limit.cta.enterBuyAmount")
    : isFormValid && !isHealthFactorCheckSatisfied
      ? t("xc.swap.cta.acceptHealthFactor")
      : undefined

  return (
    <form
      onSubmit={form.handleSubmit((values) => submitLimitOrder.mutate(values))}
    >
      <TradeFormShell
        fields={<LimitFields {...cascade} />}
        submit={
          <TradeFormSubmit
            isLoading={
              submitLimitOrder.isPending ||
              isRecalculating ||
              isHealthFactorLoading
            }
            isEnabled={isFormValid && isHealthFactorCheckSatisfied}
            disabledLabel={disabledLabel}
          >
            {t("limit.submit")}
          </TradeFormSubmit>
        }
        summary={
          <>
            <LimitSummary healthFactor={healthFactor} />
            <LimitFooterNote />
          </>
        }
      >
        <LimitPriceField
          quotedPrice={quotedPrice}
          isMarketLoading={isMarketLoading}
        />
        <LimitOrderSettings />
        {shouldRenderHealthFactorWarning && (
          <HealthFactorRiskWarning
            py="l"
            canContinue={isFormValid}
            message={t("common:healthFactor.warning")}
            accepted={healthFactorRiskAccepted}
            isUserConsentRequired={healthFactor.isUserConsentRequired}
            onAcceptedChange={setHealthFactorRiskAccepted}
          />
        )}
      </TradeFormShell>
    </form>
  )
}
