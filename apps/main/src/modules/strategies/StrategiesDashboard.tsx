import { Stack } from "@galacticcouncil/ui/components"

import { FeaturedStrategies } from "@/modules/strategies/components/FeaturedStrategies"
import { MyPositions } from "@/modules/strategies/components/MyPositions"
import { StrategiesStats } from "@/modules/strategies/components/StrategiesStats"

export const StrategiesDashboard = () => {
  return (
    <Stack gap="xxl">
      <StrategiesStats totalDeposits="$554 874" activeBorrows="$215 874" />
      <MyPositions />
      <FeaturedStrategies />
    </Stack>
  )
}
