import { Flex, Paper, SliderTabs } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"

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

  if (isTablet || isMobile) {
    return (
      <Paper
        p={[16, 20]}
        sx={{ flex: 1, gap: 12, flexDirection: "column" }}
        as={Flex}
      >
        <PoolChart
          assetId=""
          height={350}
          interval="all"
          setInterval={() => null}
        />
        <Flex gap={8} justify="space-between">
          <Flex align="center" gap={getTokenPx("containers.paddings.quart")}>
            <SliderTabs
              options={chartTypes}
              selected="price"
              onSelect={() => null}
              disabled
            />
            <SliderTabs
              options={types}
              selected="chart"
              onSelect={() => null}
            />
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

      <Flex gap={20}>
        <Paper p={[16, 20]} sx={{ flex: 1, flexBasis: 500 }}>
          <PoolChart
            assetId=""
            height={420}
            interval="all"
            setInterval={() => null}
          />
        </Paper>
        <PoolDetailsValuesSkeleton />
      </Flex>
    </Flex>
  )
}
