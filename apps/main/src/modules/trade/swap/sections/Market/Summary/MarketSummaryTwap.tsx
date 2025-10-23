import { math } from "@galacticcouncil/sdk-next"
import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import {
  CollapsibleContent,
  CollapsibleRoot,
  Summary,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TradeOrderType } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { useDisplayAssetsPrice } from "@/components/AssetPrice"
import { DynamicFee } from "@/components/DynamicFee"
import { TradeRoutes } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/MarketSummaryRow"
import { CalculatedAmountSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/MaxSentSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"
import { getTradeFeeIntervals } from "@/utils/trade"

type Props = {
  readonly swap: Trade
  readonly twap: TradeOrder
  readonly twapTx: AnyTransaction | null
}

export const MarketSummaryTwap: FC<Props> = ({ swap, twap, twapTx }) => {
  const { t } = useTranslation(["common", "trade"])
  const { getAssetWithFallback } = useAssets()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    swap: {
      single: { swapSlippage },
      split: { twapSlippage },
    },
  } = useTradeSettings()

  const form = useFormContext<MarketFormValues>()
  const { watch } = form
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const { data: transactionFee } = useEstimateFee(twapTx)
  const transactionCosts = transactionFee?.feeEstimate || "0"

  const isBuy = twap.type === TradeOrderType.TwapBuy
  const tradeFeeAsset = isBuy ? sellAsset : buyAsset
  const tradeFee = tradeFeeAsset
    ? scaleHuman(twap.tradeFee, tradeFeeAsset.decimals)
    : "0"

  const [totalFeesDisplay] = useDisplayAssetsPrice([
    [buyAsset?.id ?? "", tradeFee],
    [transactionFee?.feeAssetId ?? "", transactionCosts],
  ])

  if (!sellAsset || !buyAsset || !tradeFeeAsset) {
    return null
  }

  const tradeAmount = isBuy ? twap.amountIn : twap.amountOut

  const tradeFeePct = Big(twap.tradeFee.toString())
    .div(tradeAmount.toString())
    .mul(100)
    .toNumber()

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

  const transactionFeeAsset = getAssetWithFallback(
    transactionFee?.feeAssetId ?? "",
  )

  return (
    <CollapsibleRoot open={!isCollapsed} onOpenChange={setIsCollapsed}>
      {isBuy ? (
        <CalculatedAmountSummaryRow
          label={t("trade:market.summary.maxSent")}
          amount={
            <SummaryRowValue fw={600} fs="p4" lh={1.2}>
              <span>
                {t("currency", {
                  value: twapPriceHuman,
                  symbol: sellAsset.symbol,
                })}
              </span>{" "}
              <span sx={{ color: getToken("colors.skyBlue.500") }}>
                ({twapSymbol}
                {t("percent", { value: twapDiffAbs })})
              </span>
            </SummaryRowValue>
          }
          isCollapsed={isCollapsed}
          onIsCollapsedChange={setIsCollapsed}
        />
      ) : (
        <CalculatedAmountSummaryRow
          label={t("trade:market.summary.minReceived")}
          amount={
            <SummaryRowValue fw={600} fs="p4" lh={1.2}>
              <span>
                {t("currency", {
                  value: twapPriceHuman,
                  symbol: buyAsset.symbol,
                })}
              </span>{" "}
              <span sx={{ color: getToken("colors.skyBlue.500") }}>
                ({twapSymbol}
                {t("percent", { value: twapDiffAbs })})
              </span>
            </SummaryRowValue>
          }
          isCollapsed={isCollapsed}
          onIsCollapsedChange={setIsCollapsed}
        />
      )}
      <CollapsibleContent sx={{ overflow: "visible" }} asChild>
        <Summary separator={<SwapSectionSeparator />} withLeadingSeparator>
          <MarketSummaryRow
            label={t("trade:market.summary.totalFees")}
            content={
              <SummaryRowValue fw={500} fs="p4" lh={1.2}>
                {totalFeesDisplay}
              </SummaryRowValue>
            }
          />
          <MarketSummaryRow
            label={t("trade:market.summary.priceImpact")}
            content={
              <SummaryRowValue fw={500} fs="p4" lh={1.2}>
                {t("percent", { value: swap.priceImpactPct })}
              </SummaryRowValue>
            }
            tooltip={t("trade:market.summary.priceImpact.tooltip")}
          />
          <MarketSummaryRow
            label={t("trade:market.summary.estTradeFees")}
            content={
              <DynamicFee
                amount={t("currency", {
                  value: tradeFee,
                  symbol: tradeFeeAsset.symbol,
                })}
                value={tradeFeePct}
                rangeLow={mediumLow}
                rangeHigh={mediumHigh}
              />
            }
            tooltip={t("trade:market.summary.estTradeFees.tooltip")}
          />
          <MarketSummaryRow
            label={t("trade:market.summary.transactionCosts")}
            content={
              <SummaryRowValue fw={500} fs="p4" lh={1.2}>
                {t("currency", {
                  value: transactionCosts,
                  symbol: transactionFeeAsset.symbol,
                })}
              </SummaryRowValue>
            }
            tooltip={t("trade:market.summary.transactionCosts.tooltip")}
          />
          <MarketSummaryRow
            label={t("trade:market.summary.routes.label")}
            content={<TradeRoutes swapType={swap.type} routes={swap.swaps} />}
          />
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
