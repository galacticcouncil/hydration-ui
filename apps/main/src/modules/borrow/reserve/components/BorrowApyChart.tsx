import { useTheme } from "@galacticcouncil/ui/theme"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { variableBorrowRateChartDataQuery } from "@/api/grafana/reserveRate"
import { ApyChart } from "@/modules/borrow/reserve/components/ApyChart"
import { ApyChartTimeRangeOption } from "@/modules/borrow/reserve/components/ApyChart.utils"

type Props = {
  readonly assetId: string
}

export const BorrowApyChart: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation("borrow")

  const { themeProps } = useTheme()

  const [timeRange, setTimeRange] = useState<ApyChartTimeRangeOption>("1M")

  const {
    data = [],
    isLoading,
    isError,
  } = useQuery(variableBorrowRateChartDataQuery(assetId, timeRange))

  return (
    <ApyChart
      header={t("reserve.borrowApyChart.header")}
      color={themeProps.colors.basePalette.coralPink}
      timeRange={timeRange}
      data={data}
      isLoading={isLoading}
      isError={isError}
      onTimeRangeChange={setTimeRange}
    />
  )
}
