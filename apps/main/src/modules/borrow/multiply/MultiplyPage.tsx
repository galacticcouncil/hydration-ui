import { Flex, Stack, ValueStats } from "@galacticcouncil/ui/components"

import { FeaturedStrategies } from "@/modules/borrow/multiply/components/FeaturedStrategies"
import { StrategyPositions } from "@/modules/borrow/multiply/components/StrategyPositions"

export const MultiplyPage = () => {
  return (
    <Stack gap="xxl">
      <Flex align="center" justify="space-between" width="100%">
        <Stack
          direction={["column", null, "row"]}
          justify="flex-start"
          gap={[10, null, 40, 60]}
          separated
        >
          <ValueStats
            label="Total deposits"
            value="$142.50M"
            size="large"
            wrap={[false, false, true]}
          />
          <ValueStats
            label="Active borrows"
            value="$86.20M"
            size="large"
            wrap={[false, false, true]}
          />
        </Stack>
      </Flex>
      <StrategyPositions />
      <FeaturedStrategies />
    </Stack>
  )
}
