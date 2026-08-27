import { ChartLine, ChartPie } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Icon,
  Paper,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { ComponentProps, ReactNode, useState } from "react"

import i18n from "@/i18n"

type PoolStatsType = "chart" | "stats"

type PoolStatsTabOption = {
  readonly id: PoolStatsType
  readonly label: string
  readonly leadingElement?: ReactNode
}

export const types: ReadonlyArray<PoolStatsTabOption> = [
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
  renderChart: (isMobile: boolean) => ReactNode
  values: ReactNode
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
  const [type, setType] = useState<PoolStatsType>("chart")

  if (isTablet || isMobile) {
    const header = renderChartHeader?.(true)

    return (
      <Paper
        p={["secondary", "primary"]}
        sx={{ flex: 1, gap: "m", flexDirection: "column", ...sx }}
        as={Flex}
      >
        <Flex direction="column" gap="base">
          <ToggleGroup
            type="single"
            value={type}
            onValueChange={(value) => value && setType(value as PoolStatsType)}
          >
            {types.map((option) => (
              <ToggleGroupItem key={option.id} value={option.id}>
                {option.leadingElement}
                {option.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {type === "chart" && header && (
            <Flex justify="flex-end">{header}</Flex>
          )}
        </Flex>
        {type === "chart" ? renderChart(true) : values}
      </Paper>
    )
  }

  const header = renderChartHeader?.(false)

  return (
    <Flex gap="xl" sx={sx}>
      <Paper p={["secondary", "primary"]} sx={{ flex: 2.5 }}>
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
          flex: 1,
        }}
      >
        {values}
      </Paper>
    </Flex>
  )
}
