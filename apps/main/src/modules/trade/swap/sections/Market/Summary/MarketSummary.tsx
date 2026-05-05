import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { useFormContext } from "react-hook-form"

import { Trade, TradeOrder, TradeType } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSummarySkeleton } from "@/modules/trade/swap/sections/Market/Summary/MarketSummarySkeleton"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/Summary/MarketSummarySwap"
import { MarketSummaryTwap } from "@/modules/trade/swap/sections/Market/Summary/MarketSummaryTwap"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly swapType: TradeType
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}

export const MarketSummary = ({
  swapType,
  swap,
  twap,
  healthFactor,
  isLoading,
}: Props) => {
  const { watch } = useFormContext<MarketFormValues>()
  const isSingleTrade = watch("isSingleTrade")

  if (isLoading) {
    return <MarketSummarySkeleton type={swapType} />
  }

  if (!swap) {
    return null
  }

  if (isSingleTrade) {
    return <MarketSummarySwap swap={swap} healthFactor={healthFactor} />
  }

  if (twap) {
    return (
      <>
        <SwapSectionSeparator />
        <MarketSummaryTwap swap={swap} twap={twap} />
      </>
    )
  }

  return null
}
