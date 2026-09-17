import {
  advanceSynthetics,
  bucketOpenMs,
  CANDLE_BUCKET_MS,
  CandleBucket,
  invertCandle,
  mergeCandles,
  PairCandle,
  pairCandlesInfiniteQuery,
  pairCandlesQuery,
  peggedCandles,
  TAIL_BUCKETS,
} from "@galacticcouncil/indexer/neckwork"
import { GIGA_STABLESWAP_TO_ERC20 } from "@galacticcouncil/utils"
import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query"
import Big from "big.js"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { neckworkClient } from "@/api/neckwork"
import { spotPriceQuery } from "@/api/spotPrice"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { isHydrationAssetId } from "@/utils/trade"

/**
 * How often the tail is refetched. Flat across every bucket size: a `1w` chart
 * polling once a minute costs 24 rows, whereas any interval scaled to the
 * bucket would leave a `1d` chart showing a synthetic candle for hours.
 */
const TAIL_REFETCH_INTERVAL = 60_000

const useBucketOpen = (bucket: CandleBucket): number => {
  const [, forceRender] = useState(0)
  const open = bucketOpenMs(bucket, Date.now())

  useEffect(() => {
    // re-reads the clock on every render, so a throttled or suspended tab
    // resumes on the bucket it actually woke up in
    const timeout = setTimeout(
      () => forceRender((count) => count + 1),
      open + CANDLE_BUCKET_MS[bucket] - Date.now(),
    )

    return () => clearTimeout(timeout)
  }, [bucket, open])

  return open
}

export type PairCandleSeries = {
  /** History, tail and synthetics already merged — the whole chart. */
  readonly series: ReadonlyArray<PairCandle>
  /** Base priced in quote. `NaN` when no quote is available. */
  readonly spotPrice: number
  /** Resolved quote id, for formatting prices and volume. */
  readonly quoteAssetId: string
  /** Resolved pair as the API wants it, for sibling queries. */
  readonly pair: {
    readonly assetIn: string
    readonly assetOut: string
    readonly invert: boolean
  }
  readonly isPegged: boolean
  readonly isLoading: boolean
  readonly isError: boolean
  readonly isEmpty: boolean
  readonly isRefetching: boolean
  readonly isPlaceholderData: boolean
  readonly onReachStart: () => void
}

/**
 * The candle series for one pair, from the ids the user picked. Owns asset
 * resolution, the peg cases, the API's pair ordering and inversion, history
 * paging, the tail refetch and the synthetic tip.
 *
 * Only the history query drives the status flags. The tail polls in the
 * background, so letting it report would flicker the chart every minute and
 * blank it whenever one poll failed; a failed tail just leaves the newest
 * candles synthetic until the next poll.
 */
export const usePairCandleSeries = (
  baseAssetId: string,
  quoteAssetId: string,
  bucket: CandleBucket,
): PairCandleSeries => {
  const { getAssetWithFallback, getErc20AToken, isStableSwap } = useAssets()
  const rpc = useRpcProvider()

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
  // each other and the API has no candles for the pair.
  const isPegged =
    baseAssetId === quoteAssetId ||
    getErc20AToken(baseAssetId)?.underlyingAssetId === quoteAssetId ||
    getErc20AToken(quoteAssetId)?.underlyingAssetId === baseAssetId

  const chartBaseAssetId = isPegged
    ? baseAssetId
    : resolveChartAssetId(baseAssetId)
  const chartQuoteAssetId = isPegged
    ? quoteAssetId
    : resolveChartAssetId(quoteAssetId)

  const hasValidAssetIds =
    isHydrationAssetId(baseAssetId) && isHydrationAssetId(quoteAssetId)

  // the API only serves the pair with the lower asset id as assetIn
  const isFetchAligned = Number(chartQuoteAssetId) >= Number(chartBaseAssetId)
  const fetchAssetIn = isFetchAligned ? chartBaseAssetId : chartQuoteAssetId
  const fetchAssetOut = isFetchAligned ? chartQuoteAssetId : chartBaseAssetId
  const needsInvert = !isFetchAligned

  const enabled = !isPegged && hasValidAssetIds

  const {
    data: historyData,
    isLoading,
    isSuccess,
    isError,
    isFetching,
    isPlaceholderData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...pairCandlesInfiniteQuery(neckworkClient, {
      assetIn: fetchAssetIn,
      assetOut: fetchAssetOut,
      bucket,
    }),
    enabled,
    placeholderData: keepPreviousData,
  })

  // no keepPreviousData: a tail left over from the previous pair would merge
  // into the new one as if it were confirmed
  const { data: tailData } = useQuery({
    ...pairCandlesQuery(neckworkClient, {
      assetIn: fetchAssetIn,
      assetOut: fetchAssetOut,
      bucket,
      rangeMs: TAIL_BUCKETS * CANDLE_BUCKET_MS[bucket],
    }),
    enabled,
    refetchInterval: TAIL_REFETCH_INTERVAL,
    refetchIntervalInBackground: false,
  })

  const spotOptions = spotPriceQuery(rpc, chartQuoteAssetId, chartBaseAssetId)
  const { data: spot } = useQuery({
    ...spotOptions,
    enabled: enabled && spotOptions.enabled,
  })

  const spotPrice = useMemo(() => {
    const raw = spot?.spotPrice
    if (raw === undefined || raw === null) return Number.NaN
    try {
      const asBig = Big(raw)
      if (asBig.lte(0)) return Number.NaN
      return Big(1).div(asBig).toNumber()
    } catch {
      return Number.NaN
    }
  }, [spot?.spotPrice])

  const history = useMemo(() => {
    if (isPegged) return peggedCandles(bucket)

    const pages = (historyData?.pages ?? []).toReversed().flat()
    return needsInvert ? pages.map(invertCandle) : pages
  }, [historyData, needsInvert, isPegged, bucket])

  const tail = useMemo(() => {
    if (isPegged || !tailData) return []
    return needsInvert ? tailData.map(invertCandle) : tailData
  }, [tailData, needsInvert, isPegged])

  const resetKey = `${baseAssetId}-${quoteAssetId}-${bucket}`
  const syntheticsRef = useRef<{
    resetKey: string
    candles: ReadonlyArray<PairCandle>
  }>({ resetKey, candles: [] })

  const newestConfirmed = tail.at(-1) ?? history.at(-1)

  const bucketOpen = useBucketOpen(bucket)

  const synthetics = useMemo(() => {
    const running =
      syntheticsRef.current.resetKey === resetKey
        ? syntheticsRef.current.candles
        : []

    // nothing to draw a tip from, or the visible series belongs to the pair
    // we are leaving
    const next =
      isPegged || isPlaceholderData || !newestConfirmed
        ? []
        : advanceSynthetics(
            running,
            newestConfirmed,
            spotPrice,
            bucket,
            bucketOpen,
          )

    syntheticsRef.current = { resetKey, candles: next }

    return next
  }, [
    isPegged,
    isPlaceholderData,
    newestConfirmed,
    resetKey,
    spotPrice,
    bucket,
    bucketOpen,
  ])

  const series = useMemo(
    () => mergeCandles(history, tail, synthetics),
    [history, tail, synthetics],
  )

  const onReachStart = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    series,
    spotPrice,
    quoteAssetId: chartQuoteAssetId,
    pair: {
      assetIn: fetchAssetIn,
      assetOut: fetchAssetOut,
      invert: needsInvert,
    },
    isPegged,
    isLoading,
    isError,
    isEmpty: !hasValidAssetIds || (isSuccess && !series.length),
    isRefetching: isFetching && !isFetchingNextPage,
    isPlaceholderData: !isPegged && isPlaceholderData,
    onReachStart,
  }
}
