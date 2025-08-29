import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import {
  ESupportedTimeRanges,
  ReserveRateTimeRange,
  resolutionForTimeRange,
} from "sections/lending/hooks/useReservesHistory"
import { ApyChartContainer } from "sections/lending/ui/reserve-overview/chart/ApyChartContainer"
import {
  getSupplyRateChartData,
  SupplyRateChartDataItem,
} from "sections/lending/utils/getSupplyRateChartData"
import { QUERY_KEYS } from "utils/queryKeys"
import { KeyOfType } from "utils/types"

type Props = {
  readonly assetId: string
}

export const SupplyApyChart = ({ assetId }: Props) => {
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<ReserveRateTimeRange>(ESupportedTimeRanges.OneMonth)

  const { from, to } = useMemo(
    () => resolutionForTimeRange(selectedTimeRange),
    [selectedTimeRange],
  )

  const {
    data = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: [QUERY_KEYS.variableSupplyRates(assetId, from, to)],
    queryFn: ({ signal }) => getSupplyRateChartData(assetId, from, to, signal),
  })

  return (
    <ApyChartContainer
      data={data}
      fields={[
        {
          dataKey: "supplyRate" satisfies KeyOfType<
            SupplyRateChartDataItem,
            number
          >,
          lineColor: "brightBlue300",
          text: "Supply APR",
        },
      ]}
      avgFieldName="supplyRate"
      dateFieldName="timestamp"
      selectedTimeRange={selectedTimeRange}
      isLoading={isLoading}
      hasError={!!error}
      onSetSelectedTimeRangeChange={setSelectedTimeRange}
    />
  )
}
