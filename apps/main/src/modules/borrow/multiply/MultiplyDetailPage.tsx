import { useMarketAssetsData } from "@galacticcouncil/money-market/hooks"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { Stack } from "@galacticcouncil/ui/components"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"

import { useApyContext } from "@/modules/borrow/context/ApyContext"
import { AboutCard } from "@/modules/borrow/multiply/components/AboutCard"
import { AssetHeader } from "@/modules/borrow/multiply/components/AssetHeader"
import { OverviewCard } from "@/modules/borrow/multiply/components/OverviewCard"
import { MultiplyAppWrapper } from "@/modules/borrow/multiply/MultiplyAppWrapper"
import { MultiplyPositionsTable } from "@/modules/borrow/multiply/MultiplyPositionsTable"
import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { useAssets } from "@/providers/assetsProvider"

type MultiplyDetailPageProps = {
  config: MultiplyAssetPairConfig
}

export const MultiplyDetailPage: React.FC<MultiplyDetailPageProps> = ({
  config,
}) => {
  const { getAsset } = useAssets()
  const { data: reserves } = useMarketAssetsData()

  const { apyMap } = useApyContext()

  const collateralReserve = reserves.find(
    (r) =>
      getAssetIdFromAddress(r.underlyingAsset) === config?.collateralAssetId,
  )

  const borrowAssetId = config?.debtAssetId ?? ""
  const borrowAsset = getAsset(borrowAssetId)

  const debtReserve = borrowAsset
    ? reserves.find(
        (r) => r.underlyingAsset === getReserveAddressByAssetId(borrowAsset.id),
      )
    : undefined

  const validReserves = !!collateralReserve && !!debtReserve

  if (!validReserves) return null

  const apyData = apyMap.get(config?.collateralAssetId ?? "")

  return (
    <Stack gap="xxl">
      <AssetHeader
        collateralReserve={collateralReserve}
        debtReserve={debtReserve}
      />

      <TwoColumnGrid template="sidebar">
        <Stack gap="xxl">
          <MultiplyPositionsTable />
          <OverviewCard
            collateralReserve={collateralReserve}
            debtReserve={debtReserve}
            apyData={apyData}
          />
          <AboutCard symbol={collateralReserve.symbol} />
        </Stack>

        <MultiplyAppWrapper
          collateralReserve={collateralReserve}
          debtReserve={debtReserve}
        />
      </TwoColumnGrid>
    </Stack>
  )
}
