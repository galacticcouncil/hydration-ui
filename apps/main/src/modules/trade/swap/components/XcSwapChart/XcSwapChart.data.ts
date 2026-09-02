import {
  CandleBucket,
  invertCandle,
  PairCandle,
  pairCandlesInfiniteQuery,
} from "@galacticcouncil/indexer/neckwork"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query"
import { useCallback, useMemo } from "react"

import { useKrakenOhlc } from "@/api/external/kraken"
import { neckworkClient } from "@/api/provider"

/**
 * CandleBucket -> Kraken OHLC interval (minutes). Kraken only serves this fixed
 * set, and every bucket happens to have an exact match.
 */
const KRAKEN_INTERVALS: Record<CandleBucket, number> = {
  "5m": 5,
  "15m": 15,
  "30m": 30,
  "1h": 60,
  "4h": 240,
  "1d": 1440,
  "1w": 10080,
}

type Args = {
  readonly sellAssetId: string
  readonly destPlatform: string
  readonly bucket: CandleBucket
}

/**
 * Candles for a cross-chain swap pair (Hydration asset X -> foreign asset Q on
 * NEAR/ZEC), which has no native pair data:
 *
 *   close = priceUSD(Q) / priceUSD(X)   // = X per Q
 *
 * priceUSD(Q) is the Kraken candle, priceUSD(X) the latest Hydration close at
 * or before that candle's time; USD is treated as USDT. Dividing the whole
 * Kraken OHLC by that scalar keeps the candle well-formed (high stays highest)
 * and matches the on-chain chart's convention — a chart labeled "Q/X" shows
 * how much X one Q costs.
 */
export const useXcSwapCandles = ({
  sellAssetId,
  destPlatform,
  bucket,
}: Args) => {
  // the API only serves the pair with the lower asset id as assetIn
  const isAligned = Number(USDT_ASSET_ID) >= Number(sellAssetId)

  const {
    data: hydraPages,
    isLoading: isHydraLoading,
    isError: isHydraError,
    isSuccess: isHydraSuccess,
    isFetching: isHydraFetching,
    isPlaceholderData,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    ...pairCandlesInfiniteQuery(neckworkClient, {
      assetIn: isAligned ? sellAssetId : USDT_ASSET_ID,
      assetOut: isAligned ? USDT_ASSET_ID : sellAssetId,
      bucket,
    }),
    placeholderData: keepPreviousData,
  })

  const {
    data: foreignCandles,
    isLoading: isForeignLoading,
    isError: isForeignError,
    isSuccess: isForeignSuccess,
    isFetching: isForeignFetching,
  } = useKrakenOhlc(destPlatform, KRAKEN_INTERVALS[bucket])

  // USD per X, oldest first
  const hydraCandles = useMemo(() => {
    const series = (hydraPages?.pages ?? []).toReversed().flat()
    return isAligned ? series : series.map(invertCandle)
  }, [hydraPages, isAligned])

  const candles = useMemo<PairCandle[]>(() => {
    const first = hydraCandles[0]
    if (!first || !foreignCandles?.length) return []

    const foreignSorted = [...foreignCandles].sort(
      (a, b) => a.timestamp - b.timestamp,
    )

    let hi = 0
    let usdPerX = first.close
    const result: PairCandle[] = []

    for (const candle of foreignSorted) {
      while (
        hi < hydraCandles.length &&
        (hydraCandles[hi]?.time ?? 0) <= candle.timestamp
      ) {
        usdPerX = hydraCandles[hi]?.close ?? usdPerX
        hi++
      }

      // drop anything older than the Hydration series — there is no price to
      // scale it by, and carrying the oldest one backwards invents history
      if (candle.timestamp < first.time || usdPerX <= 0 || candle.close <= 0) {
        continue
      }

      result.push({
        time: candle.timestamp,
        open: candle.open / usdPerX,
        high: candle.high / usdPerX,
        low: candle.low / usdPerX,
        close: candle.close / usdPerX,
        volume: 0,
      })
    }

    return result
  }, [hydraCandles, foreignCandles])

  const onReachStart = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return {
    candles,
    onReachStart,
    isLoading: isHydraLoading || isForeignLoading,
    isError: isHydraError || isForeignError,
    isSuccess: isHydraSuccess && isForeignSuccess,
    isPlaceholderData,
    isRefetching: (isHydraFetching && !isFetchingNextPage) || isForeignFetching,
  }
}
