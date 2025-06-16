import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useFormContext } from "react-hook-form"

import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSummarySkeleton } from "@/modules/trade/swap/sections/Market/MarketSummarySkeleton"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/MarketSummarySwap"
import { MarketSummaryTwap } from "@/modules/trade/swap/sections/Market/MarketSummaryTwap"

type Props = {
  readonly swap: Trade | undefined
  readonly twap: TradeOrder | undefined
  readonly isLoading: boolean
}

export const MarketSummary = ({ swap, twap, isLoading }: Props) => {
  const { watch } = useFormContext<MarketFormValues>()
  const isSingleTrade = watch("isSingleTrade")

  if (isLoading) {
    return <MarketSummarySkeleton />
  }

  if (!swap || !twap) {
    return null
  }

  if (isSingleTrade) {
    return <MarketSummarySwap swap={swap} />
  }

  return <MarketSummaryTwap swap={swap} twap={twap} />
}
