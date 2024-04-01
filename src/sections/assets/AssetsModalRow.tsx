import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { Trans, useTranslation } from "react-i18next"
import { BN_0 } from "utils/constants"
import { useDisplayPrice } from "utils/displayAsset"
import { SAssetRow, SCircle } from "./AssetsModalRow.styled"
import { TAsset } from "api/assetDetails"
import BN from "bignumber.js"
import { AssetsModalRowSkeleton } from "./AssetsModalRowSkeleton"
import { useRpcProvider } from "providers/rpcProvider"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useDisplayShareTokenPrice } from "utils/displayAsset"

type AssetsModalRowProps = {
  asset: TAsset
  balance: BN
  spotPriceId: string
  onClick?: (asset: NonNullable<TAsset>) => void
  isActive?: boolean
}

export const AssetsModalRow = ({
  asset,
  spotPriceId,
  onClick,
  balance,
  isActive,
}: AssetsModalRowProps) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const isShareToken = assets.isShareToken(asset)

  const spotPriceAsset = useDisplayPrice(isShareToken ? undefined : spotPriceId)
  const spotPriceShareToken = useDisplayShareTokenPrice(
    isShareToken ? [spotPriceId] : [],
  )
  const spotPrice = isShareToken
    ? spotPriceShareToken.data?.[0]
    : spotPriceAsset.data

  const totalDisplay = !balance?.isZero()
    ? balance.multipliedBy(spotPrice?.spotPrice ?? 1).shiftedBy(-asset.decimals)
    : BN_0

  let iconIds: string | string[]

  if (assets.isStableSwap(asset) || isShareToken) {
    iconIds = asset.assets
  } else if (assets.isBond(asset)) {
    iconIds = asset.assetId
  } else {
    iconIds = asset.id
  }

  if (
    !asset ||
    spotPriceAsset.isInitialLoading ||
    spotPriceShareToken.isInitialLoading
  )
    return <AssetsModalRowSkeleton />

  return (
    <SAssetRow onClick={() => onClick?.(asset)}>
      <div sx={{ display: "flex", align: "center", gap: 10 }}>
        {typeof iconIds === "string" ? (
          <Icon icon={<AssetLogo id={iconIds} />} size={30} />
        ) : (
          <MultipleIcons
            icons={iconIds.map((asset) => ({
              icon: <AssetLogo id={asset} />,
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
            <Trans
              t={t}
              i18nKey="selectAssets.balance"
              tOptions={{
                balance: balance,
                symbol: asset.symbol,
                fixedPointScale: asset.decimals,
                type: "token",
              }}
            >
              <Text
                color={isActive ? "brightBlue300" : "white"}
                fs={14}
                lh={18}
                tAlign="right"
              />
            </Trans>

            <DollarAssetValue
              value={totalDisplay}
              wrapper={(children) => (
                <Text color="whiteish500" fs={12} lh={16}>
                  {children}
                </Text>
              )}
            >
              <DisplayValue value={totalDisplay} />
            </DollarAssetValue>
          </div>
        )}
        {typeof isActive === "boolean" && <SCircle isActive={isActive} />}
      </div>
    </SAssetRow>
  )
}
