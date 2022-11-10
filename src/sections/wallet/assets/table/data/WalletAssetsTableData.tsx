import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { SIcon } from "sections/wallet/assets/table/data/WalletAssetsTableData.styled"

export const WalletAssetsTableName = (props: {
  symbol: string
  name: string
}) => {
  return (
    <div sx={{ flex: "row", gap: 6, align: "center" }}>
      <SIcon>{getAssetLogo(props.symbol)}</SIcon>
      <div sx={{ flex: "column", width: "100%" }}>
        <Text fs={14} lh={[16, 18]} fw={500} color="white">
          {props.symbol}
        </Text>
        <Text
          fs={[10, 12]}
          lh={[14, 16]}
          fw={500}
          color="neutralGray400"
          css={{ letterSpacing: "0.02em" }}
        >
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
    <div sx={{ flex: "column", align: ["end", "start"], gap: 2 }}>
      <Text fs={14} lh={18} fw={500} color="white">
        {t("value", { value: props.balance, decimalPlaces: 4 })}
      </Text>
      <Text fs={[11, 12]} lh={[14, 16]} fw={500} color="neutralGray500">
        {t("value.usd", { amount: props.balanceUSD })}
      </Text>
    </div>
  )
}
