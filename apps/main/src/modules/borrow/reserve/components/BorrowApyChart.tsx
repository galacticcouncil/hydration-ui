import { useQuery } from "@tanstack/react-query"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { variableBorrowRateChartDataQuery } from "@/api/grafana/reserveRate"
import { ApyChart } from "@/modules/borrow/reserve/components/ApyChart"
import {
  ApyChartTimeRangeOption,
  getApyChartTimeRange,
} from "@/modules/borrow/reserve/components/ApyChart.utils"
import { VARIABLE_BORROW_RATE_COLOR } from "@/modules/borrow/reserve/components/InterestRateModelChart"

type Props = {
  readonly assetId: string
}

export const BorrowApyChart: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("borrow")
  const [timeRange, setTimeRange] = useState<ApyChartTimeRangeOption>("1M")
  const { from, to } = useMemo(
    () => getApyChartTimeRange(timeRange),
    [timeRange],
  )

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery(variableBorrowRateChartDataQuery(assetId, from, to))

  return (
    <ApyChart
      header={t("reserve.borrowApyChart.header")}
      color={VARIABLE_BORROW_RATE_COLOR}
      timeRange={timeRange}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onTimeRangeChange={setTimeRange}
    />
  )
}
