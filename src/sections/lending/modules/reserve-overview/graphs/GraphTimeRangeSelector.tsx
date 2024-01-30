import { reserveRateTimeRangeOptions } from "sections/lending/hooks/useReservesHistory"

import {
  ESupportedTimeRanges,
  TimeRangeSelector,
} from "sections/lending/modules/reserve-overview/TimeRangeSelector"

export interface GraphTimeRangeSelectorProps {
  disabled: boolean
  timeRange: ESupportedTimeRanges
  onTimeRangeChanged: (value: ESupportedTimeRanges) => void
}

export const GraphTimeRangeSelector = ({
  disabled, // require disabled from parent
  timeRange,
  onTimeRangeChanged,
}: GraphTimeRangeSelectorProps) => (
  <TimeRangeSelector
    disabled={disabled}
    timeRanges={reserveRateTimeRangeOptions}
    selectedTimeRange={timeRange}
    onTimeRangeChanged={onTimeRangeChanged}
  />
)
