import { useAssetList } from "api/assetDetails"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
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
import { Icon } from "components/Icon/Icon"

type Props = { onSelect: () => void }

export const HeaderSettingsDisplayAsset = ({ onSelect }: Props) => {
  const { t } = useTranslation()
  const assets = useAssetList()
  const displayAsset = useDisplayAssetStore()

  const onSelectUSD = () => {
    displayAsset.update({
      id: displayAsset.stableCoinId,
      stableCoinId: displayAsset.stableCoinId,
      symbol: "$",
      isRealUSD: true,
      isStableCoin: false,
    })
    onSelect()
  }
  const onSelectStableCoin = () => {
    displayAsset.update({
      id: displayAsset.stableCoinId,
      stableCoinId: displayAsset.stableCoinId,
      symbol: "$",
      isRealUSD: false,
      isStableCoin: true,
    })
    onSelect()
  }
  const onSelectAsset = (asset: { id: string; symbol: string }) => {
    displayAsset.update({
      id: asset.id,
      stableCoinId: displayAsset.stableCoinId,
      symbol: asset.symbol,
      isRealUSD: false,
      isStableCoin: false,
    })
    onSelect()
  }

  if (assets.isLoading || !assets.data)
    return <HeaderSettingsDisplayAssetSkeleton />

  return (
    <SItems>
      <SItemUSD
        key="usd"
        isActive={displayAsset.isRealUSD}
        onClick={onSelectUSD}
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
          <SCircle isActive={displayAsset.isRealUSD} />
        </div>
      </SItemUSD>
      <SItemUSD
        key="stablecoin"
        isActive={displayAsset.isStableCoin}
        onClick={onSelectStableCoin}
      >
        <div sx={{ flex: "column", gap: 4 }}>
          <Text fs={14} lh={14} fw={500} color="white">
            $
          </Text>
          <Text fs={12} lh={18} fw={400} color="whiteish500">
            {t("header.settings.displayAsset.stableCoin")}
          </Text>
        </div>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          <Text fs={14} lh={20} fw={400} css={{ color: "inherit" }}>
            USD
          </Text>
          <SCircle isActive={displayAsset.isStableCoin} />
        </div>
      </SItemUSD>
      {assets.data.map((asset) => {
        const isActive =
          asset.id === displayAsset.id &&
          !displayAsset.isStableCoin &&
          !displayAsset.isRealUSD

        return (
          <SItem
            key={asset.id}
            isActive={isActive}
            onClick={() => onSelectAsset(asset)}
          >
            <div sx={{ width: 26, height: 26 }}>
              <Icon icon={<AssetLogo symbol={asset.symbol} />} />
            </div>
            <div>
              <Text fs={14} lh={14} fw={500} color="white">
                {asset.symbol}
              </Text>
            </div>
            <div sx={{ flex: "row", align: "center", gap: 12 }}>
              <Text fs={14} lh={20} fw={400} css={{ color: "inherit" }}>
                {asset.name}
              </Text>
              <SCircle isActive={isActive} />
            </div>
          </SItem>
        )
      })}
    </SItems>
  )
}
