import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssets } from "providers/assets"
import { Text } from "components/Typography/Text/Text"

export type AssetOverviewLogoProps = {
  assetId: string
}

export const AssetOverviewLogo: React.FC<AssetOverviewLogoProps> = ({
  assetId,
}) => {
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const symbol = asset.symbol
  const name = asset.name || asset.symbol

  return (
    <div sx={{ flex: "row", gap: 8, align: "center" }}>
      <MultipleAssetLogo size={[40, 50]} iconId={asset.iconId} />
      <div sx={{ flex: "column", width: "100%", gap: [0, 2] }}>
        <Text fs={[14, 16]} font="GeistMedium" color="white">
          {symbol}
        </Text>
        {symbol !== name && (
          <Text fs={[12, 14]} color="whiteish500">
            {name}
          </Text>
        )}
      </div>
    </div>
  )
}
