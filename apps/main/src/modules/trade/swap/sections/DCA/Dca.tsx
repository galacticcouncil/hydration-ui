import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { DcaErrors } from "@/modules/trade/swap/sections/DCA/DcaErrors"
import { DcaFooter } from "@/modules/trade/swap/sections/DCA/DcaFooter"
import { DcaForm } from "@/modules/trade/swap/sections/DCA/DcaForm"
import { DcaSummary } from "@/modules/trade/swap/sections/DCA/DcaSummary"
import { DcaWarnings } from "@/modules/trade/swap/sections/DCA/DcaWarnings"
import { useDcaTradeOrder } from "@/modules/trade/swap/sections/DCA/useDcaTradeOrder"
import { useSubmitDcaOrder } from "@/modules/trade/swap/sections/DCA/useSubmitDcaOrder"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"

import { useDcaForm } from "./useDcaForm"

const PRICE_IMPACT_WARNING_THRESHOLD = 3

export const Dca: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })
  const form = useDcaForm({ assetIn, assetOut })
  const { order, healthFactor, isLoading } = useDcaTradeOrder(form)
  const submitDcaOrder = useSubmitDcaOrder()

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const isHealthFactorCheckSatisfied = healthFactor?.isUserConsentRequired
    ? healthFactorRiskAccepted
    : true

  const {
    dca: { slippage },
  } = useTradeSettings()

  const priceImpact = order?.tradeImpactPct ?? 0
  const priceImpactDisplay = t("percent", { value: priceImpact })

  const { warnings, errors } = (() => {
    const warnings: Array<string> = []
    const errors: Array<string> = []

    if (Math.abs(priceImpact) > slippage) {
      errors.push(
        t("trade:dca.errors.priceImpact", { percentage: priceImpactDisplay }),
      )
    } else if (Math.abs(priceImpact) > PRICE_IMPACT_WARNING_THRESHOLD) {
      warnings.push(
        t("trade:dca.warnings.priceImpact", { percentage: priceImpactDisplay }),
      )
    }

    if (order && order.frequency < order.frequencyMin) {
      errors.push(t("trade:dca.errors.minLimit"))
    }

    return { warnings, errors }
  })()

  const isSubmitEnabled =
    !!order &&
    isHealthFactorCheckSatisfied &&
    form.formState.isValid &&
    !errors.length

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => order && submitDcaOrder.mutate([values, order]),
        )}
      >
        <DcaForm order={order} />
        <DcaSummary
          order={order}
          healthFactor={healthFactor}
          isLoading={isLoading}
        />
        <DcaWarnings
          warnings={warnings}
          healthFactor={healthFactor}
          healthFactorRiskAccepted={healthFactorRiskAccepted}
          setHealthFactorRiskAccepted={setHealthFactorRiskAccepted}
        />
        <DcaErrors errors={errors} />
        <SwapSectionSeparator />
        <DcaFooter isEnabled={isSubmitEnabled} />
      </form>
    </FormProvider>
  )
}
