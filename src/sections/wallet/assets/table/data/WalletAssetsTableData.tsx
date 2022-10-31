import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import Skeleton from "react-loading-skeleton"
import BN from "bignumber.js"
import { useTranslation } from "react-i18next"

export const WalletAssetsTableName = (props: {
  symbol: string
  name: string
}) => {
  return (
    <div sx={{ flex: "row", gap: 6, align: "center" }}>
      <div sx={{ width: 32, height: 32 }}>{getAssetLogo(props.symbol)}</div>
      <div sx={{ flex: "column", width: "100%" }}>
        <Text fs={14} lh={18} fw={500} color="white">
          {props.symbol}
        </Text>
        <Text fs={12} lh={16} fw={500} color="neutralGray500">
          {props.name}
        </Text>
      </div>
    </div>
  )
}

export const WalletAssetsTableBalance = (props: {
  balance: BN
  balanceUSD: BN
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", gap: 2 }}>
      <Text fs={14} lh={18} fw={500} color="white">
        {t("value", { value: props.balance })}
      </Text>
      <Text fs={12} lh={16} fw={500} color="neutralGray500">
        {t("value.usd", { amount: props.balanceUSD })}
      </Text>
    </div>
  )
}
