import { useSearch } from "@tanstack/react-router"
import Big from "big.js"
import { FC } from "react"
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
  const { t } = useTranslation("trade")
  const form = useFormContext<LimitFormValues>()
  const submitLimitOrder = useSubmitLimitOrder()

  const { quotedPrice, isMarketLoading, isRecalculating, ...cascade } =
    useLimitCascade()

  const buyAmount = form.watch("buyAmount")
  const hasBuyAmount = !!buyAmount && Big(buyAmount).gt(0)

  return (
    <form
      onSubmit={form.handleSubmit((values) => submitLimitOrder.mutate(values))}
    >
      <TradeFormShell
        fields={<LimitFields {...cascade} />}
        submit={
          <TradeFormSubmit
            isLoading={submitLimitOrder.isPending || isRecalculating}
            isEnabled={form.formState.isValid && hasBuyAmount}
            disabledLabel={
              hasBuyAmount ? undefined : t("limit.cta.enterBuyAmount")
            }
          >
            {t("limit.submit")}
          </TradeFormSubmit>
        }
        summary={
          <>
            <LimitSummary />
            <LimitFooterNote />
          </>
        }
      >
        <LimitPriceField
          quotedPrice={quotedPrice}
          isMarketLoading={isMarketLoading}
        />
        <LimitOrderSettings />
      </TradeFormShell>
    </form>
  )
}
