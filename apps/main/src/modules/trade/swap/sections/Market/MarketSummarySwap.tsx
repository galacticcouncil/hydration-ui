import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { Summary, SummaryRow } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { calculateSlippage } from "@/api/utils/slippage"
import { DynamicFee } from "@/components/DynamicFee"
import { TradeRoutes } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes"
import {
  MarketFormValues,
  TradeType,
} from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade
}

export const MarketSummarySwap: FC<Props> = ({ swap }) => {
  const { t } = useTranslation(["common", "trade"])

  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const form = useFormContext<MarketFormValues>()

  const { watch } = form
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  if (!sellAsset || !buyAsset) {
    return null
  }

  const tradeFeePct = swap.tradeFeePct
  const tradeFeeRange = swap.tradeFeeRange ?? [0, 0]

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
          content={t("percent", { value: swap.priceImpactPct })}
        />
        <SummaryRow
          label={t("trade:market.summary.estTradeFees")}
          content={
            <DynamicFee
              value={tradeFeePct}
              rangeLow={mediumLow}
              rangeHigh={mediumHigh}
              tooltip={`TODO ${t("percent", { value: tradeFeePct })}`}
            />
          }
        />
        {swap.type === TradeType.Buy ? (
          <SummaryRow
            label={t("trade:market.summary.maxSent")}
            content={t("currency", {
              value: scaleHuman(
                swap.amountIn + calculateSlippage(swap.amountIn, swapSlippage),
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
                swap.amountOut -
                  calculateSlippage(swap.amountOut, swapSlippage),
                buyAsset.decimals,
              ),
              symbol: buyAsset.symbol,
            })}
          />
        )}
      </Summary>
      <TradeRoutes routes={swap.swaps ?? []} />
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
