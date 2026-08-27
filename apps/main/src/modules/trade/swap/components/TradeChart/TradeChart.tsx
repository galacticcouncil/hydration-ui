import {
  invertCandle,
  liveCandle as toLiveCandle,
  PairCandle,
  pairCandlesInfiniteQuery,
  pairReferencePriceQuery,
  peggedCandles,
} from "@galacticcouncil/indexer/neckwork"
import {
  Box,
  ChartValues,
  Flex,
  Paper,
  ResponsiveScope,
  Text,
} from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import React, { useRef, useState } from "react"
import { useTranslation } from "react-i18next"

import { ChartState } from "@/components/ChartState"
import { CandleChart } from "@/modules/trade/swap/components/TradeChart/CandleChart"
import {
  ChartTimeRange,
  ChartTimeRangeOptionType,
} from "@/components/ChartTimeRange/ChartTimeRange"
import i18n from "@/i18n"
import { useTradeChartData } from "@/modules/trade/swap/components/TradeChart/TradeChart.data"
import { SChartInvertButton } from "@/modules/trade/swap/components/TradeChart/TradeChart.styled"
import { useTradeChartValues } from "@/modules/trade/swap/SwapPage.utils"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeChartSettings } from "@/states/tradeSettings"
import { isHydrationAssetId } from "@/utils/trade"

type PairChartProps = {
  readonly height: number
  readonly assetIn: string
  readonly assetOut: string
  readonly variant?: "trade" | "pool"
}

export const TradeChart: React.FC<TradeChartProps> = ({ height }) => {
  const { t } = useTranslation()
  const { assetIn, assetOut } = useSearch({ from: "/trade/_history" })

  const chartRef = useRef<TradingViewChartRef>(null)
  const [isInverted, setIsInverted] = useState(false)
  const [interval, setInterval] = useState<TradeChartTimeFrameType | "all">(
    "week",
  )

  const assetA = isInverted ? assetOut : assetIn
  const assetB = isInverted ? assetIn : assetOut

  const {
    prices,
    isLoading: isChartLoading,
    isSuccess,
    isError,
  } = useTradeChartData({
    assetInId: assetA,
    assetOutId: assetB,
    timeFrame: interval === "all" ? null : interval,
  })

  const isEmpty = isSuccess && !prices.length

  const {
    onCrosshairMove,
    value,
    volume,
    formattedAssetPrice,
    formattedVolumePrice,
    shouldShowValues,
    isLoadingValues,
  } = useTradeChartValues({
    prices,
    priceAssetId: assetA,
    isEmpty,
    isError,
    isLoading: isChartLoading,
  })

  const { getAssetWithFallback } = useAssets()

  const assetAMeta = getAssetWithFallback(assetA)
  const assetBMeta = getAssetWithFallback(assetB)

  const chartValue = shouldShowValues ? (
    <Text fs={["p3", "p1"]} fw={600}>
      <AnimatedValue
        value={value}
        format={(value) => t("currency", { value, symbol: assetAMeta.symbol })}
      />
    </Text>
  ) : undefined

  const chartDisplayValue = shouldShowValues ? (
    <Box>
      <Text fs="p5">
        {t("price")}: {formattedAssetPrice}
      </Text>
      <Text fs="p5" visibility={volume > 0 ? "visible" : "hidden"}>
        {t("vol")}: {formattedVolumePrice}
      </Text>
    </Box>
  ) : undefined

  return (
    <Paper p="xl">
      <Flex align="flex-start" gap="base" justify="space-between">
        <ChartValues
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
            sx={{ width: "auto", px: "m", gap: "s" }}
          >
            <Icon component={ArrowLeftRight} size="m" />
            {assetBMeta.symbol}/{assetAMeta.symbol}
          </SChartInvertButton>
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
            onSelect={(option) => {
              setInterval(option.key)
              chartRef.current?.resetZoom()
            }}
          />
        </Flex>
      </Flex>
      <Box sx={{ height }}>
        <ChartState
          sx={{ height }}
          isError={isError}
          isLoading={isChartLoading}
          isEmpty={isEmpty}
        >
          <TradingViewChart
            ref={chartRef}
            height={height}
            data={prices}
            hidePriceIndicator
            onCrosshairMove={onCrosshairMove}
          />
        </ChartState>
      </Box>
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
  const { getAssetWithFallback, getErc20AToken, isStableSwap } = useAssets()
  const rpc = useRpcProvider()

  const [isInverted, setIsInverted] = useState(false)

  const baseAssetId = isInverted ? assetIn : assetOut
  const quoteAssetId = isInverted ? assetOut : assetIn

  const resolveChartAssetId = (id: string) => {
    const gigaErc20 = GIGA_STABLESWAP_TO_ERC20[id]
    if (gigaErc20) return gigaErc20

    const aToken = getErc20AToken(id)
    if (!aToken) return id
    const underlying = getAssetWithFallback(aToken.underlyingAssetId)
    if (isStableSwap(underlying)) return id
    return aToken.underlyingAssetId
  }

  // an aToken and its underlying are always 1:1, so they never trade against
  // each other and the API has no candles for the pair. H-dollar tokens and
  // other USD-pegged stables likewise have no cross candles in Neckwork.
  const isPegged =
    baseAssetId === quoteAssetId ||
    getErc20AToken(baseAssetId)?.underlyingAssetId === quoteAssetId ||
    getErc20AToken(quoteAssetId)?.underlyingAssetId === baseAssetId ||
    (isUsdPeggedAsset(baseAssetId) && isUsdPeggedAsset(quoteAssetId))

  const chartBaseAssetId = isPegged
    ? baseAssetId
    : resolveChartAssetId(baseAssetId)
  const chartQuoteAssetId = isPegged
    ? quoteAssetId
    : resolveChartAssetId(quoteAssetId)

  const hasValidAssetIds =
    isHydrationAssetId(assetIn) && isHydrationAssetId(assetOut)

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
    enabled: !isPegged && hasValidAssetIds,
    placeholderData: keepPreviousData,
  })

  const isRefetching = isFetching && !isFetchingNextPage

  const candles = useMemo(() => {
    if (isPegged) return peggedCandles(interval)

    const series = (data?.pages ?? []).toReversed().flat()
    return needsInvert ? series.map(invertCandle) : series
  }, [data, needsInvert, isPegged, interval])

  const spotOptions = spotPriceQuery(rpc, chartQuoteAssetId, chartBaseAssetId)
  const { data: spot } = useQuery({
    ...spotOptions,
    enabled: !isPegged && hasValidAssetIds && spotOptions.enabled,
  })
  const spotPrice = (() => {
    const raw = spot?.spotPrice
    if (raw === undefined || raw === null) return Number.NaN
    try {
      const asBig = Big(raw)
      if (asBig.lte(0)) return Number.NaN
      return Big(1).div(asBig).toNumber()
    } catch {
      return Number.NaN
    }
  })()

  const { data: referencePrice } = useQuery({
    ...pairReferencePriceQuery(neckworkClient, {
      assetIn: fetchAssetIn,
      assetOut: fetchAssetOut,
      period: changePeriod,
    }),
    enabled: !isPegged && hasValidAssetIds,
  })

  const resetKey = `${baseAssetId}-${quoteAssetId}-${interval}`
  const liveRef = useRef<{ resetKey: string; candle: PairCandle } | null>(null)

  const live = useMemo(() => {
    if (isPlaceholderData) {
      liveRef.current = null
      return null
    }

    const last = candles.at(-1)
    if (!last || !spotPrice || !isFinite(spotPrice)) return null

    const running = liveRef.current
    const sameSeries =
      running?.resetKey === resetKey && running.candle.time >= last.time
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

  const isEmpty = !hasValidAssetIds || (isSuccess && !candles.length)

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
    prices,
    priceAssetId: chartQuoteAssetId,
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
      : needsInvert
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
        isLoading={hasValidAssetIds && isLoading}
        isEmpty={isEmpty}
      >
        <CandleChart
          height={height}
          candles={candles}
          liveCandle={live}
          type={chartType}
          resetKey={resetKey}
          isRefetching={isRefetching}
          isPlaceholderData={!isPegged && isPlaceholderData}
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
