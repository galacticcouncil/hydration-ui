import { Stack } from "@galacticcouncil/ui/components"

import { AssetHeader } from "@/modules/borrow/multiply/components/AssetHeader"
import { useMultiplyPairDetailData } from "@/modules/borrow/multiply/hooks/useMultiplyPairDetailData"
import { MultiplyDetailPage } from "@/modules/borrow/multiply/MultiplyDetailPage"
import { MultiplyAssetPairConfig } from "@/modules/borrow/multiply/types"

export type MultiplyPairDetailPageProps = {
  config: MultiplyAssetPairConfig
}

export const MultiplyPairDetailPage: React.FC<MultiplyPairDetailPageProps> = ({
  config,
}) => {
  const detail = useMultiplyPairDetailData(config)

  if (!detail) return null

  return (
    <Stack gap="xxl">
      <AssetHeader
        collateralReserve={detail.collateralReserve}
        config={config}
      />
      <MultiplyDetailPage config={config} {...detail} />
    </Stack>
  )
}
