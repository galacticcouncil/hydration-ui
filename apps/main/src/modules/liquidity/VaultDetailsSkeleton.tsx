import { Flex, ResponsiveScope } from "@galacticcouncil/ui/components"
import { pxToRem } from "@galacticcouncil/ui/utils"

import { ChartState } from "@/components/ChartState"
import { PoolStatsShell } from "@/modules/liquidity/components/PoolDetailsValues/PoolStatsShell"
import { VaultCompositionSkeleton } from "@/modules/liquidity/components/VaultDetails/VaultCompositionSkeleton"
import { VaultDetailsHeaderSkeleton } from "@/modules/liquidity/components/VaultDetails/VaultDetailsHeaderSkeleton"
import { VaultExplainerSkeleton } from "@/modules/liquidity/components/VaultDetails/VaultExplainerSkeleton"
import { VaultValuesSkeleton } from "@/modules/liquidity/components/VaultDetails/VaultValuesSkeleton"
import { SVaultDetailsRow } from "@/modules/liquidity/VaultDetails.styled"

export const VaultDetailsSkeleton = () => {
  return (
    <Flex direction="column" gap="xl">
      <VaultDetailsHeaderSkeleton />

      <PoolStatsShell
        values={<VaultValuesSkeleton />}
        renderChart={() => (
          <ChartState sx={{ height: pxToRem(420) }} isLoading isEmpty />
        )}
      />

      <ResponsiveScope>
        <SVaultDetailsRow>
          <VaultCompositionSkeleton />
          <VaultExplainerSkeleton />
        </SVaultDetailsRow>
      </ResponsiveScope>
    </Flex>
  )
}
