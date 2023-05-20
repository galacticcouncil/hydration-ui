import { useAssetList } from "api/assetDetails"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useDisplayAssetStore } from "utils/displayAsset"
import { SCircle, SItem, SItems } from "./HeaderSettingsDisplayAsset.styled"

export const HeaderSettingsDisplayAsset = () => {
  const assets = useAssetList()
  const displayAsset = useDisplayAssetStore()

  if (assets.isLoading || !assets.data) return <div>loading...</div>

  return (
    <SItems>
      {assets.data.map((asset) => (
        <SItem key={asset.id} onClick={() => displayAsset.update(asset)}>
          <div sx={{ width: 26, height: 26 }}>{getAssetLogo(asset.symbol)}</div>
          <div>
            <Text fs={14} lh={14} fw={500} color="white">
              {asset.symbol}
            </Text>
          </div>
          <div sx={{ flex: "row", align: "center", gap: 12 }}>
            <Text fs={14} lh={20} fw={400} color="whiteish500">
              {asset.name}
            </Text>
            <SCircle isActive={asset.id === displayAsset.id} />
          </div>
        </SItem>
      ))}
    </SItems>
  )
}
