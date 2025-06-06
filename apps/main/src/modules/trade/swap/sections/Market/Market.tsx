import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { TradeType } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useMarketForm } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { MarketBuyProvider } from "@/modules/trade/swap/sections/Market/MarketBuyProvider"
import { MarketErrors } from "@/modules/trade/swap/sections/Market/MarketErrors"
import { MarketFields } from "@/modules/trade/swap/sections/Market/MarketFields"
import { MarketFooter } from "@/modules/trade/swap/sections/Market/MarketFooter"
import { MarketSellProvider } from "@/modules/trade/swap/sections/Market/MarketSellProvider"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/MarketSummarySwap"
import { MarketWarnings } from "@/modules/trade/swap/sections/Market/MarketWarnings"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const Market: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const submitSwap = useSubmitSwap()
  const form = useMarketForm({ assetIn, assetOut })
  const type = form.watch("type")

  const TradeProvider =
    type === TradeType.Sell ? MarketSellProvider : MarketBuyProvider

  return (
    <FormProvider {...form}>
      <TradeProvider>
        {({ swap, isLoading }) => (
          <form
            onSubmit={form.handleSubmit(
              (values) => swap && submitSwap.mutate([values, swap]),
            )}
          >
            <MarketFields />
            <SwapSectionSeparator />
            <MarketSummarySwap swap={swap} isLoading={isLoading} />
            <SwapSectionSeparator />
            <MarketWarnings />
            {swap && <MarketErrors swap={swap} />}
            <MarketFooter isEnabled={!!swap} />
          </form>
        )}
      </TradeProvider>
    </FormProvider>
  )
}
