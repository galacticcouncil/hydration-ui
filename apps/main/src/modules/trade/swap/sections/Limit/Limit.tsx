import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { LimitFields } from "@/modules/trade/swap/sections/Limit/LimitFields"
import { LimitSubmit } from "@/modules/trade/swap/sections/Limit/LimitSubmit"
import { LimitSummary } from "@/modules/trade/swap/sections/Limit/LimitSummary"
import { useLimitForm } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useSubmitLimitOrder } from "@/modules/trade/swap/sections/Limit/useSubmitLimitOrder"

export const Limit: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const form = useLimitForm({ assetIn, assetOut })
  const submitLimitOrder = useSubmitLimitOrder()

  const isFormValid = form.formState.isValid
  const isSubmitEnabled = isFormValid

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          submitLimitOrder.mutate(values),
        )}
      >
        <LimitFields />
        <LimitSubmit
          isLoading={submitLimitOrder.isPending}
          isEnabled={isSubmitEnabled}
        />
        <LimitSummary />
      </form>
    </FormProvider>
  )
}
