import { ChartLegendTooltipBody } from "@galacticcouncil/ui/components"
import { ChartPoint } from "@tanstack/charts/react/tooltip"
import { useTranslation } from "react-i18next"

import { feesAndRevenueConfig } from "@/modules/stats/fees/FeeAndRevenueChart/FeeAndRevenue.utils"
import { FeeRow } from "@/modules/stats/fees/FeeAndRevenueChartNeckwork/FeesStackedBar"

type FeesTooltipContentProps = {
  readonly points: readonly ChartPoint<FeeRow>[]
}

export const FeesTooltipContent = ({ points }: FeesTooltipContentProps) => {
  const { t } = useTranslation("common")
  const [first] = points
  if (!first) return null

  const sum = points.reduce((acc, { datum }) => acc + datum.value, 0)

  return (
    <ChartLegendTooltipBody
      points={points.toReversed()}
      label={t("date.day", {
        value: first.datum.time,
        format: "yyyy MMM dd",
      })}
      formatLabel={() =>
        points.length > 1 ? t("currency.compact", { value: sum }) : null
      }
      formatSeriesLabel={({ datum }) =>
        feesAndRevenueConfig[datum.stream]?.label?.toUpperCase() ?? datum.stream
      }
      formatValue={({ datum }) =>
        t("currency.compact", { value: datum.value, minimumFractionDigits: 2 })
      }
    />
  )
}
