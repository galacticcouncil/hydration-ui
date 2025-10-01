import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { DcaFooter } from "@/modules/trade/swap/sections/DCA/DcaFooter"
import { DcaForm } from "@/modules/trade/swap/sections/DCA/DcaForm"
import { DcaSummary } from "@/modules/trade/swap/sections/DCA/DcaSummary"
import { DcaWarnings } from "@/modules/trade/swap/sections/DCA/DcaWarnings"
import { useDcaTradeOrder } from "@/modules/trade/swap/sections/DCA/useDcaTradeOrder"
import { useSubmitDcaOrder } from "@/modules/trade/swap/sections/DCA/useSubmitDcaOrder"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

import { useDcaForm } from "./useDcaForm"

export const Dca: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })
  const form = useDcaForm({ assetIn, assetOut })
  const { data: order, isLoading } = useDcaTradeOrder(form)
  const submitDcaOrder = useSubmitDcaOrder()

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(
          (values) => order && submitDcaOrder.mutate([values, order]),
        )}
      >
        <DcaForm order={order} />
        <SwapSectionSeparator />
        <DcaSummary order={order} isLoading={isLoading} />
        <SwapSectionSeparator />
        <DcaWarnings />
        <DcaFooter isEnabled={!!order} />
      </form>
    </FormProvider>
  )
}
