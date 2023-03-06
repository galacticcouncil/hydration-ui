import BN from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { SIcon } from "sections/wallet/assets/table/data/WalletAssetsTableData.styled"
import { theme } from "theme"
import { OfferingPair } from "./OtcOffersData.utils"

export const OrderAssetColumn = (props: {
  pair: OfferingPair
  large?: boolean
}) => {
  const { t } = useTranslation()

  return (
    <div>
      <div sx={{ flex: "row", gap: 8, align: "center" }}>
        <SIcon large={props.large}>{getAssetLogo(props.pair.asset)}</SIcon>
        <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
          {t("value.token", { value: props.pair.amount })}
        </Text>
        <Text
          fs={[14, 16]}
          lh={[16, 16]}
          fw={500}
          css={{ color: `rgba(${theme.rgbColors.whiteish500}, 0.61)` }}
        >
          {props.pair.asset}
        </Text>
      </div>
    </div>
  )
}

export const OrderPriceColumn = (props: {
  assetIn: string
  assetOut: string
  price: BN
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row", gap: 8, align: "center" }}>
      <Text
        fs={[13, 15]}
        lh={[16, 16]}
        fw={500}
        css={{ color: `rgba(${theme.rgbColors.whiteish500}, 0.61)` }}
      >
        1 {props.assetIn} / {t("value.token", { value: props.price })}{" "}
        {props.assetOut}
      </Text>
    </div>
  )
}
