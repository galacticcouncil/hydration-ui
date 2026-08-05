import {
  OhlcData,
  toUTCTimestamp,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useMemo } from "react"

import { useKrakenOhlc } from "@/api/external/kraken"
import { TIME_FRAME_MS } from "@/components/TimeFrame/TimeFrame.utils"
import { TradeChartTimeFrameType } from "@/modules/trade/swap/components/TradeChart/TradeChart"
import { useTradeChartData } from "@/modules/trade/swap/components/TradeChart/TradeChart.data"

export type XcSwapChartTimeFrame = TradeChartTimeFrameType | "all"

/**
 * timeFrame -> Kraken interval (minutes). Chosen so the requested window stays
 * within Kraken's 720-candle REST cap:
 * hour  (1m)   -> 720m  = 12h   covers 1h
 * day   (5m)   -> 3600m = 60h   covers 24h
 * week  (60m)  -> 720h  = 30d   covers 7d
 * month (240m) -> 2880h = 120d  covers 30d
 * all   (1440m)-> 720d  ~ 2y
 */
const KRAKEN_INTERVALS: Record<XcSwapChartTimeFrame, number> = {
  hour: 1,
  day: 5,
  week: 60,
  month: 240,
  all: 1440,
}

const hasOhlc = (
  candle: Pick<OhlcData, "open" | "high" | "low">,
): candle is Required<Pick<OhlcData, "open" | "high" | "low">> => {
  return (
    !!candle.open &&
    candle.open > 0 &&
    !!candle.high &&
    candle.high > 0 &&
    !!candle.low &&
    candle.low > 0
  )
}

type Args = {
  readonly sellAssetId: string
  readonly destPlatform: string
  readonly timeFrame: XcSwapChartTimeFrame
  readonly enabled?: boolean
}

/**
 * Cross-rate price series for a cross-chain swap pair (Hydration asset X ->
 * foreign asset Q on NEAR/ZEC), where we have no native pair data.
 *
 *   close = priceUSD(Q) / priceUSD(X)   // = X per Q (sell per buy)
 *
 * priceUSD(X) comes from our indexer (useTradeChartData), priceUSD(Q) from
 * Kraken; USD is treated as USDT (asset 10). `close` is X-per-Q (value in the
 * sell asset's units) to match the on-chain TradeChart: a chart labeled "X/Q"
 * shows "how much X is 1 Q". The toggle inverts to "1 X = Q".
 */
export const useXcSwapChartData = ({
  sellAssetId,
  destPlatform,
  timeFrame,
  enabled = true,
}: Args) => {
  const {
    prices: hydraPrices,
    isLoading: isHydraLoading,
    isError: isHydraError,
    isSuccess: isHydraSuccess,
  } = useTradeChartData({
    assetInId: USDT_ASSET_ID,
    assetOutId: sellAssetId,
    timeFrame: timeFrame === "all" ? null : timeFrame,
  })

  const {
    data: foreignPrices,
    isLoading: isForeignLoading,
    isError: isForeignError,
    isSuccess: isForeignSuccess,
  } = useKrakenOhlc(destPlatform, KRAKEN_INTERVALS[timeFrame], enabled)

  const prices = useMemo<OhlcData[]>(() => {
    if (!hydraPrices.length || !foreignPrices?.length) {
      return []
    }

    const foreignSorted = [...foreignPrices].sort(
      (a, b) => a.timestamp - b.timestamp,
    )

    const cutoffSec =
      timeFrame === "all" ? 0 : (Date.now() - TIME_FRAME_MS[timeFrame]) / 1000

    let hi = 0
    let lastHydra = hydraPrices[0]?.close ?? 0
    const result: OhlcData[] = []

    for (const candle of foreignSorted) {
      const tSec = candle.timestamp

      while (hi < hydraPrices.length && Number(hydraPrices[hi]?.time) <= tSec) {
        lastHydra = hydraPrices[hi]?.close ?? lastHydra
        hi++
      }

      if (
        tSec < cutoffSec ||
        !lastHydra ||
        lastHydra <= 0 ||
        candle.close <= 0
      ) {
        continue
      }

      const point: OhlcData = {
        time: toUTCTimestamp(tSec * 1000),

        close: candle.close / lastHydra,
      }

      if (hasOhlc(candle)) {
        point.open = candle.open / lastHydra
        point.high = candle.high / lastHydra
        point.low = candle.low / lastHydra
      }

      result.push(point)
    }

    return result
  }, [hydraPrices, foreignPrices, timeFrame])

  return {
    prices,
    isLoading: isHydraLoading || isForeignLoading,
    isError: isHydraError || isForeignError,
    isSuccess: isHydraSuccess && isForeignSuccess,
  }
}
