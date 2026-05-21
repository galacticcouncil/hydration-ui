import { Stack } from "@galacticcouncil/ui/components"

import { AssetHeader } from "@/components/AssetHeader"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { AboutCard } from "@/modules/strategies/stable-bonds/components/AboutCard"
import { MyPositionsCard } from "@/modules/strategies/stable-bonds/components/MyPositionsCard"
import { StrategyDetailsCard } from "@/modules/strategies/stable-bonds/components/StrategyDetailsCard"
import { STABLE_BONDS_ASSET_ID } from "@/modules/strategies/stable-bonds/constants"
import { useAssets } from "@/providers/assetsProvider"

export const StableBondsPage = () => {
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(STABLE_BONDS_ASSET_ID)

  return (
    <Stack gap="xxl">
      <AssetHeader asset={asset} />
      <TwoColumnGrid template="sidebar">
        <Stack gap="xl">
          <MyPositionsCard />
          <StrategyDetailsCard />
          <AboutCard />
        </Stack>
      </TwoColumnGrid>
    </Stack>
  )
}
