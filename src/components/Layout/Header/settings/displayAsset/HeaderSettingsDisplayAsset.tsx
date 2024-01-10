import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import {
  FIAT_CURRENCIES,
  FiatCurrency,
  useDisplayAssetStore,
} from "utils/displayAsset"
import {
  SCircle,
  SItem,
  SItemUSD,
  SItems,
} from "./HeaderSettingsDisplayAsset.styled"
import { HeaderSettingsDisplayAssetSkeleton } from "./skeleton/HeaderSettingsDisplayAssetSkeleton"
import { Icon } from "components/Icon/Icon"
import { useRpcProvider } from "providers/rpcProvider"

type Props = { onSelect: () => void }

export const HeaderSettingsDisplayAsset = ({ onSelect }: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const sortedTokens = assets.tradeAssets
    .filter((tradeAsset) => tradeAsset.isToken)
    .sort((a, b) => a.symbol.localeCompare(b.symbol))

  const displayAsset = useDisplayAssetStore()

  const onSelectStableCoin = () => {
    displayAsset.update({
      id: displayAsset.stableCoinId,
      stableCoinId: displayAsset.stableCoinId,
      symbol: "$",
      isFiat: false,
      isStableCoin: true,
    })
    onSelect()
  }
  const onSelectAsset = (asset: { id: string; symbol: string }) => {
    displayAsset.update({
      id: asset.id,
      stableCoinId: displayAsset.stableCoinId,
      symbol: asset.symbol,
      isFiat: false,
      isStableCoin: false,
    })
    onSelect()
  }
  const onSelectFiat = (fiat: FiatCurrency) => {
    displayAsset.update({
      id: fiat.id,
      stableCoinId: displayAsset.stableCoinId,
      symbol: fiat.symbol,
      isFiat: true,
      isStableCoin: false,
    })
    onSelect()
  }

  if (!sortedTokens) return <HeaderSettingsDisplayAssetSkeleton />

  return (
    <SItems>
      <SItemUSD
        key="stablecoin"
        isActive={displayAsset.isStableCoin}
        onClick={onSelectStableCoin}
      >
        <div sx={{ flex: "column", gap: 4 }}>
          <Text fs={14} lh={14} fw={500} color="white">
            USD
          </Text>
          <Text fs={12} lh={18} fw={400} color="whiteish500">
            {t("header.settings.displayAsset.stableCoin")}
          </Text>
        </div>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          <Text
            fs={14}
            lh={20}
            fw={400}
            tAlign="right"
            css={{ color: "inherit" }}
          >
            USD
          </Text>
          <SCircle isActive={displayAsset.isStableCoin} />
        </div>
      </SItemUSD>
      {FIAT_CURRENCIES.map((fiat) => (
        <SItemUSD
          key={fiat.symbol}
          isActive={displayAsset.isFiat && displayAsset.id === fiat.id}
          onClick={() => onSelectFiat(fiat)}
        >
          <div sx={{ flex: "column", gap: 4 }}>
            <Text fs={14} lh={14} fw={500} color="white">
              {fiat.name}
            </Text>
            <Text fs={12} lh={18} fw={400} color="whiteish500">
              {t("header.settings.displayAsset.fiat", {
                symbol: fiat.id.toUpperCase(),
              })}
            </Text>
          </div>
          <div sx={{ flex: "row", align: "center", gap: 12 }}>
            <Text
              fs={14}
              lh={20}
              fw={400}
              tAlign="right"
              css={{ color: "inherit" }}
            >
              {fiat.id.toUpperCase()}
            </Text>
            <SCircle
              isActive={displayAsset.isFiat && displayAsset.id === fiat.id}
            />
          </div>
        </SItemUSD>
      ))}
      {sortedTokens.map((asset) => {
        const isActive =
          asset.id === displayAsset.id && !displayAsset.isStableCoin

        return (
          <SItem
            key={asset.id}
            isActive={isActive}
            onClick={() => onSelectAsset(asset)}
          >
            <div sx={{ width: 26, height: 26 }}>
              <Icon icon={<AssetLogo id={asset.id} />} />
            </div>
            <div>
              <Text fs={14} lh={14} fw={500} color="white">
                {asset.symbol}
              </Text>
            </div>
            <div sx={{ flex: "row", align: "center", gap: 12 }}>
              <Text
                fs={14}
                lh={20}
                fw={400}
                tAlign="right"
                css={{ color: "inherit" }}
              >
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
