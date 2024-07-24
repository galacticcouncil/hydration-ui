import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SAssetRow, SCircle } from "./AssetsModalRow.styled"
import { TAsset } from "api/assetDetails"
import BN from "bignumber.js"
import { AssetsModalRowSkeleton } from "./AssetsModalRowSkeleton"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"

type AssetsModalRowProps = {
  asset: TAsset
  balance: BN
  displaValue: BN
  onClick?: (asset: NonNullable<TAsset>) => void
  isActive?: boolean
  isSelected?: boolean
}

export const AssetsModalRow = ({
  asset,
  onClick,
  balance,
  displaValue,
  isActive,
  isSelected,
}: AssetsModalRowProps) => {
  const { t } = useTranslation()

  if (!asset) return <AssetsModalRowSkeleton />

  return (
    <SAssetRow onClick={() => onClick?.(asset)} isSelected={!!isSelected}>
      <div sx={{ display: "flex", align: "center", gap: 10 }}>
        {typeof asset.iconId === "string" ? (
          <Icon icon={<AssetLogo id={asset.iconId} />} size={30} />
        ) : (
          <MultipleIcons
            icons={asset.iconId.map((asset) => ({
              icon: <AssetLogo key={asset} id={asset} />,
            }))}
          />
        )}

        <div sx={{ mr: 6 }}>
          <Text fw={700} color="white" fs={16} lh={22}>
            {asset.symbol}
          </Text>
          <Text color="whiteish500" fs={12} lh={16}>
            {asset.name}
          </Text>
        </div>
      </div>
      <div sx={{ flex: "row", align: "center", gap: 20 }}>
        {balance && (
          <div sx={{ display: "flex", flexDirection: "column", align: "end" }}>
            <Text
              color={isActive ? "brightBlue300" : "white"}
              fs={14}
              tAlign="right"
            >
              {t("value.tokenWithSymbol", {
                value: balance,
                symbol: asset.symbol,
                fixedPointScale: asset.decimals,
              })}
            </Text>

            <DollarAssetValue
              value={displaValue}
              wrapper={(children) => (
                <Text color="whiteish500" fs={12} lh={16}>
                  {children}
                </Text>
              )}
            >
              <DisplayValue value={displaValue} />
            </DollarAssetValue>
          </div>
        )}
        {typeof isActive === "boolean" && <SCircle isActive={isActive} />}
      </div>
    </SAssetRow>
  )
}
