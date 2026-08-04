import { Flex, Paper } from "@galacticcouncil/ui/components"

import { MultiMetricChart } from "@/modules/stats/overview/components/MultiMetricChart"
import { ProductCards } from "@/modules/stats/overview/components/ProductCards"
import { OverviewHeader } from "@/modules/stats/overview/OverviewHeader"

export const Overview = () => {
  return (
    <Flex direction="column" gap="xl">
      <OverviewHeader />
      <Paper p={["m", "xl"]}>
        <MultiMetricChart />
      </Paper>

      <ProductCards />
    </Flex>
  )
}
