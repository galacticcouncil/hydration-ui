import { useTheme } from "@galacticcouncil/ui/theme"
import { useQuery } from "@tanstack/react-query"
import { FC, useMemo, useState } from "react"
import { useTranslation } from "react-i18next"

import { supplyRateChartDataQuery } from "@/api/grafana/reserveRate"
import { ApyChart } from "@/modules/borrow/reserve/components/ApyChart"
import {
  ApyChartTimeRangeOption,
  getApyChartTimeRange,
} from "@/modules/borrow/reserve/components/ApyChart.utils"

type Props = {
  readonly assetId: string
}

export const SupplyApyChart: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("borrow")
  const [timeRange, setTimeRange] = useState<ApyChartTimeRangeOption>("1M")
  const { from, to } = useMemo(
    () => getApyChartTimeRange(timeRange),
    [timeRange],
  )

  const {
    data = [],
    isSuccess,
    isLoading,
    isError,
  } = useQuery(supplyRateChartDataQuery(assetId, from, to))

  const { themeProps } = useTheme()

  return (
    <ApyChart
      header={t("reserve.supplyApyChart.header")}
      color={themeProps.accents.info.onPrimary}
      timeRange={timeRange}
      data={data}
      isSuccess={isSuccess}
      isLoading={isLoading}
      isError={isError}
      onTimeRangeChange={setTimeRange}
    />
  )
}
