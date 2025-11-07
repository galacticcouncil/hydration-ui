import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import {
  CollapsibleContent,
  CollapsibleRoot,
  Summary,
  SummaryRowValue,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { TradeType } from "@/api/trade"
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
  readonly swapTx: AnyTransaction | null
  readonly healthFactor: HealthFactorResult | undefined
}

export const MarketSummarySwap: FC<Props> = ({
  swap,
  swapTx,
  healthFactor,
}) => {
  const { t } = useTranslation(["common", "trade"])
  const { getAssetWithFallback } = useAssets()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const form = useFormContext<MarketFormValues>()

  const { watch } = form
  const [sellAsset, buyAsset] = watch(["sellAsset", "buyAsset"])

  const { data: transactionFee } = useEstimateFee(swapTx)
  const transactionCosts = transactionFee?.feeEstimate || "0"

  const isBuy = swap.type === TradeType.Buy
  const tradeFeeAsset = isBuy ? sellAsset : buyAsset
  const tradeFee = tradeFeeAsset
    ? scaleHuman(swap.tradeFee, tradeFeeAsset.decimals)
    : "0"

  const [totalFeesDisplay] = useDisplayAssetsPrice([
    [buyAsset?.id ?? "", tradeFee],
    [transactionFee?.feeAssetId ?? "", transactionCosts],
  ])

  if (!sellAsset || !buyAsset || !tradeFeeAsset) {
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

  const transactionFeeAsset = getAssetWithFallback(
    transactionFee?.feeAssetId ?? "",
  )

  return (
    <CollapsibleRoot open={!isCollapsed} onOpenChange={setIsCollapsed}>
      {isBuy ? (
        <CalculatedAmountSummaryRow
          label={t("trade:market.summary.maxSent")}
          amount={t("currency", {
            value: scaleHuman(
              swap.amountIn + calculateSlippage(swap.amountIn, swapSlippage),
              sellAsset.decimals,
            ),
            symbol: sellAsset.symbol,
          })}
          isCollapsed={isCollapsed}
          onIsCollapsedChange={setIsCollapsed}
        />
      ) : (
        <CalculatedAmountSummaryRow
          label={t("trade:market.summary.minReceived")}
          amount={t("currency", {
            value: scaleHuman(
              swap.amountOut - calculateSlippage(swap.amountOut, swapSlippage),
              buyAsset.decimals,
            ),
            symbol: buyAsset.symbol,
          })}
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
          {healthFactor?.isSignificantChange && (
            <MarketSummaryRow
              label={t("trade:market.summary.healthFactor")}
              content={
                <HealthFactorChange
                  healthFactor={healthFactor.current}
                  futureHealthFactor={healthFactor.future}
                />
              }
            />
          )}
          <MarketSummaryRow
            label={t("trade:market.summary.routes.label")}
            content={<TradeRoutes swapType={swap.type} routes={swap.swaps} />}
          />
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
