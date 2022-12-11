import { u32 } from "@polkadot/types"
import { FC, useMemo } from "react"
import { useAsset } from "api/asset"
import { useTokenBalance } from "api/balances"
import { useAccountStore } from "state/store"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { SAssetRow } from "./AssetsModalRow.styled"
import { Trans, useTranslation } from "react-i18next"
import { useSpotPrice } from "api/spotPrice"
import { BN_NAN } from "utils/constants"
import { Maybe } from "utils/helpers"
import { getAssetName } from "components/AssetIcon/AssetIcon"
import { useApiIds } from "api/consts"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"

interface AssetsModalRowProps {
  id: Maybe<u32 | string>
  onClick?: () => void
}

export const AssetsModalRow: FC<AssetsModalRowProps> = ({ id, onClick }) => {
  const { account } = useAccountStore()
  const { t } = useTranslation()
  const asset = useAsset(id)
  const apiIds = useApiIds()
  const balance = useTokenBalance(id, account?.address)

  const spotPrice = useSpotPrice(id, apiIds.data?.usdId)
  const totalUSD = useMemo(() => {
    if (balance.data && spotPrice.data) {
      return balance.data.balance.times(spotPrice.data.spotPrice)
    }
    return BN_NAN
  }, [balance, spotPrice])

  return (
    <SAssetRow onClick={onClick}>
      <div
        sx={{
          display: "flex",
        }}
      >
        <Icon icon={asset.data?.icon} sx={{ mr: 10 }} />
        <div sx={{ mr: 6 }}>
          <Text fw={700} color="white" fs={16} lh={22}>
            {asset.data?.symbol}
          </Text>
          <Text color="whiteish500" fs={12} lh={16}>
            {asset.data?.name || getAssetName(asset.data?.symbol)}
          </Text>
        </div>
      </div>
      <div
        sx={{
          display: "flex",
          flexDirection: "column",
          align: "end",
        }}
      >
        {balance.data && asset.data && (
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
              value={totalUSD}
              wrapper={(children) => (
                <Text color="whiteish500" fs={12} lh={16}>
                  {children}
                </Text>
              )}
            >
              {t("value.usd", {
                amount: totalUSD,
                fixedPointScale: asset.data.decimals,
              })}
            </DollarAssetValue>
          </>
        )}
      </div>
    </SAssetRow>
  )
}
