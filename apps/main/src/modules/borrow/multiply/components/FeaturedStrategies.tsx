import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { Grid } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useMemo } from "react"
import { filter, pipe, sortBy } from "remeda"

import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { FeaturedStrategyCard } from "@/modules/borrow/multiply/components/FeaturedStrategyCard"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config"

export const FeaturedStrategies: React.FC = () => {
  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const { apyMap } = useApyContext()

  const reserves = useMemo(() => {
    const collateralReserveIds = MULTIPLY_ASSETS_CONFIG.map((s) =>
      getReserveAddressByAssetId(s.collateralAssetId),
    )

    return pipe(
      data,
      filter((reserve) =>
        collateralReserveIds.includes(reserve.underlyingAsset),
      ),
      sortBy((reserve) =>
        collateralReserveIds.indexOf(reserve.underlyingAsset),
      ),
    )
  }, [data])

  return (
    <Grid columns={[1, 1, 2, 3, 4]} gap="l">
      {isLoading
        ? MULTIPLY_ASSETS_CONFIG.map((strategy) => (
            <FeaturedStrategyCard key={strategy.collateralAssetId} isLoading />
          ))
        : reserves.map((reserve) => {
            const assetId = getAssetIdFromAddress(reserve.underlyingAsset)

            return (
              <FeaturedStrategyCard
                key={reserve.underlyingAsset}
                reserve={reserve}
                apyData={apyMap.get(assetId)}
              />
            )
          })}
    </Grid>
  )
}
