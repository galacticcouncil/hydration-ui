import { Flex, Paper } from "@galacticcouncil/ui/components"

import { AvailableFarmsSection } from "@/modules/liquidity/components/AvailableFarms/AvailableFarmsSection"
import { PoolDetailsHeaderSkeleton } from "@/modules/liquidity/components/PoolDetailsHeader/PoolDetailsHeaderSkeleton"
import { PoolDetailsValuesSkeleton } from "@/modules/liquidity/components/PoolDetailsValues/PoolDetailsValuesSkeleton"

export const PoolDetailsSkeleton = () => {
  return (
    <Flex direction="column" sx={{ position: "relative" }}>
      <PoolDetailsHeaderSkeleton />

      <Flex gap={20}>
        <Paper sx={{ flex: 1 }}></Paper>
        <PoolDetailsValuesSkeleton />
      </Flex>

      <AvailableFarmsSection />
    </Flex>
  )
}
