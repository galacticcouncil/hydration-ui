import { math } from "@galacticcouncil/sdk-next"
import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Summary, SummaryRow } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { calculateSlippage } from "@/api/utils/slippage"
import { DynamicFee } from "@/components/DynamicFee"
import {
  TradeRoute,
  TradeRoutes,
} from "@/modules/trade/swap/components/TradeRoutes"
import {
  MarketFormValues,
  TradeOrderType,
} from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly swap: Trade
  readonly twap: TradeOrder
}

export const MarketSummaryTwap: FC<Props> = ({ swap, twap }) => {
  const { t } = useTranslation(["common", "trade"])

  const {
    swap: {
      single: { swapSlippage },
      split: { twapSlippage },
    },
  } = useTradeSettings()

  const form = useFormContext<MarketFormValues>()
  const { watch } = form
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  if (!sellAsset || !buyAsset) {
    return null
  }

  const tradeAmount =
    twap.type === TradeOrderType.TwapBuy ? twap.amountIn : twap.amountOut

  const tradeFeePct = Big(twap.tradeFee.toString())
    .div(tradeAmount.toString())
    .mul(100)

  const [
    ,
    mediumLow = Number.MAX_SAFE_INTEGER,
    mediumHigh = Number.MAX_SAFE_INTEGER,
  ] = getTradeFeeIntervals(0, 0)

  const [twapPrice, swapPrice, twapPriceHuman] = (() => {
    if (twap.type === TradeOrderType.TwapBuy) {
      const twapPrice =
        twap.amountIn + calculateSlippage(twap.amountIn, twapSlippage)
      const twapPriceHuman = scaleHuman(twapPrice, sellAsset.decimals)

      const swapPrice =
        swap.amountIn + calculateSlippage(swap.amountIn, swapSlippage)

      return [twapPrice, swapPrice, twapPriceHuman]
    }

    const twapPrice =
      twap.amountOut - calculateSlippage(twap.amountOut, twapSlippage)
    const twapPriceHuman = scaleHuman(twapPrice, buyAsset.decimals)

    const swapPrice =
      swap.amountOut - calculateSlippage(swap.amountOut, swapSlippage)

    return [twapPrice, swapPrice, twapPriceHuman]
  })()

  const twapDiff = math.calculateDiffToRef(BigInt(twapPrice), BigInt(swapPrice))
  const twapDiffAbs = Math.abs(twapDiff)
  const twapSymbol = twapDiff >= 0 ? "+" : "-"

  return (
    <div>
      <Summary separator={<SwapSectionSeparator />} withTrailingSeparator>
        <SummaryRow
          label={t("trade:market.summary.priceImpact")}
          content={t("percent", { value: twap.tradeImpactPct })}
        />
        <SummaryRow
          label={t("trade:market.summary.estTradeFees")}
          content={
            <DynamicFee
              value={tradeFeePct.toNumber()}
              rangeLow={mediumLow}
              rangeHigh={mediumHigh}
              tooltip={`TODO ${t("percent", { value: tradeFeePct })}`}
            />
          }
        />
        {twap.type === TradeOrderType.TwapBuy ? (
          <SummaryRow
            label={t("trade:market.summary.maxSent")}
            content={
              t("currency", {
                value: twapPriceHuman,
                symbol: sellAsset.symbol,
              }) + ` (${twapSymbol + t("percent", { value: twapDiffAbs })})`
            }
          />
        ) : (
          <SummaryRow
            label={t("trade:market.summary.minReceived")}
            content={
              t("currency", {
                value: twapPriceHuman,
                symbol: buyAsset.symbol,
              }) + ` (${twapSymbol + t("percent", { value: twapDiffAbs })})`
            }
          />
        )}
      </Summary>
      <TradeRoutes
        routes={twap.tradeRoute.map<TradeRoute>((route) => ({
          assetIn: route.asset_in,
          assetOut: route.asset_out,
          poolAddress: route.pool.type,
        }))}
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
