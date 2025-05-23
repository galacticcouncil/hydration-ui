import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { Summary } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { calculateSlippage } from "@/api/utils/slippage"
import { TwapOrder } from "@/api/utils/twapApi"
import { DynamicFee } from "@/components/DynamicFee"
import { TradeRoutes } from "@/modules/trade/swap/components/TradeRoutes"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSummarySkeleton } from "@/modules/trade/swap/sections/Market/MarketSummarySkeleton"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

// TODO SDK doesnt provide
const calculateDiffToRef = (Vfin: bigint, Vref: bigint): number => {
  return +(((Vfin - Vref) / Vref) * 100n).toString()
}

type Props = {
  readonly swap: Trade
  readonly twap: TwapOrder
  readonly isLoading: boolean
}

export const MarketSummaryTwap: FC<Props> = ({ swap, twap, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])

  const { slippage } = useTradeSettings()
  const form = useFormContext<MarketFormValues>()
  const { watch } = form
  const buyAsset = watch("buyAsset")

  const tradeFeePct = swap.tradeFeePct
  const tradeFeeRange = swap.tradeFeeRange ?? [0, 0]

  if (isLoading && (!twap || !swap)) {
    return <MarketSummarySkeleton />
  }

  if (!buyAsset) {
    return null
  }

  const twapPrice = twap.minAmountOut
  const swapPrice = swap.amountOut - calculateSlippage(swap.amountOut, slippage)
  const twapDiff = calculateDiffToRef(twapPrice, swapPrice)
  const twapDiffAbs = Math.abs(twapDiff)
  const twapSymbol = twapDiff >= 0 ? "+" : "-"

  const [min, max] = tradeFeeRange
  const [
    ,
    mediumLow = Number.MAX_SAFE_INTEGER,
    mediumHigh = Number.MAX_SAFE_INTEGER,
  ] = getTradeFeeIntervals(min, max)

  return (
    <div>
      <Summary
        separator={<SwapSectionSeparator />}
        withTrailingSeparator
        rows={[
          {
            label: t("trade:market.summary.priceImpact"),
            content: t("percent", { value: twap.priceImpactPct }),
          },
          {
            label: t("trade:market.summary.estTradeFees"),
            content: (
              <DynamicFee
                value={tradeFeePct}
                rangeLow={mediumLow}
                rangeHigh={mediumHigh}
                tooltip="TODO Est. trade fees market swap"
              />
            ),
          },
          {
            label: t("trade:market.summary.minReceived"),
            content: `${t("currency", {
              value: scaleHuman(twap.minAmountOut, buyAsset.decimals),
              symbol: buyAsset.symbol,
            })} (${twapSymbol + t("percent", { value: twapDiffAbs })})`,
          },
        ]}
      />
      <TradeRoutes routes={swap.swaps} />
    </div>
  )
}

const getTradeFeeIntervals = (
  min: number,
  max: number,
  num = 3,
): ReadonlyArray<number> => {
  const { log2 } = Math

  return Array.from(
    { length: num + 1 },
    (_, index) => 2 ** (log2(min) + (index / num) * (log2(max) - log2(min))),
  )
}
