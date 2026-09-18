import { CandleBucket, PairCandle } from "@galacticcouncil/indexer/neckwork"
import { Box, ChartCrosshair } from "@galacticcouncil/ui/components"
import {
  dateFormatter,
  timeFormatter,
} from "@galacticcouncil/ui/components/Chart/utils"
import { useBreakpoints } from "@galacticcouncil/ui/theme"

import { OhlcCrosshairData } from "@/modules/trade/swap/components/TradeChart/CandleChart.utils"
import { useBucketCountdown } from "@/modules/trade/swap/components/TradeChart/hooks/useBucketCountdown"
import { useCandleChart } from "@/modules/trade/swap/components/TradeChart/hooks/useCandleChart"
import { useCandleData } from "@/modules/trade/swap/components/TradeChart/hooks/useCandleData"
import { TradeChartType } from "@/modules/trade/swap/components/TradeChart/TradeChart.utils"

type CandleChartProps = {
  readonly height: number
  readonly bucket: CandleBucket
  readonly showCountdown?: boolean
  readonly candles: ReadonlyArray<PairCandle>
  readonly type: TradeChartType
  readonly resetKey: string
  readonly isRefetching: boolean
  readonly isPlaceholderData: boolean
  readonly onCrosshairMove: (data: OhlcCrosshairData | null) => void
  readonly onReachStart: () => void
}

export const CandleChart: React.FC<CandleChartProps> = ({
  height,
  bucket,
  showCountdown = false,
  candles,
  type,
  resetKey,
  isRefetching,
  isPlaceholderData,
  onCrosshairMove,
  onReachStart,
}) => {
  const { isMobile } = useBreakpoints()

  const {
    containerRef,
    crosshairRef,
    chartRef,
    seriesRef,
    latestRef,
    crosshairTime,
  } = useCandleChart({ type, candles, onCrosshairMove, onReachStart })

  useCandleData({
    chartRef,
    seriesRef,
    latestRef,
    candles,
    resetKey,
    isPlaceholderData,
  })

  useBucketCountdown({
    seriesRef,
    latestRef,
    bucket,
    type,
    enabled: showCountdown,
  })

  return (
    <Box
      sx={{
        position: "relative",
        height,
        touchAction: isMobile ? "pan-y pinch-zoom" : undefined,
        opacity: isRefetching ? 0.4 : 1,
        transition: "opacity 150ms ease-in-out",
      }}
    >
      <div ref={containerRef} sx={{ height: "100%" }} />
      <div
        ref={crosshairRef}
        sx={{
          display: "block",
          position: "absolute",
          zIndex: 2,
          opacity: 0,
          pointerEvents: "none",
        }}
      >
        {crosshairTime && (
          <ChartCrosshair
            date={dateFormatter.format(crosshairTime)}
            time={timeFormatter.format(crosshairTime)}
          />
        )}
      </div>
    </Box>
  )
}
