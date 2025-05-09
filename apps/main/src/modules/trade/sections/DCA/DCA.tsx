import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { DCAFooter } from "@/modules/trade/sections/DCA/DCAFooter"
import { DCAForm } from "@/modules/trade/sections/DCA/DCAForm"
import { DCASummary } from "@/modules/trade/sections/DCA/DCASummary"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

import { useDCAForm } from "./DCA.form"

export const DCA: FC = () => {
  const form = useDCAForm()

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(console.log)}>
        <DCAForm />
        <SwapSectionSeparator />
        <DCASummary />
        <SwapSectionSeparator />
        <DCAFooter />
      </form>
    </FormProvider>
  )
}
