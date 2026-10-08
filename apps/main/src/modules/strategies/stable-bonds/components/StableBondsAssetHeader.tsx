import { useTranslation } from "react-i18next"

import { TBond } from "@/api/assets"
import { StrategyBadgeType } from "@/modules/strategies/components/StrategyBadge"
import { StrategyHeader } from "@/modules/strategies/components/StrategyHeader"
import { useAssets } from "@/providers/assetsProvider"

export type StableBondsAssetHeaderProps = {
  asset: TBond
  useAssetName?: boolean
}

export const StableBondsAssetHeader: React.FC<StableBondsAssetHeaderProps> = ({
  asset,
  useAssetName,
}) => {
  const { t } = useTranslation("strategies")
  const { getAssetWithFallback } = useAssets()
  const underlyingAsset = getAssetWithFallback(asset.underlyingAssetId)
  const title = useAssetName
    ? asset.name
    : t("bonds.title.stableYieldBonds", {
        symbol: underlyingAsset.symbol,
      })

  return (
    <StrategyHeader
      logoId={asset.id}
      title={title}
      subtitle={asset.symbol}
      badges={[StrategyBadgeType.FixedYield]}
    />
  )
}
