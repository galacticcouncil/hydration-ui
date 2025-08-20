import { ToggleGroup, ToggleGroupItem } from "components/ToggleGroup"
import {
  ESupportedTimeRanges,
  ReserveRateTimeRange,
} from "sections/lending/hooks/useReservesHistory"
import { ApyChart } from "sections/lending/ui/reserve-overview/chart/ApyChart"
import {
  ChartField,
  ChartLegend,
} from "sections/lending/ui/reserve-overview/chart/ChartLegend"
import { KeyOfType } from "utils/types"

type ApyChartContainerProps<TData extends Record<string, unknown>> = {
  data: TData[]
  fields: ChartField[]
  avgFieldName: KeyOfType<TData, number>
  dateFieldName: KeyOfType<TData, number>
  selectedTimeRange: ReserveRateTimeRange
  isLoading: boolean
  hasError: boolean
  onSetSelectedTimeRangeChange: (timeRange: ReserveRateTimeRange) => void
}

const CHART_HEIGHT = 200

export const ApyChartContainer = <TData extends Record<string, unknown>>({
  data,
  fields,
  avgFieldName,
  dateFieldName,
  selectedTimeRange,
  isLoading,
  hasError,
  onSetSelectedTimeRangeChange,
}: ApyChartContainerProps<TData>): JSX.Element => {
  return (
    <div sx={{ mt: 10, mb: 16 }} css={{ position: "relative" }}>
      <div
        sx={{
          px: [0, 8],
          flex: ["column-reverse", "row"],
          align: ["start", "center"],
          justify: "space-between",
          flexWrap: "wrap",
          mb: 12,
          gap: 12,
        }}
      >
        <ChartLegend fields={fields} />
        <ToggleGroup
          size="extra-small"
          variant="tertiary"
          type="single"
          value={selectedTimeRange}
          onValueChange={onSetSelectedTimeRangeChange}
        >
          <ToggleGroupItem value={ESupportedTimeRanges.OneMonth}>
            1m
          </ToggleGroupItem>
          <ToggleGroupItem value={ESupportedTimeRanges.SixMonths}>
            6m
          </ToggleGroupItem>
          <ToggleGroupItem value={ESupportedTimeRanges.OneYear}>
            1y
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
      <div sx={{ height: CHART_HEIGHT }}>
        <ApyChart
          loading={isLoading}
          error={hasError}
          data={data}
          fields={fields}
          avgFieldName={avgFieldName}
          dateFieldName={dateFieldName}
        />
      </div>
    </div>
  )
}
