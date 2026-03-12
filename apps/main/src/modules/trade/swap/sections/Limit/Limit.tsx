import { Button, Grid } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AuthorizedAction } from "@/components/AuthorizedAction/AuthorizedAction"
import { LimitForm } from "@/modules/trade/swap/sections/Limit/LimitForm"
import { useSubmitLimitOrder } from "@/modules/trade/swap/sections/Limit/useSubmitLimitOrder"
import { useLimitForm } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const Limit: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const form = useLimitForm({ assetIn, assetOut })
  const submitLimitOrder = useSubmitLimitOrder()

  const limitPrice = form.watch("limitPrice")
  const isFormValid = form.formState.isValid && !!limitPrice

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit((values) => submitLimitOrder.mutate(values))}>
        <LimitForm />
        <SwapSectionSeparator />
        <Grid py="xl" justifyItems="center">
          <AuthorizedAction size="large" width="100%">
            <Button
              type="submit"
              size="large"
              width="100%"
              disabled={!isFormValid || submitLimitOrder.isPending}
            >
              {t("trade:limit.submit")}
            </Button>
          </AuthorizedAction>
        </Grid>
      </form>
    </FormProvider>
  )
}
