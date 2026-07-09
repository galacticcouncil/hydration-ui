import {
  BaselineChartData,
  OhlcData,
} from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useCallback, useMemo, useState } from "react"
import { funnel, last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"

type UseTradeChartValuesArgs = {
  prices: OhlcData[]
  priceAssetId: string
  isEmpty: boolean
  isError: boolean
  isLoading: boolean
}

export const useTradeChartValues = ({
  prices,
  priceAssetId,
  isEmpty,
  isError,
  isLoading,
}: UseTradeChartValuesArgs) => {
  const [crosshair, setCrosshair] = useState<BaselineChartData | null>(null)
  const { call: setCrosshairThrottled, cancel: cancelCrosshairThrottle } =
    useMemo(
      () =>
        funnel(
          (nextCrosshair: BaselineChartData | null) => {
            setCrosshair(nextCrosshair)
          },
          {
            minGapMs: 200,
            triggerAt: "start",
            reducer: (_, next: BaselineChartData | null) => next,
          },
        ),
      [],
    )

  const onCrosshairMove = useCallback(
    (nextCrosshair: BaselineChartData | null) => {
      if (nextCrosshair === null) {
        cancelCrosshairThrottle()
        setCrosshair(null)
        return
      }
      setCrosshairThrottled(nextCrosshair)
    },
    [cancelCrosshairThrottle, setCrosshairThrottled],
  )

  const lastDataPoint = last(prices)
  const value = crosshair?.value ?? lastDataPoint?.close ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(priceAssetId, value, { maximumFractionDigits: null })

  const [formattedVolumePrice, { isLoading: isVolumePriceLoading }] =
    useDisplayAssetPrice(USDT_ASSET_ID, volume)

  const shouldShowValues = !isEmpty && !isError

  const isLoadingValues =
    isLoading || isAssetPriceLoading || isVolumePriceLoading

  return {
    onCrosshairMove,
    value,
    volume,
    formattedAssetPrice,
    formattedVolumePrice,
    shouldShowValues,
    isLoadingValues,
  }
}
