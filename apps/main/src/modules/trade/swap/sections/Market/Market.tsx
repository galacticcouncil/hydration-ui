import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { useMarketForm } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useMarketTradeData } from "@/modules/trade/swap/sections/Market/lib/useMarketTradeData"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { MarketErrors } from "@/modules/trade/swap/sections/Market/MarketErrors"
import { MarketFields } from "@/modules/trade/swap/sections/Market/MarketFields"
import { MarketFooter } from "@/modules/trade/swap/sections/Market/MarketFooter"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/MarketSummarySwap"
import { MarketWarnings } from "@/modules/trade/swap/sections/Market/MarketWarnings"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const Market: FC = () => {
  const { assetIn, assetOut } = useSearch({
    from: "/_trade/trade/swap/market",
  })

  const form = useMarketForm({ assetIn, assetOut })
  const { data: swap, isLoading } = useMarketTradeData(form)
  const submitSwap = useSubmitSwap()

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (swap) {
            submitSwap.mutate([values, swap])
          }
        })}
      >
        <MarketFields />
        <SwapSectionSeparator />
        <MarketSummarySwap swap={swap} isLoading={isLoading} />
        <SwapSectionSeparator />
        <MarketWarnings />
        {swap && <MarketErrors swap={swap} />}
        <MarketFooter />
      </form>
    </FormProvider>
  )
}
