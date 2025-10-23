import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useFormContext } from "react-hook-form"

import { HealthFactorResult } from "@/api/aave"
import { TradeType } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSummarySkeleton } from "@/modules/trade/swap/sections/Market/Summary/MarketSummarySkeleton"
import { MarketSummarySwap } from "@/modules/trade/swap/sections/Market/Summary/MarketSummarySwap"
import { MarketSummaryTwap } from "@/modules/trade/swap/sections/Market/Summary/MarketSummaryTwap"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { AnyTransaction } from "@/modules/transactions/types"

type Props = {
  readonly swapType: TradeType
  readonly swap: Trade | undefined
  readonly swapTx: AnyTransaction | null
  readonly twap: TradeOrder | undefined
  readonly twapTx: AnyTransaction | null
  readonly healthFactor: HealthFactorResult | undefined
  readonly isLoading: boolean
}

export const MarketSummary = ({
  swapType,
  swap,
  swapTx,
  twap,
  twapTx,
  healthFactor,
  isLoading,
}: Props) => {
  const { watch } = useFormContext<MarketFormValues>()
  const isSingleTrade = watch("isSingleTrade")

  if (isLoading) {
    return <MarketSummarySkeleton type={swapType} />
  }

  if (!swap || !twap) {
    return null
  }

  return (
    <>
      <SwapSectionSeparator />
      {isSingleTrade ? (
        <MarketSummarySwap
          swap={swap}
          swapTx={swapTx}
          healthFactor={healthFactor}
        />
      ) : (
        <MarketSummaryTwap swap={swap} twap={twap} twapTx={twapTx} />
      )}
    </>
  )
}
