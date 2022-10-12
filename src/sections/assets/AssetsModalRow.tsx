import { Maybe } from "../../utils/types"
import { u32 } from "@polkadot/types"
import { FC, useMemo } from "react"
import { useAsset, useAUSD } from "../../api/asset"
import { useTokenBalance } from "../../api/balances"
import { useAccountStore } from "../../state/store"
import { Icon } from "../../components/Icon/Icon"
import { Text } from "../../components/Typography/Text/Text"
import { SAssetRow } from "./AssetsModalRow.styled"
import { Trans, useTranslation } from "react-i18next"
import { useSpotPrice } from "../../api/spotPrice"
import { BN_0 } from "../../utils/constants"

interface AssetsModalRowProps {
  id: Maybe<u32 | string>
  onClick?: () => void
}

export const AssetsModalRow: FC<AssetsModalRowProps> = ({ id, onClick }) => {
  const { account } = useAccountStore()
  const { t } = useTranslation()
  const asset = useAsset(id)
  const AUSD = useAUSD()
  const balance = useTokenBalance(id, account?.address)

  const spotPrice = useSpotPrice(id, AUSD.data?.id)
  const totalUSD = useMemo(() => {
    if (balance.data && spotPrice.data) {
      return balance.data.balance.times(spotPrice.data.spotPrice)
    }
    return BN_0
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
            {asset.data?.name}
          </Text>
          <Text color="neutralGray400" fs={12} lh={16}>
            {asset.data?.symbol ?? asset.data?.name}
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
          <Trans
            t={t}
            i18nKey="selectAssets.balance"
            tOptions={{
              balance: balance.data.balance,
              decimalPlaces: 4,
              fixedPointScale: asset.data.decimals,
              numberSuffix: ` ${asset.data.name}`,
            }}
          >
            <Text color="white" fs={14} lh={18} />
          </Trans>
        )}
        <Text color="neutralGray400" fs={12} lh={16}>
          {t("value.usd", {
            amount: totalUSD,
          })}
        </Text>
      </div>
    </SAssetRow>
  )
}
