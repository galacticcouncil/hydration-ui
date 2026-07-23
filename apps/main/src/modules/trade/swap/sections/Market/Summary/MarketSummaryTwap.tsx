import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { math } from "@galacticcouncil/sdk-next"
import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/sor"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Summary,
  SummaryRowDisplayValue,
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
import { useTwapFee } from "@/modules/trade/swap/sections/Market/lib/useTwapFee"
import { CalculatedAmountSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/CalculatedAmountSummaryRow"
import { PriceImpactSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/PriceImpactSummaryRow"
import { TradeLimitSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/TradeLimitSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"
import { getTradeFeeIntervals } from "@/utils/trade"

type Props = {
  readonly swap: Trade
  readonly twap: TradeOrder
  readonly healthFactor: HealthFactorResult | undefined
}

export const MarketSummaryTwap: FC<Props> = ({ swap, twap, healthFactor }) => {
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

  const { data: transactionFee, isLoading: isTransactionFeeLoading } =
    useTwapFee(twap)
  const transactionCosts = transactionFee?.feeEstimate || "0"

  const isBuy = twap.type === TradeOrderType.TwapBuy
  const tradeFeeAsset = isBuy ? sellAsset : buyAsset
  const tradeFee = tradeFeeAsset
    ? scaleHuman(twap.tradeFee, tradeFeeAsset.decimals)
    : "0"

  const [tradeFeeDisplay] = useDisplayAssetPrice(
    tradeFeeAsset?.id ?? "",
    tradeFee,
    { maximumFractionDigits: null },
  )

  const transactionFeeAsset = getAssetWithFallback(
    transactionFee?.feeAssetId ?? "",
  )

  const [transactionCostsDisplay] = useDisplayAssetPrice(
    transactionFee?.feeAssetId ?? "",
    transactionCosts,
    { maximumFractionDigits: null },
  )

  const [twapPrice, swapPrice, twapPriceHuman, twapPriceAsset] = (() => {
    if (!sellAsset || !buyAsset) {
      return [0n, 0n, "0", null]
    }

    if (twap.type === TradeOrderType.TwapBuy) {
      const twapPrice =
        twap.amountIn + calculateSlippage(twap.amountIn, twapSlippage)
      const twapPriceHuman = scaleHuman(twapPrice, sellAsset.decimals)

      const swapPrice =
        swap.amountIn + calculateSlippage(swap.amountIn, swapSlippage)

      return [twapPrice, swapPrice, twapPriceHuman, sellAsset]
    }

    const twapPrice =
      twap.amountOut - calculateSlippage(twap.amountOut, twapSlippage)
    const twapPriceHuman = scaleHuman(twapPrice, buyAsset.decimals)

    const swapPrice =
      swap.amountOut - calculateSlippage(swap.amountOut, swapSlippage)

    return [twapPrice, swapPrice, twapPriceHuman, buyAsset]
  })()

  const [twapPriceDisplay, { isLoading: twapPriceDisplayLoading }] =
    useDisplayAssetPrice(twapPriceAsset?.id ?? "", twapPriceHuman)

  if (!sellAsset || !buyAsset || !tradeFeeAsset || !twapPriceAsset) {
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

  const twapDiff = math.calculateDiffToRef(BigInt(twapPrice), BigInt(swapPrice))
  const twapDiffAbs = Math.abs(twapDiff)

  return (
    <Box>
      {healthFactor?.isSignificantChange && (
        <>
          <SwapSummaryRow
            label={t("healthFactor")}
            content={<HealthFactorChange {...healthFactor} />}
          />
          <SwapSectionSeparator />
        </>
      )}
      <CollapsibleRoot
        open={isSummaryExpanded}
        onOpenChange={changeSummaryExpanded}
      >
        <Summary separator={<SwapSectionSeparator />}>
          <TradeLimitSummaryRow
            tradeLimit={twapSlippage}
            priceImpact={swap.priceImpactPct}
          />
          <CalculatedAmountSummaryRow
            label={
              isBuy
                ? t("trade:market.summary.maxSent")
                : t("trade:market.summary.minReceived")
            }
            tooltip={
              isBuy
                ? t("trade:market.summary.maxSent.tooltip")
                : t("trade:market.summary.minReceived.tooltip")
            }
            amount={
              <SummaryRowValue>
                <span>
                  {t("currency", {
                    value: twapPriceHuman,
                    symbol: twapPriceAsset.symbol,
                  })}
                </span>
                <span sx={{ color: getToken("text.tint.quart") }}>
                  {` (${t("percent", { value: twapDiffAbs, signDisplay: "always" })})`}
                </span>
              </SummaryRowValue>
            }
            amountDisplay={
              twapPriceDisplay ? `(${twapPriceDisplay})` : undefined
            }
            isLoading={twapPriceDisplayLoading}
            isExpanded={isSummaryExpanded}
            onIsExpandedChange={changeSummaryExpanded}
          />
        </Summary>
        <CollapsibleContent asChild>
          <Summary separator={<SwapSectionSeparator />} withLeadingSeparator>
            <PriceImpactSummaryRow
              label={t("trade:market.summary.priceImpact.single")}
              priceImpact={twap.tradeImpactPct}
            />
            <PriceImpactSummaryRow
              label={t("trade:market.summary.priceImpact.split")}
              priceImpact={swap.priceImpactPct}
            />
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
              loading={isTransactionFeeLoading}
              content={
                <Flex gap="s" align="center" justify="flex-end">
                  <SummaryRowValue>
                    {t("currency", {
                      value: transactionCosts,
                      symbol: transactionFeeAsset.symbol,
                    })}
                  </SummaryRowValue>
                  <SummaryRowDisplayValue>
                    ({transactionCostsDisplay})
                  </SummaryRowDisplayValue>
                </Flex>
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
    </Box>
  )
}
