import { FC, Ref } from "react"

import { ChartCrosshair } from "@/components"
import { dateFormatter, timeFormatter } from "@/components/Chart/utils"
import {
  CrosshairCallbackData,
  parseTradingViewTime,
} from "@/components/TradingViewChart/utils"

export const Crosshair: FC<
  Partial<NonNullable<CrosshairCallbackData>> & { ref?: Ref<HTMLDivElement> }
> = ({ data, ref }) => {
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
}
