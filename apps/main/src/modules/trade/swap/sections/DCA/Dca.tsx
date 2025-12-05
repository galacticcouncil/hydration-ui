import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"

import { DcaErrors } from "@/modules/trade/swap/sections/DCA/DcaErrors"
import { DcaFooter } from "@/modules/trade/swap/sections/DCA/DcaFooter"
import { DcaForm } from "@/modules/trade/swap/sections/DCA/DcaForm"
import { DcaOrderInfo } from "@/modules/trade/swap/sections/DCA/DcaOrderInfo"
import { DcaSummary } from "@/modules/trade/swap/sections/DCA/DcaSummary"
import { DcaWarnings } from "@/modules/trade/swap/sections/DCA/DcaWarnings"
import { useDcaPriceImpactValidation } from "@/modules/trade/swap/sections/DCA/useDcaPriceImpactValidation"
import { useDcaTradeOrder } from "@/modules/trade/swap/sections/DCA/useDcaTradeOrder"
import { useSubmitDcaOrder } from "@/modules/trade/swap/sections/DCA/useSubmitDcaOrder"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

import { useDcaForm } from "./useDcaForm"

export const Dca: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const form = useDcaForm({ assetIn, assetOut })

  const { order, orderTx, healthFactor, isLoading } = useDcaTradeOrder(form)
  const { errors, priceImpactLossMessage } = useDcaPriceImpactValidation(order)
  const submitDcaOrder = useSubmitDcaOrder()

  const [priceImpactLossAccepted, setPriceImpactLossAccepted] = useState(false)
  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const isPriceImpactCheckSatisfied =
    !priceImpactLossMessage || priceImpactLossAccepted

  const isHealthFactorCheckSatisfied =
    !healthFactor?.isUserConsentRequired || healthFactorRiskAccepted

  const isSubmitEnabled =
    !!order &&
    isPriceImpactCheckSatisfied &&
    isHealthFactorCheckSatisfied &&
    form.formState.isValid &&
    !errors.length

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) =>
            order && orderTx && submitDcaOrder.mutate([values, order, orderTx]),
        )}
      >
        <DcaForm order={order} />
        <DcaSummary order={order} isLoading={isLoading} />
        <DcaWarnings
          priceImpactLossMessage={priceImpactLossMessage}
          priceImpactLossAccepted={priceImpactLossAccepted}
          healthFactor={healthFactor}
          healthFactorRiskAccepted={healthFactorRiskAccepted}
          onPriceImpactLossAcceptedChange={setPriceImpactLossAccepted}
          onHealthFactorRiskAcceptedChange={setHealthFactorRiskAccepted}
        />
        <DcaErrors errors={errors} />
        <SwapSectionSeparator />
        <DcaFooter isEnabled={isSubmitEnabled} />
        <DcaOrderInfo
          order={order}
          orderTx={orderTx}
          healthFactor={healthFactor}
          isLoading={isLoading}
        />
      </form>
    </FormProvider>
  )
}
