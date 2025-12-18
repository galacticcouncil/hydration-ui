import { useSearch } from "@tanstack/react-router"
import { FC, useEffect, useState } from "react"
import { FormProvider } from "react-hook-form"

import { DcaErrors } from "@/modules/trade/swap/sections/DCA/DcaErrors"
import { DcaFooter } from "@/modules/trade/swap/sections/DCA/DcaFooter"
import { DcaForm } from "@/modules/trade/swap/sections/DCA/DcaForm"
import { DcaOrderInfo } from "@/modules/trade/swap/sections/DCA/DcaOrderInfo"
import { DcaSummary } from "@/modules/trade/swap/sections/DCA/DcaSummary"
import { DcaWarnings } from "@/modules/trade/swap/sections/DCA/DcaWarnings"
import {
  DcaValidationError,
  DcaValidationWarning,
  useDcaPriceImpactValidation,
} from "@/modules/trade/swap/sections/DCA/useDcaPriceImpactValidation"
import { useDcaTradeOrder } from "@/modules/trade/swap/sections/DCA/useDcaTradeOrder"
import { useSubmitDcaOrder } from "@/modules/trade/swap/sections/DCA/useSubmitDcaOrder"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { maxBalanceError } from "@/utils/validators"

import { useDcaForm } from "./useDcaForm"

export const Dca: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const form = useDcaForm({ assetIn, assetOut })

  const { order, orderTx, healthFactor, isLoading } = useDcaTradeOrder(form)
  const { warnings, errors } = useDcaPriceImpactValidation(order)

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
    !healthFactor?.isUserConsentRequired || healthFactorRiskAccepted

  const isSubmitEnabled =
    isFormValid && isPriceImpactCheckSatisfied && isHealthFactorCheckSatisfied

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
        <DcaErrors priceImpact={order?.tradeImpactPct ?? 0} errors={errors} />
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
        <SwapSectionSeparator />
        <DcaFooter isEnabled={isSubmitEnabled} />
        <DcaOrderInfo
          order={order}
          healthFactor={isHealthFactorShown ? healthFactor : undefined}
          isLoading={isLoading}
        />
      </form>
    </FormProvider>
  )
}
