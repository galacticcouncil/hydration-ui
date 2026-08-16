import {
  CANDLE_BUCKETS,
  CandleBucket,
  invertCandle,
  liveCandle as toLiveCandle,
  PairCandle,
  pairCandlesInfiniteQuery,
  pairReferencePriceQuery,
  PriceChangePeriod,
} from "@galacticcouncil/indexer/neckwork"
import { ArrowLeftRight } from "@galacticcouncil/ui/assets/icons"
import {
  AnimatedValue,
  Box,
  ChartValues,
  Chip,
  Flex,
  Icon,
  Paper,
  Text,
  ToggleGroup,
  ToggleGroupItem,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { CandlestickChart, LineChart } from "lucide-react"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/provider"
import { spotPriceQuery } from "@/api/spotPrice"
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
import { useRpcProvider } from "@/providers/rpcProvider"

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
  const { getAssetWithFallback, getErc20AToken, isStableSwap } = useAssets()
  const rpc = useRpcProvider()

  const [isInverted, setIsInverted] = useState(false)
  const [changePeriod, setChangePeriod] = useState<PriceChangePeriod>("24h")

  const baseAssetId = isInverted ? assetIn : assetOut
  const quoteAssetId = isInverted ? assetOut : assetIn

  const resolveChartAssetId = (id: string) => {
    const aToken = getErc20AToken(id)
    if (!aToken) return id
    const underlying = getAssetWithFallback(aToken.underlyingAssetId)
    if (isStableSwap(underlying)) return id
    return aToken.underlyingAssetId
  }

  const resolvedBaseAssetId = resolveChartAssetId(baseAssetId)
  const resolvedQuoteAssetId = resolveChartAssetId(quoteAssetId)
  const pairCollapsed = resolvedBaseAssetId === resolvedQuoteAssetId
  const chartBaseAssetId = pairCollapsed ? baseAssetId : resolvedBaseAssetId
  const chartQuoteAssetId = pairCollapsed ? quoteAssetId : resolvedQuoteAssetId

  const isFetchAligned = Number(chartQuoteAssetId) >= Number(chartBaseAssetId)
  const fetchAssetIn = isFetchAligned ? chartBaseAssetId : chartQuoteAssetId
  const fetchAssetOut = isFetchAligned ? chartQuoteAssetId : chartBaseAssetId
  const needsInvert = !isFetchAligned

  const {
    data,
    isLoading,
    isSuccess,
    isError,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    isPlaceholderData,
    fetchNextPage,
  } = useInfiniteQuery({
    ...pairCandlesInfiniteQuery(neckworkClient, {
      assetIn: fetchAssetIn,
      assetOut: fetchAssetOut,
      bucket: interval,
    }),
    placeholderData: keepPreviousData,
  })

  // refetch triggered by changing assets/interval, not by panning or invert
  const isRefetching = isFetching && !isFetchingNextPage

  // pages arrive newest-first; invert locally when display ≠ fetch orientation
  const candles = useMemo(() => {
    const series = (data?.pages ?? []).toReversed().flat()
    return needsInvert ? series.map(invertCandle) : series
  }, [data, needsInvert])

  // spot price is the live feed — refetched every block via the @block key
  const { data: spot } = useQuery(
    spotPriceQuery(rpc, chartBaseAssetId, chartQuoteAssetId),
  )
  const spotPrice = Number(spot?.spotPrice)

  // price `changePeriod` ago, in the same orientation as the displayed pair
  const { data: referencePrice } = useQuery(
    pairReferencePriceQuery(neckworkClient, {
      assetIn: fetchAssetIn,
      assetOut: fetchAssetOut,
      period: changePeriod,
    }),
  )

  const resetKey = `${baseAssetId}-${quoteAssetId}-${interval}`
  const liveRef = useRef<{ resetKey: string; candle: PairCandle } | null>(null)

  const live = useMemo(() => {
    // keepPreviousData leaves the prior pair's candles mounted while the new
    // query loads; spot already tracks the new pair. Seeding live OHLC from
    // that mismatch (e.g. HDX ~0.01 open + USDT ~1 close) draws a candle to 0.
    if (isPlaceholderData) {
      liveRef.current = null
      return null
    }

    const last = candles.at(-1)
    if (!last || !spotPrice || !isFinite(spotPrice)) return null

    // seed from the running live candle so high/low accumulate across ticks and
    // each new bucket opens at the previous close — the API candles don't
    // refetch while mounted, so they fall behind by one or more buckets
    const running = liveRef.current
    const sameSeries =
      running?.resetKey === resetKey && running.candle.time >= last.time
    // heal a live candle poisoned by a prior placeholder tick once real
    // series data arrives (low/high stuck on the previous pair's price)
    const consistentWithTip =
      !!running &&
      last.close > 0 &&
      running.candle.low > last.close * 0.5 &&
      running.candle.high < last.close * 2
    const seed = sameSeries && consistentWithTip ? running.candle : last

    const candle = toLiveCandle(seed, spotPrice, interval)
    liveRef.current = { resetKey, candle }

    return candle
  }, [candles, spotPrice, interval, resetKey, isPlaceholderData])

  const prices = useMemo(() => {
    if (!live) return candles

    return candles.at(-1)?.time === live.time
      ? candles.with(-1, live)
      : [...candles, live]
  }, [candles, live])

  const onReachStart = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const isEmpty = isSuccess && !candles.length

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
    isLiveValue,
  } = useTradeChartValues({
    prices,
    priceAssetId: chartQuoteAssetId,
    isEmpty,
    isError,
    isLoading,
  })

  const baseMeta = getAssetWithFallback(baseAssetId)
  const quoteMeta = getAssetWithFallback(quoteAssetId)

  const livePrice = prices.at(-1)?.close
  const reference =
    !referencePrice || isPlaceholderData
      ? null
      : needsInvert
        ? 1 / referencePrice
        : referencePrice
  const priceChange =
    reference && livePrice ? ((livePrice - reference) / reference) * 100 : null

  const periodLabel =
    changePeriod === "24h"
      ? t("chart.priceChange.24h")
      : t("chart.priceChange.7d")

  const chartValue = shouldShowValues ? (
    <Flex align="center" gap="s">
      <Text fs={["p3", "p1"]} fw={600} fontVariantNumeric="tabular-nums">
        <AnimatedValue
          key={`${baseAssetId}-${quoteAssetId}`}
          value={value}
          valueFlash={isLiveValue}
          format={(value) => t("number", { value })}
        />
        {` ${quoteMeta.symbol}`}
      </Text>
      {priceChange !== null && (
        <Tooltip
          text={t("chart.priceChange.tooltip", {
            period: periodLabel,
          })}
          size="small"
          side="top"
          asChild
        >
          <Chip
            as="button"
            rounded
            size="small"
            variant={priceChange < 0 ? "red" : "green"}
            sx={{
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontVariantNumeric: "tabular-nums",
            }}
            onClick={() =>
              setChangePeriod(changePeriod === "24h" ? "7d" : "24h")
            }
          >
            {`${t("percent", {
              value: priceChange,
              signDisplay: "always",
            })} / ${periodLabel}`}
          </Chip>
        </Tooltip>
      )}
    </Flex>
  ) : undefined

  const formatPrice = (price: number) => t("number", { value: price })

  const chartDisplayValue = shouldShowValues ? (
    <Box display={["none", null, null, null, "block"]}>
      <Flex gap="s">
        <Text fs="p6" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
          <Text as="span" color={getToken("text.low")}>
            O
          </Text>{" "}
          {formatPrice(open)}
        </Text>
        <Text fs="p6" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
          <Text as="span" color={getToken("text.low")}>
            H
          </Text>{" "}
          {formatPrice(high)}
        </Text>
        <Text fs="p6" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
          <Text as="span" color={getToken("text.low")}>
            L
          </Text>{" "}
          {formatPrice(low)}
        </Text>
        <Text fs="p6" fontVariantNumeric="tabular-nums" whiteSpace="nowrap">
          <Text as="span" color={getToken("text.low")}>
            C
          </Text>{" "}
          {formatPrice(value)}
        </Text>
      </Flex>
      <Text
        fs="p6"
        visibility={volume > 0 ? "visible" : "hidden"}
        whiteSpace="nowrap"
      >
        <Text as="span" color={getToken("text.low")} transform="uppercase">
          {t("vol")}
        </Text>{" "}
        {formattedVolumePrice}
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
          <Flex align="center" gap="s" ml="auto">
            <Tooltip
              text={t("chart.invert", {
                pair: `${baseMeta.symbol}/${quoteMeta.symbol}`,
              })}
              size="small"
              side="top"
              asChild
            >
              <Box as="span" sx={{ display: "flex" }}>
                <SChartInvertButton
                  size="small"
                  variant="tertiary"
                  outline
                  aria-label={t("chart.invert", {
                    pair: `${baseMeta.symbol}/${quoteMeta.symbol}`,
                  })}
                  onClick={() => setIsInverted((prev) => !prev)}
                >
                  <Icon
                    component={ArrowLeftRight}
                    size="s"
                    sx={{
                      transform: isInverted ? "scaleX(-1)" : "scaleX(1)",
                      transition: getToken("transitions.transform"),
                    }}
                  />
                </SChartInvertButton>
              </Box>
            </Tooltip>
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
                <Tooltip
                  key={type}
                  text={t(`chart.chartType.${type}`)}
                  size="small"
                  asChild
                  side="top"
                >
                  <Box as="span" sx={{ display: "flex" }}>
                    <ToggleGroupItem
                      value={type}
                      aria-label={t(`chart.chartType.${type}`)}
                    >
                      <Icon component={chartTypeIcons[type]} size="s" />
                    </ToggleGroupItem>
                  </Box>
                </Tooltip>
              ))}
            </ToggleGroup>
          </Flex>

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
            liveCandle={live}
            type={chartType}
            resetKey={resetKey}
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
