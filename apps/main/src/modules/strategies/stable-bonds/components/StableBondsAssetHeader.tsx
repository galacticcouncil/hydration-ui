import { useTranslation } from "react-i18next"

import { TBond } from "@/api/assets"
import { AssetHeader } from "@/components/AssetHeader"
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
  const headerAsset = useAssetName
    ? asset
    : {
        ...asset,
        name: t("bonds.title.stableYieldBonds", {
          symbol: underlyingAsset.symbol,
        }),
      }

  return <AssetHeader asset={headerAsset} />
}
