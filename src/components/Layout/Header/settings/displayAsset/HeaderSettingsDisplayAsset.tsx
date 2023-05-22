import { useAssetList } from "api/assetDetails"
import { useApiIds } from "api/consts"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useDisplayAssetStore } from "utils/displayAsset"
import {
  SCircle,
  SItem,
  SItemUSD,
  SItems,
} from "./HeaderSettingsDisplayAsset.styled"
import { HeaderSettingsDisplayAssetSkeleton } from "./skeleton/HeaderSettingsDisplayAssetSkeleton"

type Props = { onSelect: () => void }

export const HeaderSettingsDisplayAsset = ({ onSelect }: Props) => {
  const { t } = useTranslation()
  const apiIds = useApiIds()
  const assets = useAssetList()
  const displayAsset = useDisplayAssetStore()

  if (assets.isLoading || apiIds.isLoading || !apiIds.data || !assets.data)
    return <HeaderSettingsDisplayAssetSkeleton />

  return (
    <SItems>
      <SItemUSD
        key="usd"
        isActive={displayAsset.symbol === "USD"}
        onClick={() => {
          displayAsset.update({ id: apiIds.data.stableCoinId, symbol: "USD" })
          onSelect()
        }}
      >
        <div sx={{ flex: "column", gap: 4 }}>
          <Text fs={14} lh={14} fw={500} color="white">
            $
          </Text>
          <Text fs={12} lh={18} fw={400} color="whiteish500">
            {t("header.settings.displayAsset.usd")}
          </Text>
        </div>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          <Text fs={14} lh={20} fw={400} css={{ color: "inherit" }}>
            USD
          </Text>
          <SCircle isActive={displayAsset.symbol === "USD"} />
        </div>
      </SItemUSD>
      {assets.data.map((asset) => (
        <SItem
          key={asset.id}
          isActive={asset.symbol === displayAsset.symbol}
          onClick={() => {
            displayAsset.update(asset)
            onSelect()
          }}
        >
          <div sx={{ width: 26, height: 26 }}>{getAssetLogo(asset.symbol)}</div>
          <div>
            <Text fs={14} lh={14} fw={500} color="white">
              {asset.symbol}
            </Text>
          </div>
          <div sx={{ flex: "row", align: "center", gap: 12 }}>
            <Text fs={14} lh={20} fw={400} css={{ color: "inherit" }}>
              {asset.name}
            </Text>
            <SCircle isActive={asset.symbol === displayAsset.symbol} />
          </div>
        </SItem>
      ))}
    </SItems>
  )
}
