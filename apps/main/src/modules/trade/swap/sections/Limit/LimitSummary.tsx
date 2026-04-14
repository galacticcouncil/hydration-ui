import { ChevronDown, ChevronUp } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Flex,
  Icon,
  Summary,
  SummaryRowDisplayValue,
  SummaryRowValue,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { formatNumber } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { produce } from "immer"
import { FC, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { iceFeeQuery } from "@/api/intents"
import { bestSellQuery, TradeType } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { useDisplayAssetPrice } from "@/components/AssetPrice"
import { DynamicFee } from "@/components/DynamicFee"
import { SwapSummaryRow } from "@/modules/trade/swap/components/SwapSummaryRow"
import { TradeRoutes } from "@/modules/trade/swap/components/TradeRoutes/TradeRoutes"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { PriceImpactSummaryRow } from "@/modules/trade/swap/sections/Market/Summary/PriceImpactSummaryRow"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { scaleHuman } from "@/utils/formatting"
import { getTradeFeeIntervals } from "@/utils/trade"

const ICE_FEE_PERMILL = 1_000_000

export const LimitSummary: FC = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { watch } = useFormContext<LimitFormValues>()

  const { update: updateTradeSettings, ...tradeSettings } = useTradeSettings()

  const {
    general: { isSummaryExpanded },
    swap: {
      single: { swapSlippage },
    },
  } = tradeSettings

  const changeSummaryExpanded = (isSummaryExpanded: boolean) =>
    updateTradeSettings(
      produce(tradeSettings, (draft) => {
        draft.general.isSummaryExpanded = isSummaryExpanded
      }),
    )

  const [sellAsset, buyAsset, sellAmount, buyAmount, limitPrice] = watch([
    "sellAsset",
    "buyAsset",
    "sellAmount",
    "buyAmount",
    "limitPrice",
  ])

  const { data: iceFee } = useQuery(iceFeeQuery(rpc))
  const { data: bestSellData } = useQuery(
    bestSellQuery(rpc, {
      assetIn: sellAsset?.id ?? "",
      assetOut: buyAsset?.id ?? "",
      amountIn: sellAmount || "0",
    }),
  )

  // Detect Market mode: limitPrice ≈ marketPrice (router quote rate)
  const isMarketMode = useMemo(() => {
    if (!bestSellData || !sellAmount || !buyAsset || !limitPrice) return false
    try {
      if (Big(sellAmount).lte(0) || Big(limitPrice).lte(0)) return false
      const amountOutHuman = scaleHuman(
        bestSellData.amountOut,
        buyAsset.decimals,
      )
      if (!amountOutHuman || Big(amountOutHuman).lte(0)) return false
      const mp = Big(amountOutHuman).div(sellAmount)
      // Within 0.1% = Market pill is active
      return mp.minus(Big(limitPrice)).abs().lt(mp.times(0.001))
    } catch {
      return false
    }
  }, [bestSellData, sellAmount, buyAsset, limitPrice])

  const iceFeePercent = useMemo(() => {
    if (iceFee === null || iceFee === undefined) return null
    try {
      return Big(iceFee).div(10_000).toFixed(2)
    } catch {
      return null
    }
  }, [iceFee])

  // Minimum received = amountOut - slippage (from raw bigint, same as swap page)
  // This is the amount_out that goes into the submit_intent extrinsic
  const minReceivedRaw = useMemo(() => {
    if (!bestSellData || !buyAsset) return null
    try {
      const min =
        bestSellData.amountOut -
        calculateSlippage(bestSellData.amountOut, swapSlippage)
      const minHuman = scaleHuman(min, buyAsset.decimals)
      if (!minHuman || Big(minHuman).lte(0)) return null
      return minHuman
    } catch {
      return null
    }
  }, [bestSellData, buyAsset, swapSlippage])

  const minReceived = minReceivedRaw ? formatNumber(minReceivedRaw) : null

  const [minReceivedDisplay, { isLoading: minReceivedDisplayLoading }] =
    useDisplayAssetPrice(buyAsset?.id ?? "", minReceivedRaw ?? "0")

  // After ICE fee = minimum received minus ICE protocol fee (deducted at resolution)
  // For Market orders: based on router quote (bestSellData)
  // For % orders: based on buyAmount (user-set price)
  const afterIceFeeRaw = useMemo(() => {
    if (iceFee === null || iceFee === undefined || !buyAmount) return null
    try {
      const base = isMarketMode && minReceivedRaw ? minReceivedRaw : buyAmount
      if (Big(base).lte(0)) return null
      const net = Big(base).times(
        Big(1).minus(Big(iceFee).div(ICE_FEE_PERMILL)),
      )
      return net.toString()
    } catch {
      return null
    }
  }, [isMarketMode, minReceivedRaw, buyAmount, iceFee])

  const afterIceFee = afterIceFeeRaw ? formatNumber(afterIceFeeRaw) : null

  const [afterIceFeeDisplay, { isLoading: afterIceFeeDisplayLoading }] =
    useDisplayAssetPrice(buyAsset?.id ?? "", afterIceFeeRaw ?? "0")

  // Trade fee (for Market mode expandable section)
  const tradeFee =
    bestSellData && buyAsset
      ? scaleHuman(bestSellData.tradeFee, buyAsset.decimals)
      : "0"

  const [tradeFeeDisplay] = useDisplayAssetPrice(buyAsset?.id ?? "", tradeFee, {
    maximumFractionDigits: null,
  })

  const tradeFeePct = bestSellData?.tradeFeePct ?? 0
  const tradeFeeRange = bestSellData?.tradeFeeRange ?? [0, 0]

  const [min, max] = tradeFeeRange
  const [
    ,
    mediumLow = Number.MAX_SAFE_INTEGER,
    mediumHigh = Number.MAX_SAFE_INTEGER,
  ] = getTradeFeeIntervals(min, max)

  if (!buyAsset || !buyAmount) return null

  // "Sell 10,000 HDX for 19.6744 HOLLAR at 0.001967 HOLLAR/HDX"
  const naturalSummary =
    sellAsset && sellAmount && limitPrice
      ? `Sell ${formatNumber(sellAmount)} ${sellAsset.symbol} for ${formatNumber(buyAmount)} ${buyAsset.symbol} at ${formatNumber(limitPrice)} ${buyAsset.symbol}/${sellAsset.symbol}`
      : null

  return (
    <Box>
      {naturalSummary && (
        <Flex pb="m">
          <Text fw={500} fs="p4" color={getToken("text.medium")}>
            {naturalSummary}
          </Text>
        </Flex>
      )}
      {/* Market mode: min received (plain) → after ICE fee (expandable trigger) → details */}
      {isMarketMode && bestSellData && (
        <>
          {minReceived && (
            <SwapSummaryRow
              sx={{ alignItems: "flex-start" }}
              label={t("trade:market.summary.minReceived")}
              loading={minReceivedDisplayLoading}
              content={
                <Flex align="center" gap="base">
                  <Flex direction="column" align="flex-end">
                    <SummaryRowValue>
                      {minReceived} {buyAsset.symbol}
                    </SummaryRowValue>
                    <SummaryRowDisplayValue>
                      {minReceivedDisplay}
                    </SummaryRowDisplayValue>
                  </Flex>
                  {/* Invisible spacer matching the chevron on the After ICE fee row so
                      both rows' value columns share the same right edge. */}
                  <Box sx={{ width: 24 }} />
                </Flex>
              }
              tooltip={t("trade:market.summary.minReceived.tooltip")}
            />
          )}
          <CollapsibleRoot
            open={isSummaryExpanded}
            onOpenChange={changeSummaryExpanded}
          >
            {afterIceFee && iceFeePercent !== null && (
              <SwapSummaryRow
                sx={{ alignItems: "flex-start" }}
                label={`After ICE fee (${iceFeePercent}%)`}
                loading={afterIceFeeDisplayLoading}
                content={
                  <Flex align="center" gap="base">
                    <Flex direction="column" align="flex-end">
                      <SummaryRowValue>
                        {t("currency", {
                          value: afterIceFeeRaw,
                          symbol: buyAsset.symbol,
                        })}
                      </SummaryRowValue>
                      <SummaryRowDisplayValue>
                        {afterIceFeeDisplay}
                      </SummaryRowDisplayValue>
                    </Flex>
                    <Icon
                      component={isSummaryExpanded ? ChevronUp : ChevronDown}
                      size="l"
                      color={getToken("icons.onContainer")}
                    />
                  </Flex>
                }
                onClick={(e) => {
                  e.preventDefault()
                  changeSummaryExpanded(!isSummaryExpanded)
                }}
                tooltip={t("trade:limit.afterIceFee.tooltip")}
              />
            )}
            <CollapsibleContent asChild>
              <Summary
                separator={<SwapSectionSeparator />}
                withLeadingSeparator
              >
                <PriceImpactSummaryRow
                  priceImpact={bestSellData.priceImpactPct}
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
                  label={t("trade:market.summary.routes.label")}
                  content={
                    <TradeRoutes
                      swapType={bestSellData.type as TradeType}
                      totalFeesDisplay={tradeFeeDisplay}
                      routes={bestSellData.swaps}
                    />
                  }
                />
              </Summary>
            </CollapsibleContent>
          </CollapsibleRoot>
        </>
      )}

      {/* After ICE fee for non-Market orders (no expandable section) */}
      {!isMarketMode && afterIceFee && iceFeePercent !== null && (
        <SwapSummaryRow
          label={`After ICE fee (${iceFeePercent}%)`}
          content={
            <SummaryRowValue>
              {afterIceFee} {buyAsset.symbol}
            </SummaryRowValue>
          }
        />
      )}
    </Box>
  )
}
