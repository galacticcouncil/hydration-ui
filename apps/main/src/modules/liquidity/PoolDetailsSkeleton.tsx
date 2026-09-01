import {
  Flex,
  Paper,
  ToggleGroup,
  ToggleGroupItem,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useRef } from "react"

import { ChartState } from "@/components/ChartState"
import { ChartTimeRangeDropdown } from "@/components/ChartTimeRange/ChartTimeRangeDropdown"
import {
  intervalOptions,
  PoolChart,
  PoolChartTimeFrameType,
} from "@/modules/liquidity/components/PoolDetailsChart/PoolDetailsChart"
import { PoolDetailsHeaderSkeleton } from "@/modules/liquidity/components/PoolDetailsHeader/PoolDetailsHeaderSkeleton"
import { PoolDetailsValuesSkeleton } from "@/modules/liquidity/components/PoolDetailsValues/PoolDetailsValuesSkeleton"
import {
  chartTypes,
  types,
} from "@/modules/liquidity/components/PoolDetailsValues/PoolStats"

export const PoolDetailsSkeleton = () => {
  const { isTablet, isMobile } = useBreakpoints()
  const chartRef = useRef(null)

  if (isTablet || isMobile) {
    return (
      <Paper
        p={["secondary", "primary"]}
        sx={{ flex: 1, gap: "m", flexDirection: "column" }}
        as={Flex}
      >
        <PoolChart
          chartRef={chartRef}
          assetId=""
          height={350}
          interval="all"
          setInterval={() => null}
        />
        <ChartState sx={{ height: 350 }} isLoading isEmpty />
        <Flex gap="base" justify="space-between" wrap align="center">
          <Flex align="center" gap="base">
            <ToggleGroup type="single" value="price" disabled>
              {chartTypes.map((option) => (
                <ToggleGroupItem key={option.id} value={option.id}>
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <ToggleGroup type="single" value="chart">
              {types.map((option) => (
                <ToggleGroupItem key={option.id} value={option.id}>
                  {option.leadingElement}
                  {option.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </Flex>
          <ChartTimeRangeDropdown
            options={intervalOptions}
            selectedOption={"all" as PoolChartTimeFrameType | "all"}
            onSelect={() => null}
            disabled
          />
        </Flex>
      </Paper>
    )
  }

  return (
    <Flex direction="column" sx={{ position: "relative" }}>
      <PoolDetailsHeaderSkeleton />

      <Flex gap="xl">
        <Flex
          as={Paper}
          p={["secondary", "primary"]}
          align="center"
          flex={1}
          sx={{ flexBasis: "31.25rem" }}
        >
          <ChartState sx={{ height: 420 }} isLoading isEmpty />
        </Flex>
        <PoolDetailsValuesSkeleton />
      </Flex>
    </Flex>
  )
}
