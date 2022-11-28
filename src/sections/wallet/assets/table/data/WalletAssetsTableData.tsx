import { css } from "@emotion/react"
import BN from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SIcon } from "sections/wallet/assets/table/data/WalletAssetsTableData.styled"
import { theme } from "theme"

export const WalletAssetsTableName = ({
  large,
  symbol,
  name,
  isPaymentFee,
}: {
  symbol: string
  name: string
  large?: boolean
  isPaymentFee: boolean
}) => {
  const { t } = useTranslation()

  return (
    <div>
      <div sx={{ flex: "row", gap: 8, align: "center" }}>
        <SIcon large={large}>{getAssetLogo(symbol)}</SIcon>
        <div sx={{ flex: "column", width: "100%" }}>
          <Text
            fs={[large ? 18 : 14, 16]}
            lh={[large ? 16 : 23, 16]}
            fw={700}
            color="white"
          >
            {symbol}
          </Text>
          <Text
            fs={[large ? 13 : 12, 14]}
            lh={[large ? 17 : 14, 14]}
            fw={500}
            css={{
              color: `rgba(${theme.rgbColors.whiteish500}, 0.61)`,
            }}
          >
            {name}
          </Text>
        </div>
      </div>
      {isPaymentFee && (
        <Text
          fs={9}
          fw={700}
          sx={{
            mt: 4,
            ml: large ? 50 : [32, 40],
          }}
          color="pink700"
          tTransform="uppercase"
        >
          {t("wallet.assets.table.details.feePaymentAsset")}
        </Text>
      )}
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
