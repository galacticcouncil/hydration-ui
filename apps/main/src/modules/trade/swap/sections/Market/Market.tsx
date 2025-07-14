import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { TradeType } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useMarketForm } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { useSubmitTwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitTwap"
import { MarketBuyProvider } from "@/modules/trade/swap/sections/Market/MarketBuyProvider"
import { MarketErrors } from "@/modules/trade/swap/sections/Market/MarketErrors"
import { MarketFields } from "@/modules/trade/swap/sections/Market/MarketFields"
import { MarketFooter } from "@/modules/trade/swap/sections/Market/MarketFooter"
import { MarketSellProvider } from "@/modules/trade/swap/sections/Market/MarketSellProvider"
import { MarketSummary } from "@/modules/trade/swap/sections/Market/MarketSummary"
import { MarketTradeOptions } from "@/modules/trade/swap/sections/Market/MarketTradeOptions"
import { MarketWarnings } from "@/modules/trade/swap/sections/Market/MarketWarnings"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export const Market: FC = () => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const submitSwap = useSubmitSwap()
  const submitTwap = useSubmitTwap()

  const form = useMarketForm({ assetIn, assetOut })
  const [type, isSingleTrade] = form.watch(["type", "isSingleTrade"])

  const TradeProvider =
    type === TradeType.Sell ? MarketSellProvider : MarketBuyProvider

  return (
    <FormProvider {...form}>
      <TradeProvider>
        {({ swap, twap, isLoading }) => (
          <form
            onSubmit={form.handleSubmit((values) =>
              isSingleTrade
                ? swap && submitSwap.mutate([values, swap])
                : twap && submitTwap.mutate([values, twap]),
            )}
          >
            <MarketFields />
            <MarketTradeOptions swap={swap} twap={twap} isLoading={isLoading} />
            <SwapSectionSeparator />
            <MarketSummary swap={swap} twap={twap} isLoading={isLoading} />
            <SwapSectionSeparator />
            <MarketWarnings isSingleTrade={isSingleTrade} twap={twap} />
            {swap && <MarketErrors swap={swap} />}
            <MarketFooter
              isSingleTrade={isSingleTrade}
              isEnabled={isSingleTrade ? !!swap : !!twap}
            />
          </form>
        )}
      </TradeProvider>
    </FormProvider>
  )
}
