import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"
import { FormProvider } from "react-hook-form"

import { TradeType } from "@/api/trade"
import { useMarketForm } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { useSubmitTwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitTwap"
import { useMarketBuyData } from "@/modules/trade/swap/sections/Market/Market.BuyData"
import { useMarketSellData } from "@/modules/trade/swap/sections/Market/Market.SellData"
import { MarketErrors } from "@/modules/trade/swap/sections/Market/MarketErrors"
import { MarketFields } from "@/modules/trade/swap/sections/Market/MarketFields"
import { MarketFooter } from "@/modules/trade/swap/sections/Market/MarketFooter"
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

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  // We need to preserve component state and focus on changing market type
  const useMarketData =
    type === TradeType.Sell ? useMarketSellData : useMarketBuyData

  const { swap, twap, healthFactor, isLoading } = useMarketData(form)

  const isTradeEnabled = isSingleTrade
    ? !!swap && !swap.swaps.flatMap((swap) => swap.errors).length
    : !!twap && !twap?.errors.length

  const isHealthFactorCheckSatisfied = healthFactor?.isUserConsentRequired
    ? healthFactorRiskAccepted
    : true

  return (
    <FormProvider {...form}>
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
        <MarketSummary
          swap={swap}
          twap={twap}
          healthFactor={healthFactor}
          isLoading={isLoading}
        />
        <SwapSectionSeparator />
        <MarketWarnings
          isSingleTrade={isSingleTrade}
          twap={twap}
          healthFactor={healthFactor}
          healthFactorRiskAccepted={healthFactorRiskAccepted}
          setHealthFactorRiskAccepted={setHealthFactorRiskAccepted}
        />
        {swap && <MarketErrors swap={swap} />}
        <MarketFooter
          isSingleTrade={isSingleTrade}
          isEnabled={
            isTradeEnabled &&
            isHealthFactorCheckSatisfied &&
            form.formState.isValid
          }
        />
      </form>
    </FormProvider>
  )
}
