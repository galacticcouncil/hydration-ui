import { useTranslation } from "react-i18next"

import { TBond } from "@/api/assets"
import { AssetHeader } from "@/components/AssetHeader"
import { useAssets } from "@/providers/assetsProvider"

export type StableBondsAssetHeaderProps = {
  asset: TBond
}

export const StableBondsAssetHeader: React.FC<StableBondsAssetHeaderProps> = ({
  asset,
}) => {
  const { t } = useTranslation("strategies")
  const { getAssetWithFallback } = useAssets()
  const underlyingAsset = getAssetWithFallback(asset.underlyingAssetId)
  return (
    <AssetHeader
      asset={{
        ...asset,
        name: t("bonds.title.fixedYieldBonds", {
          symbol: underlyingAsset.symbol,
        }),
      }}
    />
  )
}
