import {
  invertCandle,
  liveCandle as toLiveCandle,
  PairCandle,
  pairCandlesInfiniteQuery,
  pairReferencePriceQuery,
  PriceChangePeriod,
} from "@galacticcouncil/indexer/neckwork"
import {
  Box,
  ChartValues,
  Flex,
  Paper,
  ResponsiveScope,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"
import { useSearch } from "@tanstack/react-router"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { neckworkClient } from "@/api/provider"
import { spotPriceQuery } from "@/api/spotPrice"
import { ChartState } from "@/components/ChartState"
import { CandleChart } from "@/modules/trade/swap/components/TradeChartNeckwork/CandleChart"
import { TradeChartControls } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartControls"
import {
  SChartHeader,
  SChartOhlc,
} from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartNeckwork.styled"
import { TradeChartPrice } from "@/modules/trade/swap/components/TradeChartNeckwork/TradeChartPrice"
import { useTradeChartValues } from "@/modules/trade/swap/SwapPage.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

type TradeChartNeckworkProps = {
  readonly height: number
}

export const TradeChartNeckwork: React.FC<TradeChartNeckworkProps> = ({
  height,
}) => {
  const { t } = useTranslation()
  const { assetIn, assetOut, interval, chartType } = useSearch({
    from: "/trade/_history",
  })
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

  const chartValue = shouldShowValues ? (
    <TradeChartPrice
      value={value}
      symbol={quoteMeta.symbol}
      animationKey={`${baseAssetId}-${quoteAssetId}`}
      isLiveValue={isLiveValue}
      priceChange={priceChange}
      changePeriod={changePeriod}
      onChangePeriodToggle={() =>
        setChangePeriod(changePeriod === "24h" ? "7d" : "24h")
      }
    />
  ) : undefined

  const formatPrice = (price: number) => t("number", { value: price })

  const chartDisplayValue = shouldShowValues ? (
    <SChartOhlc>
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
    </SChartOhlc>
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
            pair={`${baseMeta.symbol}/${quoteMeta.symbol}`}
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
