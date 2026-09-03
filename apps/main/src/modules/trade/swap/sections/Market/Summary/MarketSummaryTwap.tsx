import { HealthFactorChange } from "@galacticcouncil/money-market/components"
import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { math } from "@galacticcouncil/sdk-next"
import { Trade, TradeOrder } from "@galacticcouncil/sdk-next/sor"
import {
  Box,
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
import { useRpcProvider } from "@/providers/rpcProvider"
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
  const { featureFlags } = useRpcProvider()

  // Intent TWAP (Dca intent) has no fixed output floor — per-slice
  // protection is the pallet's adaptive oracle limit, so the headline
  // amount is an estimate for BOTH directions (there is no guaranteed-Buy
  // variant on intents).
  const isIce = featureFlags.isIceEnabled

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

  // Every twap executes as a sell, so the received side carries the fee and
  // the price protection
  const tradeFeeAsset = buyAsset
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
  )

  const [twapPrice, swapPrice, twapPriceHuman, twapPriceAsset] = (() => {
    if (!sellAsset || !buyAsset) {
      return [0n, 0n, "0", null]
    }

    if (isIce) {
      // Raw SOR estimate — settles at market, nothing to pad or floor.
      const twapPrice = twap.amountOut
      return [twapPrice, 0n, scaleHuman(twapPrice, buyAsset.decimals), buyAsset]
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

  const tradeAmount = twap.amountOut

  const tradeFeePct = Big(twap.tradeFee.toString())
    .div(tradeAmount.toString())
    .mul(100)
    .toNumber()

  const [
    ,
    mediumLow = Number.MAX_SAFE_INTEGER,
    mediumHigh = Number.MAX_SAFE_INTEGER,
  ] = getTradeFeeIntervals(0, 0)

  const twapDiff = isIce
    ? 0
    : math.calculateDiffToRef(BigInt(twapPrice), BigInt(swapPrice))
  const twapDiffAbs = Math.abs(twapDiff)
  const twapSymbol = twapDiff >= 0 ? "+" : "-"

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
            settingsSection="split"
          />
          <CalculatedAmountSummaryRow
            // an intent TWAP settles at market, so there is no guaranteed
            // minimum to quote - only an estimate
            label={
              isIce
                ? t("trade:market.summary.estReceived")
                : t("trade:market.summary.minReceived")
            }
            tooltip={
              isIce
                ? t("trade:market.summary.estReceived.tooltip")
                : t("trade:market.summary.minReceived.tooltip")
            }
            amount={
              isIce ? (
                `~${t("currency", {
                  value: twapPriceHuman,
                  symbol: twapPriceAsset.symbol,
                })}`
              ) : (
                <SummaryRowValue>
                  <span>
                    {t("currency", {
                      value: twapPriceHuman,
                      symbol: twapPriceAsset.symbol,
                    })}
                  </span>
                  <span sx={{ color: getToken("colors.skyBlue.500") }}>
                    {` (${twapSymbol}${t("percent", { value: twapDiffAbs })})`}
                  </span>
                </SummaryRowValue>
              )
            }
            amountDisplay={twapPriceDisplay}
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
                <SummaryRowValue>
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
    </Box>
  )
}
