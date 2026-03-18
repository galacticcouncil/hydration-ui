import { Stack } from "@galacticcouncil/ui/components"

import { AboutCard } from "@/modules/borrow/multiply/components/AboutCard"
import { OverviewCard } from "@/modules/borrow/multiply/components/OverviewCard"
import { StrategyPositionsByAsset } from "@/modules/borrow/multiply/components/StraregyPositionsByAsset"
import { MultiplyPairDetailData } from "@/modules/borrow/multiply/hooks/useMultiplyPairDetailData"
import { MultiplyAppWrapper } from "@/modules/borrow/multiply/MultiplyAppWrapper"
import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"

type MultiplyDetailPageProps = {
  config: MultiplyAssetPairConfig
} & MultiplyPairDetailData

export const MultiplyDetailPage: React.FC<MultiplyDetailPageProps> = ({
  config,
  collateralReserve,
  debtReserve,
  apyData,
}) => {
  return (
    <TwoColumnGrid template="sidebar">
      <Stack>
        <StrategyPositionsByAsset
          assetId={config.collateralAssetId}
          actionColumnHidden={true}
          sx={{ mb: "xxl" }}
        />
        <Stack gap="xxl">
          <OverviewCard
            collateralReserve={collateralReserve}
            debtReserve={debtReserve}
            apyData={apyData}
          />
          <AboutCard symbol={collateralReserve.symbol} />
        </Stack>
      </Stack>

      <MultiplyAppWrapper
        collateralReserve={collateralReserve}
        debtReserve={debtReserve}
        strategy={config}
      />
    </TwoColumnGrid>
  )
}
