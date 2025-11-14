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
import { produce } from "immer"
import { FC } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { TradeOrderType } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { DynamicFee } from "@/components/DynamicFee"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { TradeRoutes } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { CalculatedAmountSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/CalculatedAmountSummaryRow"
import { PriceImpactSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/PriceImpactSummaryRow"
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

  const { update: updateTradeSettings, ...tradeSettings } = useTradeSettings()

  const {
    general: { isSummaryExpanded },
    swap: {
      single: { swapSlippage },
      split: { twapSlippage },
    },
  } = tradeSettings

  const changeSummaryExpanded = (isSummaryExpanded: boolean) =>
    updateTradeSettings(
      produce(tradeSettings, (draft) => {
        draft.general.isSummaryExpanded = isSummaryExpanded
      }),
    )

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

  const [tradeFeeDisplay] = useDisplayAssetPrice(
    tradeFeeAsset?.id ?? "",
    tradeFee,
  )

  const transactionFeeAsset = getAssetWithFallback(
    transactionFee?.feeAssetId ?? "",
  )

  const [transactionCostsDisplay] = useDisplayAssetPrice(
    transactionFee?.feeAssetId ?? "",
    transactionCosts,
  )

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

  return (
    <CollapsibleRoot
      open={isSummaryExpanded}
      onOpenChange={changeSummaryExpanded}
    >
      {isBuy ? (
        <CalculatedAmountSummaryRow
          label={t("trade:market.summary.maxSent")}
          tooltip={t("trade:market.summary.maxSent.tooltip")}
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
          isExpanded={!isSummaryExpanded}
          onIsExpandedChange={changeSummaryExpanded}
        />
      ) : (
        <CalculatedAmountSummaryRow
          label={t("trade:market.summary.minReceived")}
          tooltip={t("trade:market.summary.minReceived.tooltip")}
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
          isExpanded={!isSummaryExpanded}
          onIsExpandedChange={changeSummaryExpanded}
        />
      )}
      <CollapsibleContent asChild>
        <Summary separator={<SwapSectionSeparator />} withLeadingSeparator>
          <PriceImpactSummaryRow priceImpact={swap.priceImpactPct} />
          <SwapSummaryRow
            label={t("trade:market.summary.estTradeFees")}
            content={
              <DynamicFee
                amount={tradeFeeDisplay}
                value={tradeFeePct}
                rangeLow={mediumLow}
                rangeHigh={mediumHigh}
              />
            }
            tooltip={t("trade:market.summary.estTradeFees.tooltip")}
          />
          <SwapSummaryRow
            label={t("trade:market.summary.transactionCosts")}
            content={
              <SummaryRowValue fw={500} fs="p4" lh={1.2}>
                {transactionCostsDisplay} (
                {t("currency", {
                  value: transactionCosts,
                  symbol: transactionFeeAsset.symbol,
                })}
                )
              </SummaryRowValue>
            }
            tooltip={t("trade:market.summary.transactionCosts.tooltip")}
          />
          <SwapSummaryRow
            label={t("trade:market.summary.routes.label")}
            content={
              <TradeRoutes
                swapType={swap.type}
                totalFeesDisplay={tradeFeeDisplay}
                routes={swap.swaps}
              />
            }
          />
        </Summary>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}
