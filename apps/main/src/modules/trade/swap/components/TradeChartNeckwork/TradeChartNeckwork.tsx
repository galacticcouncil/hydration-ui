import {
  CANDLE_BUCKETS,
  CandleBucket,
  invertCandle,
  pairCandlesInfiniteQuery,
} from "@galacticcouncil/indexer/neckwork"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  AnimatedValue,
  Box,
  ChartValues,
  Flex,
  Icon,
  Paper,
  Separator,
  Text,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { CandlestickChart, LineChart } from "lucide-react"
import React, { useCallback, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/provider"
import { ChartState } from "@/components/ChartState"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import { SChartInvertButton } from "@/modules/trade/swap/components/TradeChart/TradeChart.styled"
import { CandleChart } from "@/modules/trade/swap/components/TradeChartNeckwork/CandleChart"
import { TRADE_CHART_TYPES } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.utils"
import { useTradeChartValues } from "@/modules/trade/swap/SwapPage.utils"
import { useAssets } from "@/providers/assetsProvider"

const intervalOptions = CANDLE_BUCKETS.map<
  ChartTimeRangeOptionType<CandleBucket>
>((bucket) => ({
  key: bucket,
  label: i18n.t(`chart.interval.${bucket}`),
}))

const chartTypeIcons = {
  candles: CandlestickChart,
  line: LineChart,
}

type TradeChartNeckworkProps = {
  readonly height: number
}

export const TradeChartNeckwork: React.FC<TradeChartNeckworkProps> = ({
  height,
}) => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch({ from: "/trade/_history" })
  const { assetIn, assetOut, interval, chartType } = search

  const [isInverted, setIsInverted] = useState(false)

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    fetchNextPage,
  } = useInfiniteQuery({
    ...pairCandlesInfiniteQuery(neckworkClient, {
      assetIn,
      assetOut,
      bucket: interval,
    }),
    placeholderData: keepPreviousData,
  })

  // refetch triggered by changing assetIn/assetOut/interval, not by panning
  const isRefetching = isFetching && !isFetchingNextPage

  // pages arrive newest-first; the chart wants a single ascending series
  const candles = useMemo(() => {
    const ascending = (data?.pages ?? []).toReversed().flat()
    return isInverted ? ascending.map(invertCandle) : ascending
  }, [data, isInverted])

  const onReachStart = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const isEmpty = isSuccess && !candles.length

  const baseAssetId = isInverted ? assetOut : assetIn
  const quoteAssetId = isInverted ? assetIn : assetOut

  const {
    onCrosshairMove,
    value,
    open,
    high,
    low,
    volume,
    formattedVolumePrice,
    shouldShowValues,
    isLoadingValues,
  } = useTradeChartValues({
    prices: candles,
    priceAssetId: quoteAssetId,
    isEmpty,
    isError,
    isLoading,
  })

  const { getAssetWithFallback } = useAssets()

  const baseMeta = getAssetWithFallback(baseAssetId)
  const quoteMeta = getAssetWithFallback(quoteAssetId)

  const chartValue = shouldShowValues ? (
    <Text fs={["p3", "p1"]} fw={600}>
      <AnimatedValue
        value={value}
        format={(value) => t("currency", { value, symbol: quoteMeta.symbol })}
      />
    </Text>
  ) : undefined

  const formatPrice = (price: number) => t("number", { value: price })

  const chartDisplayValue = shouldShowValues ? (
    <Box>
      <Flex gap="s">
        <Text fs="p5" fontVariantNumeric="tabular-nums">
          <Text as="span" color={getToken("text.low")}>
            O
          </Text>{" "}
          {formatPrice(open)}
        </Text>
        <Text fs="p5" fontVariantNumeric="tabular-nums">
          <Text as="span" color={getToken("text.low")}>
            H
          </Text>{" "}
          {formatPrice(high)}
        </Text>
        <Text fs="p5" fontVariantNumeric="tabular-nums">
          <Text as="span" color={getToken("text.low")}>
            L
          </Text>{" "}
          {formatPrice(low)}
        </Text>
        <Text fs="p5" fontVariantNumeric="tabular-nums">
          <Text as="span" color={getToken("text.low")}>
            C
          </Text>{" "}
          {formatPrice(value)}
        </Text>
      </Flex>
      <Text fs="p5" visibility={volume > 0 ? "visible" : "hidden"}>
        {t("vol")}: {formattedVolumePrice}
      </Text>
    </Box>
  ) : undefined

  return (
    <Paper p="xl">
      <Flex align="flex-start" gap="base" justify="space-between">
        <ChartValues
          sx={{ position: "relative" }}
          value={chartValue}
          displayValue={chartDisplayValue}
          isLoading={shouldShowValues && isLoadingValues}
        />
        <Flex align="center" gap="s" direction={["column", null, "row"]} wrap>
          <SChartInvertButton
            size="small"
            variant="tertiary"
            outline
            onClick={() => setIsInverted((prev) => !prev)}
          >
            <Icon component={ArrowLeftRight} size="m" />
            {baseMeta.symbol}/{quoteMeta.symbol}
          </SChartInvertButton>
          <ToggleGroup
            type="single"
            size="small"
            value={chartType}
            onValueChange={(value) =>
              value &&
              navigate({
                to: ".",
                search: { ...search, chartType: value },
                resetScroll: false,
              })
            }
          >
            {TRADE_CHART_TYPES.map((type) => (
              <ToggleGroupItem
                key={type}
                value={type}
                aria-label={t(`chart.chartType.${type}`)}
              >
                <Icon component={chartTypeIcons[type]} size="m" />
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          <Separator
            orientation="vertical"
            mx="base"
            sx={{
              height: "l",
              mt: "xs",
              display: ["none", null, null, null, "block"],
            }}
          />
          <ChartTimeRange
            sx={{ ml: "auto" }}
            options={intervalOptions}
            selectedOption={interval}
            onSelect={(option) =>
              navigate({
                to: ".",
                search: { ...search, interval: option.key },
                resetScroll: false,
              })
            }
          />
        </Flex>
      </Flex>
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
            type={chartType}
            resetKey={`${assetIn}-${assetOut}-${interval}`}
            isRefetching={isRefetching}
            onCrosshairMove={onCrosshairMove}
            onReachStart={onReachStart}
          />
        </ChartState>
      </Box>
    </Paper>
  )
}
