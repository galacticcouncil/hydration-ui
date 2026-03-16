import { useMarketAssetsData } from "@galacticcouncil/money-market/hooks"
import { Stack } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { Navigate } from "@tanstack/react-router"

import { EmptyState } from "@/components/EmptyState"
import { SetupProxyAppWapper } from "@/modules/borrow/multiply/components/SetupProxyApp"
import { StrategyAboutCard } from "@/modules/borrow/multiply/components/StrategyAboutCard"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"

type MultiplyDetailPageProps = {
  id: string
}

export const MultiplyDetailPage: React.FC<MultiplyDetailPageProps> = ({
  id,
}) => {
  const { data: reserves, isLoading } = useMarketAssetsData()

  const collateralReserve = reserves.find(
    (r) => getAssetIdFromAddress(r.underlyingAsset) === id,
  )

  if (!isLoading && !collateralReserve) {
    return <Navigate to="/borrow/multiply" />
  }

  if (!collateralReserve)
    return (
      <EmptyState
        header="Looping not yet configured for this asset"
        description=""
        sx={{ mx: "auto", maxWidth: "6xl" }}
      />
    )

  return (
    <Stack gap="xxl">
      {/* <StrategyHeader
        collateralReserve={collateralReserve}
        debtReserve={debtReserve}
      /> */}

      <TwoColumnGrid template="sidebar">
        <Stack gap="xxl">
          {/* <StrategyOverviewCard
            collateralReserve={collateralReserve}
            debtReserve={debtReserve}
            apyData={apyData}
          />  */}
          <StrategyAboutCard symbol={collateralReserve.symbol} />
        </Stack>
        <SetupProxyAppWapper collateralReserve={collateralReserve} />
      </TwoColumnGrid>
    </Stack>
  )
}
