import { css } from "@emotion/react"
import BN from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SIcon } from "sections/wallet/assets/table/data/WalletAssetsTableData.styled"
import { theme } from "theme"

export const WalletAssetsTableName = (props: {
  symbol: string
  name: string
}) => {
  return (
    <div sx={{ flex: "row", gap: 8, align: "center" }}>
      <SIcon>{getAssetLogo(props.symbol)}</SIcon>
      <div sx={{ flex: "column", width: "100%" }}>
        <Text fs={[14, 16]} lh={[16, 16]} fw={700} color="white">
          {props.symbol}
        </Text>
        <Text
          fs={[12, 14]}
          lh={[14, 14]}
          fw={500}
          css={{
            color: `rgba(${theme.rgbColors.whiteish500}, 0.61)`,
          }}
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
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {t("value", { value: props.balance, decimalPlaces: 4 })}
      </Text>
      <Text
        fs={[12, 13]}
        lh={[14, 20]}
        fw={500}
        css={css`
          color: rgba(${theme.rgbColors.whiteish500}, 0.61);
        `}
      >
        {t("value.usd", { amount: props.balanceUSD })}
      </Text>
    </div>
  )
}
