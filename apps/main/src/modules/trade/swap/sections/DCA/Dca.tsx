import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"

import { DcaFooter } from "@/modules/trade/swap/sections/DCA/DcaFooter"
import { DcaForm } from "@/modules/trade/swap/sections/DCA/DcaForm"
import { DcaSummary } from "@/modules/trade/swap/sections/DCA/DcaSummary"
import { DcaWarnings } from "@/modules/trade/swap/sections/DCA/DcaWarnings"
import { useDcaTradeOrder } from "@/modules/trade/swap/sections/DCA/useDcaTradeOrder"
import { useSubmitDcaOrder } from "@/modules/trade/swap/sections/DCA/useSubmitDcaOrder"

import { useDcaForm } from "./useDcaForm"

export const Dca: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })
  const form = useDcaForm({ assetIn, assetOut })
  const { order, healthFactor, isLoading } = useDcaTradeOrder(form)
  const submitDcaOrder = useSubmitDcaOrder()

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  const isHealthFactorCheckSatisfied = healthFactor?.isUserConsentRequired
    ? healthFactorRiskAccepted
    : true

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
          healthFactor={healthFactor}
          healthFactorRiskAccepted={healthFactorRiskAccepted}
          setHealthFactorRiskAccepted={setHealthFactorRiskAccepted}
        />
        <DcaFooter
          isEnabled={
            !!order && isHealthFactorCheckSatisfied && form.formState.isValid
          }
        />
      </form>
    </FormProvider>
  )
}
