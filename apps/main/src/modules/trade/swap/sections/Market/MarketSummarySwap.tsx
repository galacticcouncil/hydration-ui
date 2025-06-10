import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { Summary, SummaryRow } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { calculateSlippage } from "@/api/utils/slippage"
import { DynamicFee } from "@/components/DynamicFee"
import { TradeRoutes } from "@/modules/trade/swap/components/TradeRoutes"
import {
  MarketFormValues,
  TradeType,
} from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSummarySkeleton } from "@/modules/trade/swap/sections/Market/MarketSummarySkeleton"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"
import { GDOT_ASSET_ID } from "@/utils/consts"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade | undefined
  readonly isLoading: boolean
}

export const MarketSummarySwap: FC<Props> = ({ swap, isLoading }) => {
  const { t } = useTranslation(["common", "trade"])

  const {
    single: { swapSlippage },
  } = useTradeSettings()
  const form = useFormContext<MarketFormValues>()

  const { watch } = form
  const [buyAsset, sellAsset] = watch(["buyAsset", "sellAsset"])

  if (!buyAsset || !sellAsset) {
    return null
  }

  if (isLoading) {
    return <MarketSummarySkeleton />
  }

  const tradeFeePct = swap?.tradeFeePct ?? 0
  const tradeFeeRange = swap?.tradeFeeRange ?? [0, 0]

  const [min, max] = tradeFeeRange
  const [
    ,
    mediumLow = Number.MAX_SAFE_INTEGER,
    mediumHigh = Number.MAX_SAFE_INTEGER,
  ] = getTradeFeeIntervals(min, max)

  return (
    <div>
      <Summary separator={<SwapSectionSeparator />} withTrailingSeparator>
        <SummaryRow
          label={t("trade:market.summary.priceImpact")}
          content={t("percent", { value: swap?.priceImpactPct ?? 0 })}
        />
        <SummaryRow
          label={t("trade:market.summary.estTradeFees")}
          content={
            <DynamicFee
              value={tradeFeePct}
              rangeLow={mediumLow}
              rangeHigh={mediumHigh}
              tooltip="TODO Est. trade fees market swap"
            />
          }
        />
        {swap?.type === TradeType.Buy ? (
          <SummaryRow
            label={t("trade:market.summary.maxSent")}
            content={t("currency", {
              value: scaleHuman(
                swap
                  ? swap.amountIn +
                      calculateSlippage(swap.amountIn, swapSlippage)
                  : 0n,
                sellAsset.decimals,
              ),
              symbol: sellAsset.symbol,
            })}
          />
        ) : (
          <SummaryRow
            label={t("trade:market.summary.minReceived")}
            content={t("currency", {
              value: scaleHuman(
                swap
                  ? swap.amountOut -
                      calculateSlippage(swap.amountOut, swapSlippage)
                  : 0n,
                buyAsset.decimals,
              ),
              symbol: buyAsset.symbol,
            })}
          />
        )}
      </Summary>
      <TradeRoutes
        routes={
          swap?.swaps
            // Hide 2-Pool-GDOT
            .filter((swap) => swap.assetOut !== Number(GDOT_ASSET_ID)) ?? []
        }
      />
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
