import BN from "bignumber.js"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { OfferingPair } from "./OtcOrdersData.utils"

export const OrderPairColumn = (props: {
  offering: OfferingPair
  accepting: OfferingPair
}) => {
  return (
    <div>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <MultipleIcons
          icons={[
            { icon: getAssetLogo(props.offering.symbol) },
            { icon: getAssetLogo(props.accepting.symbol) },
          ]}
        />
        <Text
          fs={[14, 16]}
          lh={[16, 16]}
          fw={500}
          sx={{ ml: 8 }}
          color="basic400"
        >
          {props.offering.symbol} / {props.accepting.symbol}
        </Text>
      </div>
    </div>
  )
}

export const OrderAssetColumn = (props: {
  pair: OfferingPair
  large?: boolean
}) => {
  const { t } = useTranslation()

  return (
    <div>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
          {t("value.token", { value: props.pair.amount })}
        </Text>
        <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="whiteish500">
          {props.pair.symbol}
        </Text>
      </div>
    </div>
  )
}

export const OrderPriceColumn = (props: { symbol: string; price: BN }) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row", gap: 8,  align: ["end", "start"]}}>
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {t("value.token", { value: props.price })} {props.symbol}
      </Text>
    </div>
  )
}
