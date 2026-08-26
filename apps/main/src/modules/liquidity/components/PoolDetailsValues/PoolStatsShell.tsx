import { ChartLine, ChartPie } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Paper,
  SliderTabs,
  SliderTabsOption,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ComponentProps, ReactNode, useState } from "react"

import i18n from "@/i18n"

export const types: ReadonlyArray<SliderTabsOption<"chart" | "stats">> = [
  {
    id: "chart",
    label: i18n.t("chart"),
    leadingElement: <Icon size="s" component={ChartLine} />,
  },
  {
    id: "stats",
    label: i18n.t("stats"),
    leadingElement: <Icon size="s" component={ChartPie} />,
  },
]

export type PoolStatsShellProps = {
  /** chart panel body, rendered side by side with the values on desktop */
  renderChart: (isMobile: boolean) => ReactNode
  values: ReactNode
  /** desktop: above the chart, mobile: next to the chart/stats tabs */
  renderChartHeader?: (isMobile: boolean) => ReactNode
  sx?: ComponentProps<typeof Flex>["sx"]
}

export const PoolStatsShell = ({
  renderChart,
  values,
  renderChartHeader,
  sx,
}: PoolStatsShellProps) => {
  const { isTablet, isMobile } = useBreakpoints()
  const [type, setType] = useState<"chart" | "stats">("chart")

  if (isTablet || isMobile) {
    const header = renderChartHeader?.(true)

    return (
      <Paper
        p={[16, 20]}
        sx={{ flex: 1, gap: "m", flexDirection: "column", ...sx }}
        as={Flex}
      >
        <Flex gap="base" justify="space-between">
          <Flex align="center" gap="base">
            <SliderTabs
              options={types}
              selected={types.find((option) => option.id === type)?.id}
              onSelect={(option) => setType(option.id)}
            />
          </Flex>
          {type === "chart" && header}
        </Flex>
        {type === "chart" ? renderChart(true) : values}
      </Paper>
    )
  }

  const header = renderChartHeader?.(false)

  return (
    <Flex gap="xl" sx={sx}>
      <Paper
        p={["secondary", "primary"]}
        sx={{ flex: 1, flexBasis: "31.25rem", minWidth: 0 }}
      >
        {header ? (
          <Flex direction="column" gap="l">
            <Flex>{header}</Flex>
            {renderChart(false)}
          </Flex>
        ) : (
          renderChart(false)
        )}
      </Paper>

      <Paper
        p={["secondary", "primary"]}
        sx={{
          flex: 0,
          flexBasis: "22.5rem",
        }}
      >
        {values}
      </Paper>
    </Flex>
  )
}
