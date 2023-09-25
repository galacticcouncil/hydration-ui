import { u32 } from "@polkadot/types"
import { useTokenBalance } from "api/balances"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { FC, useMemo } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useAccountStore } from "state/store"
import { BN_10, BN_NAN } from "utils/constants"
import { useDisplayPrice } from "utils/displayAsset"
import { Maybe } from "utils/helpers"
import { SAssetRow } from "./AssetsModalRow.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { TAsset } from "api/assetDetails"

interface AssetsModalRowProps {
  id: Maybe<u32 | string>
  onClick?: (asset: NonNullable<TAsset>) => void
}

export const AssetsModalRow: FC<AssetsModalRowProps> = ({ id, onClick }) => {
  const { account } = useAccountStore()
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const asset = id ? assets.getAsset(id.toString()) : undefined
  const balance = useTokenBalance(id, account?.address)

  const spotPrice = useDisplayPrice(id ?? "")
  const totalDisplay = useMemo(() => {
    if (balance.data && spotPrice.data) {
      return balance.data.balance
        .times(spotPrice.data.spotPrice)
        .div(BN_10.pow(asset?.decimals ?? 12))
    }
    return BN_NAN
  }, [asset?.decimals, balance.data, spotPrice.data])

  if (!asset) return null

  return (
    <SAssetRow onClick={() => asset && onClick?.(asset)}>
      <div sx={{ display: "flex", align: "center" }}>
        <Icon icon={<AssetLogo id={asset.id} />} sx={{ mr: 10 }} size={30} />
        <div sx={{ mr: 6 }}>
          <Text fw={700} color="white" fs={16} lh={22}>
            {asset.symbol}
          </Text>
          <Text color="whiteish500" fs={12} lh={16}>
            {asset.name}
          </Text>
        </div>
      </div>
      <div sx={{ display: "flex", flexDirection: "column", align: "end" }}>
        {balance.data && (
          <>
            <Trans
              t={t}
              i18nKey="selectAssets.balance"
              tOptions={{
                balance: balance.data.balance,
                fixedPointScale: asset.decimals,
                numberSuffix: ` ${asset.symbol}`,
                type: "token",
              }}
            >
              <Text color="white" fs={14} lh={18} tAlign="right" />
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
          </>
        )}
      </div>
    </SAssetRow>
  )
}
