import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import { Grid } from "@galacticcouncil/ui/components"
import {
  getAssetIdFromAddress,
  ISOLATED_MODE_ASSETS,
  MONEY_MARKET_STRATEGY_ASSETS,
} from "@galacticcouncil/utils"
import { useMemo } from "react"

import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { FeaturedStrategyCard } from "@/modules/borrow/multiply/components/FeaturedStrategyCard"

export const FeaturedStrategies: React.FC = () => {
  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const { apyMap } = useApyContext()

  const strategyAssets = useMemo(() => {
    const filtered = data.filter((reserve) =>
      [...ISOLATED_MODE_ASSETS, ...MONEY_MARKET_STRATEGY_ASSETS].includes(
        getAssetIdFromAddress(reserve.underlyingAsset),
      ),
    )
    return filtered.toSorted(
      (a, b) =>
        MONEY_MARKET_STRATEGY_ASSETS.indexOf(
          getAssetIdFromAddress(a.underlyingAsset),
        ) -
        MONEY_MARKET_STRATEGY_ASSETS.indexOf(
          getAssetIdFromAddress(b.underlyingAsset),
        ),
    )
  }, [data])

  return (
    <Grid columns={[1, 1, 2, 3, 4]} gap="l">
      {isLoading
        ? MONEY_MARKET_STRATEGY_ASSETS.map((assetId) => (
            <FeaturedStrategyCard key={assetId} isLoading />
          ))
        : strategyAssets.map((reserve) => {
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
