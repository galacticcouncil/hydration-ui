import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import {
  ESupportedTimeRanges,
  ReserveRateTimeRange,
  resolutionForTimeRange,
} from "sections/lending/hooks/useReservesHistory"
import { ApyChartContainer } from "sections/lending/ui/reserve-overview/chart/ApyChartContainer"
import {
  getVariableBorrowRateChartData,
  VariableBorrowRateChartDataItem,
} from "sections/lending/utils/getVariableBorrowRateChartData"
import { QUERY_KEYS } from "utils/queryKeys"
import { KeyOfType } from "utils/types"

type Props = {
  readonly assetId: string
}

export const BorrowApyChart = ({ assetId }: Props) => {
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
    queryKey: [QUERY_KEYS.variableBorrowRates(assetId, from, to)],
    queryFn: ({ signal }) =>
      getVariableBorrowRateChartData(assetId, from, to, signal),
  })

  return (
    <ApyChartContainer
      data={data}
      fields={[
        {
          dataKey: "borrowRate" satisfies KeyOfType<
            VariableBorrowRateChartDataItem,
            number
          >,
          lineColor: "pink600",
          text: "Borrow APR, variable",
        },
      ]}
      avgFieldName="borrowRate"
      dateFieldName="timestamp"
      selectedTimeRange={selectedTimeRange}
      isLoading={isLoading}
      hasError={!!error}
      onSetSelectedTimeRangeChange={setSelectedTimeRange}
    />
  )
}
