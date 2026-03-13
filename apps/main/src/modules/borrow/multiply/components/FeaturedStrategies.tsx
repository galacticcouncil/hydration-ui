import { Grid } from "@galacticcouncil/ui/components"

import { FeaturedStrategyCard } from "@/modules/borrow/multiply/components/FeaturedStrategyCard"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config"
import { useMultiplyReserves } from "@/modules/borrow/multiply/hooks/useMultiplyReserves"

export const FeaturedStrategies: React.FC = () => {
  const { data, isLoading } = useMultiplyReserves()

  return (
    <Grid columns={[1, 1, 2, 3, 4]} gap="l">
      {isLoading
        ? MULTIPLY_ASSETS_CONFIG.map((strategy) => (
            <FeaturedStrategyCard key={strategy.collateralAssetId} isLoading />
          ))
        : data.map((row) => (
            <FeaturedStrategyCard
              key={row.reserve.underlyingAsset}
              reserve={row.reserve}
              apyData={row.apyData}
            />
          ))}
    </Grid>
  )
}
