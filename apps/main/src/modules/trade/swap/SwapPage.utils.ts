import { BaselineChartData } from "@galacticcouncil/ui/components/TradingViewChart/utils"
import { USDT_ASSET_ID } from "@galacticcouncil/utils"
import { useCallback, useMemo, useState } from "react"
import { funnel, last } from "remeda"

import { useDisplayAssetPrice } from "@/components/AssetPrice"

type CrosshairData = BaselineChartData & {
  open?: number
  high?: number
  low?: number
}

type UseTradeChartValuesArgs = {
  prices: ReadonlyArray<{
    close: number
    volume?: number
    open?: number
    high?: number
    low?: number
  }>
  priceAssetId: string
  isEmpty: boolean
  isError: boolean
  isLoading: boolean
}

const priceOptions = { maximumFractionDigits: null }

export const useTradeChartValues = ({
  prices,
  priceAssetId,
  isEmpty,
  isError,
  isLoading,
}: UseTradeChartValuesArgs) => {
  const [crosshair, setCrosshair] = useState<CrosshairData | null>(null)
  const { call: setCrosshairThrottled, cancel: cancelCrosshairThrottle } =
    useMemo(
      () =>
        funnel(
          (nextCrosshair: CrosshairData | null) => {
            setCrosshair(nextCrosshair)
          },
          {
            minGapMs: 150,
            triggerAt: "both",
            reducer: (_, next: CrosshairData | null) => next,
          },
        ),
      [],
    )

  const onCrosshairMove = useCallback(
    (nextCrosshair: CrosshairData | null) => {
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
  const open = crosshair?.open ?? lastDataPoint?.open ?? 0
  const high = crosshair?.high ?? lastDataPoint?.high ?? 0
  const low = crosshair?.low ?? lastDataPoint?.low ?? 0
  const volume = crosshair?.volume ?? lastDataPoint?.volume ?? 0

  const [formattedAssetPrice, { isLoading: isAssetPriceLoading }] =
    useDisplayAssetPrice(priceAssetId, value, priceOptions)

  const [formattedVolumePrice, { isLoading: isVolumePriceLoading }] =
    useDisplayAssetPrice(USDT_ASSET_ID, volume)

  const shouldShowValues = !isEmpty && !isError

  const isLoadingValues =
    isLoading || isAssetPriceLoading || isVolumePriceLoading

  return {
    onCrosshairMove,
    value,
    open,
    high,
    low,
    volume,
    formattedAssetPrice,
    formattedVolumePrice,
    shouldShowValues,
    isLoadingValues,
    isLiveValue: crosshair === null,
  }
}
