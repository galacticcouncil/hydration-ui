import { invertCandle, PairCandle } from "@galacticcouncil/indexer/neckwork"
import {
  Box,
  Flex,
  Paper,
  ResponsiveScope,
  Text,
} from "@galacticcouncil/ui/components"
import { ChartValues } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import React, { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { ChartState } from "@/components/ChartState"
import { CandleChart } from "@/modules/trade/swap/components/TradeChartNeckwork/CandleChart"
import { TradeChartControls } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartControls"
import {
  SChartHeader,
  SChartValues,
} from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.styled"
import { TradeChartPrice } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartPrice"
import { useXcSwapCandles } from "@/modules/trade/swap/components/XcSwapChart/XcSwapChart.data"
import { useTradeChartValues } from "@/modules/trade/swap/SwapPage.utils"
import { useTradeChartSettings } from "@/states/tradeSettings"

const PRICE_CHANGE_SECONDS = {
  "24h": 24 * 60 * 60,
  "7d": 7 * 24 * 60 * 60,
}

const priceChangeOverPeriod = (
  candles: ReadonlyArray<PairCandle>,
  seconds: number,
) => {
  const latest = candles.at(-1)
  if (!latest) return null

  const reference = candles.findLast(
    (candle) => candle.time <= latest.time - seconds,
  )
  if (!reference || reference.close <= 0) return null

  return ((latest.close - reference.close) / reference.close) * 100
}

type XcSwapChartProps = {
  readonly height: number
  // Hydration source asset (priced against USDT on the indexer).
  readonly sellAssetId: string
  readonly sellSymbol: string
  // Cross-chain destination on Kraken: "near" | "zec".
  readonly destPlatform: string
  readonly destSymbol: string
}

export const XcSwapChart: React.FC<XcSwapChartProps> = ({
  height,
  sellAssetId,
  sellSymbol,
  destPlatform,
  destSymbol,
}) => {
  const { t } = useTranslation()
  const { interval, chartType, changePeriod, setChangePeriod } =
    useTradeChartSettings()

  const [isInverted, setIsInverted] = useState(false)

  const {
    candles: rawCandles,
    onReachStart,
    isLoading,
    isSuccess,
    isError,
    isPlaceholderData,
    isRefetching,
  } = useXcSwapCandles({ sellAssetId, destPlatform, bucket: interval })

  // default is X per Q ("1 destAsset = value sellAsset"), matching the
  // on-chain chart; the toggle flips it to Q per X
  const candles = useMemo(
    () => (isInverted ? rawCandles.map(invertCandle) : rawCandles),
    [rawCandles, isInverted],
  )

  const baseSymbol = isInverted ? sellSymbol : destSymbol
  const quoteSymbol = isInverted ? destSymbol : sellSymbol

  const isEmpty = isSuccess && !candles.length

  const {
    onCrosshairMove,
    value,
    open,
    high,
    low,
    formattedAssetPrice,
    isAssetPriceValid,
    shouldShowValues,
    isLoadingValues,
    isLiveValue,
  } = useTradeChartValues({
    prices: candles,
    priceAssetId: sellAssetId,
    isEmpty,
    isError,
    isLoading,
  })

  const priceChange = useMemo(
    () => priceChangeOverPeriod(candles, PRICE_CHANGE_SECONDS[changePeriod]),
    [candles, changePeriod],
  )

  const chartValue = shouldShowValues ? (
    <TradeChartPrice
      value={value}
      symbol={quoteSymbol}
      animationKey={`${sellAssetId}-${destPlatform}`}
      isLiveValue={isLiveValue}
      priceChange={priceChange}
      changePeriod={changePeriod}
      onChangePeriodToggle={() =>
        setChangePeriod(changePeriod === "24h" ? "7d" : "24h")
      }
    />
  ) : undefined

  // the USD line prices one unit of the base asset. Inverted, the base is the
  // Hydration sell asset, so it would just restate that asset's own price —
  // constant across the series and not worth the row.
  const chartDisplayValue = shouldShowValues ? (
    chartType === "line" ? (
      <SChartValues>
        <Text
          fs="p6"
          lh={1.3}
          fontVariantNumeric="tabular-nums"
          visibility={!isInverted && isAssetPriceValid ? "visible" : "hidden"}
        >
          {t("price")}: {formattedAssetPrice}
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
      </SChartValues>
    )
  ) : undefined

  return (
    <Paper p="xl">
      <ResponsiveScope>
        <SChartHeader>
          <ChartValues
            sx={{ position: "relative" }}
            value={chartValue}
            displayValue={chartDisplayValue}
            isLoading={shouldShowValues && isLoadingValues}
          />
          <TradeChartControls
            pair={`${baseSymbol}/${quoteSymbol}`}
            isInverted={isInverted}
            onInvert={() => setIsInverted((prev) => !prev)}
          />
        </SChartHeader>
      </ResponsiveScope>
      <Box sx={{ height }}>
        <ChartState
          sx={{ height }}
          isError={isError}
          isLoading={isLoading}
          isEmpty={isEmpty}
        >
          <CandleChart
            height={height}
            candles={candles}
            liveCandle={null}
            type={chartType}
            resetKey={`${sellAssetId}-${destPlatform}-${interval}-${isInverted}`}
            isRefetching={isRefetching}
            isPlaceholderData={isPlaceholderData}
            onCrosshairMove={onCrosshairMove}
            onReachStart={onReachStart}
          />
        </ChartState>
      </Box>
    </Paper>
  )
}
