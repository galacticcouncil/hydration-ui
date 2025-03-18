import { forwardRef } from "react"

import { ChartCrosshair } from "@/components"
import {
  CrosshairCallbackData,
  dateFormatter,
  parseTradingViewTime,
  timeFormatter,
} from "@/components/TradingViewChart/utils"

export const Crosshair = forwardRef<
  HTMLDivElement,
  Partial<NonNullable<CrosshairCallbackData>>
>(({ data }, ref) => {
  const timestamp = data?.time ? parseTradingViewTime(data.time) : null

  return (
    <div ref={ref} sx={{ display: "block", position: "absolute", zIndex: 2 }}>
      {timestamp && (
        <ChartCrosshair
          date={dateFormatter.format(timestamp)}
          time={timeFormatter.format(timestamp)}
        />
      )}
    </div>
  )
})
Crosshair.displayName = "Crosshair"
