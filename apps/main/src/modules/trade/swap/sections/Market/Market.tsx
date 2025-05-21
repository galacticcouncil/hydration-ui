import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useSearch } from "@tanstack/react-router"
import { FC } from "react"
import { FormProvider } from "react-hook-form"

import { TwapOrder } from "@/api/utils/twapApi"
import { useMarketForm } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useMarketTradeData } from "@/modules/trade/swap/sections/Market/lib/useMarketTradeData"
import { useSubmitSwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitSwap"
import { useSubmitTwap } from "@/modules/trade/swap/sections/Market/lib/useSubmitTwap"
import { MarketErrors } from "@/modules/trade/swap/sections/Market/MarketErrors"
import { MarketFields } from "@/modules/trade/swap/sections/Market/MarketFields"
import { MarketFooter } from "@/modules/trade/swap/sections/Market/MarketFooter"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/MarketSummarySwap"
import { MarketSummaryTwap } from "@/modules/trade/swap/sections/Market/MarketSummaryTwap"
import { MarketTradeOptions } from "@/modules/trade/swap/sections/Market/MarketTradeOptions"
import { MarketWarnings } from "@/modules/trade/swap/sections/Market/MarketWarnings"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

export type SelectedTradeOption =
  | {
      readonly type: "swap"
      readonly swap: Trade
    }
  | {
      readonly type: "twap"
      readonly swap: Trade
      readonly twap: TwapOrder
    }

export const Market: FC = () => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history/swap/market",
  })

  const form = useMarketForm({ assetIn, assetOut })
  const type = form.watch("type")

  const {
    swap,
    swapTx,
    twap,
    showTwap,
    isLoadingSwap,
    isLoadingSwapTx,
    isLoadingTwap,
  } = useMarketTradeData(form)

  const selectedTradeOption = ((): SelectedTradeOption | null => {
    switch (type) {
      case "swap":
        return swap ? { type, swap } : null
      case "twap":
        return twap && swap ? { type, swap, twap } : null
    }
  })()

  const submitSwap = useSubmitSwap()
  const submitTwap = useSubmitTwap()

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit((values) => {
          if (!selectedTradeOption) {
            return
          }

          if (selectedTradeOption.type === "swap") {
            if (swapTx) {
              submitSwap.mutate([values, selectedTradeOption.swap, swapTx])
            }
          } else {
            submitTwap.mutate([values, selectedTradeOption.twap])
          }
        })}
      >
        <MarketFields />
        {showTwap && (
          <MarketTradeOptions
            swap={swap}
            twap={twap}
            isLoading={isLoadingSwap || isLoadingSwapTx || isLoadingTwap}
          />
        )}
        <SwapSectionSeparator />
        {selectedTradeOption?.type === "swap" && (
          <MarketSummarySwap
            swap={selectedTradeOption.swap}
            isLoading={isLoadingSwap}
          />
        )}
        {selectedTradeOption?.type === "twap" && (
          <MarketSummaryTwap
            swap={selectedTradeOption.swap}
            twap={selectedTradeOption.twap}
            isLoading={isLoadingTwap}
          />
        )}
        <SwapSectionSeparator />
        <MarketWarnings selectedTradeOption={selectedTradeOption} />
        <MarketErrors selectedTradeOption={selectedTradeOption} />
        <MarketFooter type={type} />
      </form>
    </FormProvider>
  )
}
