import { useMarketAssetsData } from "@galacticcouncil/money-market/hooks"
import { isGho } from "@galacticcouncil/money-market/utils"
import { Paper, Stack } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { Navigate } from "@tanstack/react-router"

import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { StrategyAboutCard } from "@/modules/borrow/multiply/components/StrategyAboutCard"
import { StrategyHeader } from "@/modules/borrow/multiply/components/StrategyHeader"
import { StrategyOverviewCard } from "@/modules/borrow/multiply/components/StrategyOverviewCard"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"

type MultiplyDetailPageProps = {
  id: string
}

export const MultiplyDetailPage: React.FC<MultiplyDetailPageProps> = ({
  id,
}) => {
  const { data: reserves, isLoading } = useMarketAssetsData()
  const { apyMap } = useApyContext()

  //const debtAssetId = getStrategyDebtAssetId(id)

  const collateralReserve = reserves.find(
    (r) => getAssetIdFromAddress(r.underlyingAsset) === id,
  )

  const debtReserve = reserves.find(isGho)

  if (!isLoading && !collateralReserve) {
    return <Navigate to="/borrow/multiply" />
  }

  if (!collateralReserve || !debtReserve) return null

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
            reserve={collateralReserve}
            debtReserve={debtReserve}
            apyData={apyData}
          />
          <StrategyAboutCard symbol={collateralReserve.symbol} />
        </Stack>
        <Paper p="xl" sx={{ minHeight: "6xl" }}></Paper>
      </TwoColumnGrid>
    </Stack>
  )
}
