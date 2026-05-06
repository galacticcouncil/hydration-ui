import { ChartLegendItemIcon } from "@galacticcouncil/ui/assets/icons"
import {
  AreaChart,
  Box,
  Flex,
  Icon,
  Text,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { last } from "remeda"

type ChartPoint = {
  timestamp: string
  hdxValue: number
  gigaValue: number
}

const CHART_DATA: Array<ChartPoint> = [
  {
    timestamp: "2026-04-17T00:00:00Z",
    hdxValue: 0.019,
    gigaValue: 0.004,
  },
  {
    timestamp: "2026-04-17T02:00:00Z",
    hdxValue: 0.024,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T04:00:00Z",
    hdxValue: 0.033,
    gigaValue: 0.004,
  },
  {
    timestamp: "2026-04-17T06:00:00Z",
    hdxValue: 0.04,
    gigaValue: 0.005,
  },
  {
    timestamp: "2026-04-17T08:00:00Z",
    hdxValue: 0.062,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T10:00:00Z",
    hdxValue: 0.044,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T12:00:00Z",
    hdxValue: 0.048,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T14:00:00Z",
    hdxValue: 0.063,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T16:00:00Z",
    hdxValue: 0.051,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T18:00:00Z",
    hdxValue: 0.04,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T20:00:00Z",
    hdxValue: 0.03,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T22:00:00Z",
    hdxValue: 0.027,
    gigaValue: 0.005,
  },
  {
    timestamp: "2026-04-17T24:00:00Z",
    hdxValue: 0.036,
    gigaValue: 0.006,
  },
  {
    timestamp: "2026-04-17T03:00:00Z",
    hdxValue: 0.031,
    gigaValue: 0.012,
  },
]

const HDX_COLOR = "#53b0ff"
const GIGAHDX_COLOR = "#cc6ef4"

const LEGEND_ITEMS = [
  { color: GIGAHDX_COLOR, label: "GIGAHDX" },
  { color: HDX_COLOR, label: "HDX" },
]

type GigaStakingChartProps = {
  className?: string
}

export const GigaStakingChart: FC<GigaStakingChartProps> = ({ className }) => {
  const { t } = useTranslation("common")
  const { getToken } = useTheme()
  const [crosshair, setCrosshair] = useState<ChartPoint | null>(null)

  const activePointValue = crosshair ?? last(CHART_DATA)

  return (
    <Box p="l" className={className}>
      {activePointValue && (
        <Flex
          direction="column"
          sx={{ position: "absolute", top: 20, left: 16, zIndex: 2 }}
        >
          <Text fs="p6" fw={500} lh={1.2} color={getToken("text.high")}>
            {t("currency", { value: activePointValue.gigaValue })}
            <Text as="span" fs="p6" fw={500} lh={1.2} color={GIGAHDX_COLOR}>
              GIGAHDX
            </Text>
          </Text>
          <Text fs="p6" fw={500} lh={1.2} color={getToken("text.high")}>
            {t("currency", { value: activePointValue.hdxValue })}
            <Text as="span" fs="p6" fw={500} lh={1.2} color={HDX_COLOR}>
              HDX
            </Text>
          </Text>
        </Flex>
      )}

      <Box sx={{ height: 295, width: "100%", mt: "xl", mb: -20 }}>
        <AreaChart
          data={CHART_DATA}
          verticalGridHidden
          curveType="linear"
          yAxisProps={{ orientation: "right" }}
          onCrosshairMove={setCrosshair}
          withoutTooltip
          withoutReferenceLine
          config={{
            xAxisKey: "timestamp",
            xAxisType: "time",
            yAxisFormatter: (value: number) => t("currency", { value }),
            xAxisFormatter: (value: string | number) =>
              t("date.day", { value: new Date(value) }),
            tooltipType: "timeBottom",
            series: [
              {
                label: "HDX",
                key: "hdxValue",
                color: [HDX_COLOR, HDX_COLOR, 0.38, 0.03],
              },
              {
                label: "GIGAHDX",
                key: "gigaValue",
                color: [GIGAHDX_COLOR, GIGAHDX_COLOR, 0.38, 0],
              },
            ],
          }}
        />
      </Box>

      <Flex align="center" justify="center" gap="l" mt="m">
        {LEGEND_ITEMS.map(({ color, label }) => (
          <LegendItem key={label} color={color} label={label} />
        ))}
      </Flex>
    </Box>
  )
}

const LegendItem = ({ color, label }: { color: string; label: string }) => {
  return (
    <Flex align="center" gap="s">
      <Icon component={ChartLegendItemIcon} color={color} size={10} />
      <Text fs="p6" color={color}>
        {label}
      </Text>
    </Flex>
  )
}
