import { Box, Stack } from "@galacticcouncil/ui/components"
import { Paper } from "@galacticcouncil/ui/components/Paper"
import { useBreakpoints } from "@galacticcouncil/ui/theme"

import { ChartState } from "@/components/ChartState"
import {
  AppSkeleton,
  TableSkeleton,
} from "@/modules/layout/components/LayoutSkeleton"
import { AssetHeaderSkeleton } from "@/modules/layout/components/LayoutSkeleton/AssetHeaderSkeleton"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"
import { TradeChartValuesSkeleton } from "@/modules/trade/swap/components/TradeChart/TradeChartValuesSkeleton"
import { TRADE_CHART_DESKTOP_HEIGHT } from "@/modules/trade/swap/SwapPageDesktop"
import { TRADE_CHART_MOBILE_HEIGHT } from "@/modules/trade/swap/SwapPageMobile"

export const SwapPageSkeleton = () => {
  const { isMobile, isTablet } = useBreakpoints()
  const chartHeight =
    isMobile || isTablet
      ? TRADE_CHART_MOBILE_HEIGHT
      : TRADE_CHART_DESKTOP_HEIGHT

  return (
    <Stack gap="xl">
      <AssetHeaderSkeleton display={["none", null, "flex"]} />
      <TwoColumnGrid template="sidebar">
        <Stack as={Paper} p="xl" sx={{ order: [1, null, 0] }}>
          <TradeChartValuesSkeleton />
          <Box sx={{ height: chartHeight }}>
            <ChartState sx={{ height: chartHeight }} isLoading isEmpty />
          </Box>
        </Stack>
        <AppSkeleton />
        <TableSkeleton rows={3} cols={[2, null, 4]} />
      </TwoColumnGrid>
    </Stack>
  )
}
