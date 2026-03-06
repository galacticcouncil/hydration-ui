import { useMarketAssetsData } from "@galacticcouncil/money-market/hooks"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { Stack } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { Navigate } from "@tanstack/react-router"

import { EmptyState } from "@/components/EmptyState"
import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { MultiplyApp } from "@/modules/borrow/multiply/components/MultiplyApp"
import { StrategyAboutCard } from "@/modules/borrow/multiply/components/StrategyAboutCard"
import { StrategyHeader } from "@/modules/borrow/multiply/components/StrategyHeader"
import { StrategyOverviewCard } from "@/modules/borrow/multiply/components/StrategyOverviewCard"
import { MULTIPLY_ASSETS_CONFIG } from "@/modules/borrow/multiply/config"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { useAssets } from "@/providers/assetsProvider"

type MultiplyDetailPageProps = {
  id: string
}

export const MultiplyDetailPage: React.FC<MultiplyDetailPageProps> = ({
  id,
}) => {
  const { getAsset } = useAssets()
  const { data: reserves, isLoading } = useMarketAssetsData()
  const { apyMap } = useApyContext()

  const strategy = MULTIPLY_ASSETS_CONFIG.find(
    (s) => s.collateralAssetId === id,
  )

  const collateralReserve = reserves.find(
    (r) => getAssetIdFromAddress(r.underlyingAsset) === id,
  )

  const borrowAssetId = strategy?.debtAssetId ?? ""
  const borrowAsset = getAsset(borrowAssetId)

  const debtReserve = borrowAsset
    ? reserves.find(
        (r) => r.underlyingAsset === getReserveAddressByAssetId(borrowAsset.id),
      )
    : undefined

  if (!isLoading && !collateralReserve) {
    return <Navigate to="/borrow/multiply" />
  }

  if (!collateralReserve || !debtReserve)
    return (
      <EmptyState
        header="Looping not yet configured for this asset"
        description=""
        sx={{ mx: "auto", maxWidth: "6xl" }}
      />
    )

  const apyData = apyMap.get(id)

  return (
    <Stack gap="xxl">
      <StrategyHeader
        collateralReserve={collateralReserve}
        debtReserve={debtReserve}
      />

      <TwoColumnGrid template="sidebar">
        <Stack gap="xxl">
          <StrategyOverviewCard
            collateralReserve={collateralReserve}
            debtReserve={debtReserve}
            apyData={apyData}
          />
          <StrategyAboutCard symbol={collateralReserve.symbol} />
        </Stack>
        <MultiplyApp
          collateralReserve={collateralReserve}
          debtReserve={debtReserve}
        />
      </TwoColumnGrid>
    </Stack>
  )
}
