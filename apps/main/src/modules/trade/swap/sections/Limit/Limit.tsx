import { Button, Grid } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider, useFormContext, useWatch } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { LimitForm } from "@/modules/trade/swap/sections/Limit/LimitForm"
import { LimitSummary } from "@/modules/trade/swap/sections/Limit/LimitSummary"
import {
  LimitFormValues,
  useLimitForm,
} from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { useSubmitLimitOrder } from "@/modules/trade/swap/sections/Limit/useSubmitLimitOrder"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const Limit: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const form = useLimitForm({ assetIn, assetOut })
  const submitLimitOrder = useSubmitLimitOrder()

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) =>
          submitLimitOrder.mutate(values),
        )}
      >
        <LimitForm />
        <SwapSectionSeparator />
        <LimitSubmitButton isPending={submitLimitOrder.isPending} />
        <LimitSummary />
      </form>
    </FormProvider>
  )
}

// Isolated component so that watching limitPrice only re-renders the button,
// not the entire form tree (LimitForm, LimitWarnings, LimitSummary).
const LimitSubmitButton: FC<{ isPending: boolean }> = ({ isPending }) => {
  const { t } = useTranslation(["common", "trade"])
  const { formState } = useFormContext<LimitFormValues>()
  const limitPrice = useWatch<LimitFormValues, "limitPrice">({
    name: "limitPrice",
  })
  const isFormValid = formState.isValid && !!limitPrice

  return (
    <Grid py="xl" justifyItems="center">
      <AuthorizedAction size="large" width="100%">
        <Button
          type="submit"
          size="large"
          width="100%"
          disabled={!isFormValid || isPending}
        >
          {t("trade:limit.submit")}
        </Button>
      </AuthorizedAction>
    </Grid>
  )
}
