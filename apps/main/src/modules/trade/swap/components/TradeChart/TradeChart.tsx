import { pairReferencePriceQuery } from "@galacticcouncil/indexer/neckwork"
import {
  Box,
  ChartValues,
  Flex,
  Paper,
  ResponsiveScope,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/neckwork"
import { ChartState } from "@/components/ChartState"
import { CandleChart } from "@/modules/trade/swap/components/TradeChart/CandleChart"
import { usePairCandleSeries } from "@/modules/trade/swap/components/TradeChart/hooks/usePairCandleSeries"
import {
  SChartHeader,
  SChartValues,
} from "@/modules/trade/swap/components/TradeChart/TradeChart.styled"
import { TradeChartControls } from "@/modules/trade/swap/components/TradeChart/TradeChartControls"
import { TradeChartPrice } from "@/modules/trade/swap/components/TradeChart/TradeChartPrice"
import { useTradeChartValues } from "@/modules/trade/swap/SwapPage.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useTradeChartSettings } from "@/states/tradeSettings"

type PairChartProps = {
  readonly height: number
  readonly assetIn: string
  readonly assetOut: string
  readonly variant?: "trade" | "pool"
}

export const TradeChart: React.FC<{ readonly height: number }> = ({
  height,
}) => {
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  return (
    <Paper p="xl">
      <PairChart height={height} assetIn={assetIn} assetOut={assetOut} />
    </Paper>
  )
}

export const PairChart: React.FC<PairChartProps> = ({
  height,
  assetIn,
  assetOut,
  variant = "trade",
}) => {
  const { t } = useTranslation()
  const isPool = variant === "pool"
  const {
    interval,
    chartType: selectedChartType,
    changePeriod,
    setChangePeriod,
  } = useTradeChartSettings()
  const chartType = isPool ? "line" : selectedChartType
  const { getAssetWithFallback } = useAssets()

  const [isInverted, setIsInverted] = useState(false)

  const baseAssetId = isInverted ? assetIn : assetOut
  const quoteAssetId = isInverted ? assetOut : assetIn

  const {
    series,
    spotPrice,
    quoteAssetId: priceAssetId,
    pair,
    isPegged,
    isLoading,
    isError,
    isEmpty,
    isRefetching,
    isPlaceholderData,
    onReachStart,
  } = usePairCandleSeries(baseAssetId, quoteAssetId, interval)

  const { data: referencePrice } = useQuery({
    ...pairReferencePriceQuery(neckworkClient, {
      assetIn: pair.assetIn,
      assetOut: pair.assetOut,
      period: changePeriod,
    }),
    enabled: !isPegged,
  })

  const resetKey = `${baseAssetId}-${quoteAssetId}-${interval}`

  const {
    onCrosshairMove,
    value,
    open,
    high,
    low,
    volume,
    formattedAssetPrice,
    formattedVolumePrice,
    isAssetPriceValid,
    isVolumePriceValid,
    shouldShowValues,
    isLoadingValues,
    isLiveValue,
  } = useTradeChartValues({
    prices: series,
    priceAssetId,
    isEmpty,
    isError,
    isLoading,
  })

  const baseMeta = getAssetWithFallback(baseAssetId)
  const quoteMeta = getAssetWithFallback(quoteAssetId)

  const hasSpot = isFinite(spotPrice) && spotPrice > 0
  const reference =
    !referencePrice || !hasSpot
      ? null
      : pair.invert
        ? 1 / referencePrice
        : referencePrice
  const priceChange =
    reference && hasSpot ? ((spotPrice - reference) / reference) * 100 : null

  const chartValue = shouldShowValues ? (
    <TradeChartPrice
      value={isLiveValue && hasSpot ? spotPrice : value}
      symbol={quoteMeta.symbol}
      animationKey={`${baseAssetId}-${quoteAssetId}`}
      isLiveValue={isLiveValue}
      priceChange={priceChange}
      changePeriod={changePeriod}
      onChangePeriodToggle={() =>
        setChangePeriod(changePeriod === "24h" ? "7d" : "24h")
      }
      asCurrency={isPool}
    />
  ) : undefined

  const chartDisplayValue = shouldShowValues ? (
    chartType === "line" ? (
      <SChartValues>
        {/* the pool variant already shows the price in the headline */}
        {!isPool && (
          <Text
            fs="p6"
            lh={1.3}
            fontVariantNumeric="tabular-nums"
            visibility={isAssetPriceValid ? "visible" : "hidden"}
          >
            {t("price")}: {formattedAssetPrice}
          </Text>
        )}
        <Text
          fs="p6"
          lh={1.3}
          visibility={!isLiveValue && volume > 0 ? "visible" : "hidden"}
          whiteSpace="nowrap"
        >
          {t("vol")}: {formattedVolumePrice}
        </Text>
      </SChartValues>
    ) : (
      <SChartValues>
        <Flex gap="s">
          {(
            [
              ["O", open],
              ["H", high],
              ["L", low],
              ["C", value],
            ] as const
          ).map(([label, price]) => (
            <Text
              key={label}
              fs="p6"
              lh={1.3}
              fontVariantNumeric="tabular-nums"
              whiteSpace="nowrap"
            >
              <Text as="span" color={getToken("text.low")}>
                {label}
              </Text>{" "}
              {t("number", { value: price })}
            </Text>
          ))}
        </Flex>
        <Text
          fs="p6"
          lh={1.3}
          visibility={
            !isLiveValue && isVolumePriceValid && volume > 0
              ? "visible"
              : "hidden"
          }
          whiteSpace="nowrap"
        >
          <Text as="span" color={getToken("text.low")} transform="uppercase">
            {t("vol")}
          </Text>{" "}
          {formattedVolumePrice}
        </Text>
      </SChartValues>
    )
  ) : undefined

  const chartHeader = (
    <ResponsiveScope>
      <SChartHeader>
        <ChartValues
          sx={{ position: "relative" }}
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={shouldShowValues && isLoadingValues}
        />
        <TradeChartControls
          pair={`${baseMeta.symbol}/${quoteMeta.symbol}`}
          isInverted={isInverted}
          onInvert={() => setIsInverted((prev) => !prev)}
          showPairControls={!isPool}
        />
      </SChartHeader>
    </ResponsiveScope>
  )

  const chartBody = (
    <Box sx={{ height }}>
      <ChartState
        sx={{ height }}
        isError={isError}
        isLoading={isLoading}
        isEmpty={isEmpty}
      >
        <CandleChart
          height={height}
          bucket={interval}
          candles={series}
          type={chartType}
          resetKey={resetKey}
          isRefetching={isRefetching}
          isPlaceholderData={isPlaceholderData}
          onCrosshairMove={onCrosshairMove}
          onReachStart={onReachStart}
        />
      </ChartState>
    </Box>
  )

  if (isPool) {
    return (
      <Flex direction="column" flex={1} sx={{ minHeight: 0 }}>
        <Box sx={{ flexShrink: 0 }}>{chartHeader}</Box>
        <Flex
          flex={1}
          direction="column"
          justify="flex-end"
          sx={{ minHeight: 0 }}
        >
          {chartBody}
        </Flex>
      </Flex>
    )
  }

  return (
    <>
      {chartHeader}
      {chartBody}
    </>
  )
}
