import { u32 } from "@polkadot/types"
import { UseAssetModel, useAsset } from "api/asset"
import { useTokenBalance } from "api/balances"
import { getAssetName } from "components/AssetIcon/AssetIcon"
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

interface AssetsModalRowProps {
  id: Maybe<u32 | string>
  onClick?: (asset: NonNullable<UseAssetModel>) => void
}

export const AssetsModalRow: FC<AssetsModalRowProps> = ({ id, onClick }) => {
  const { account } = useAccountStore()
  const { t } = useTranslation()
  const asset = useAsset(id)
  const balance = useTokenBalance(id, account?.address)

  const spotPrice = useDisplayPrice(id ?? "")
  const totalDisplay = useMemo(() => {
    if (balance.data && spotPrice.data) {
      return balance.data.balance
        .times(spotPrice.data.spotPrice)
        .div(BN_10.pow(asset.data?.decimals.toBigNumber() ?? 12))
    }
    return BN_NAN
  }, [asset.data?.decimals, balance.data, spotPrice.data])

  if (!asset.data) return null

  return (
    <SAssetRow onClick={() => asset.data && onClick?.(asset.data)}>
      <div sx={{ display: "flex", align: "center" }}>
        <Icon icon={asset.data.icon} sx={{ mr: 10 }} size={30} />
        <div sx={{ mr: 6 }}>
          <Text fw={700} color="white" fs={16} lh={22}>
            {asset.data?.symbol}
          </Text>
          <Text color="whiteish500" fs={12} lh={16}>
            {asset.data.name || getAssetName(asset.data.symbol)}
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
                fixedPointScale: asset.data.decimals,
                numberSuffix: ` ${asset.data.symbol}`,
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
