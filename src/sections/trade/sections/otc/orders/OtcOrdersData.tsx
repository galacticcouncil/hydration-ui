import BN from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { OfferingPair } from "./OtcOrdersData.utils"

export const OrderPairColumn = (props: {
  offering: OfferingPair
  accepting: OfferingPair
  pol: boolean
}) => {
  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <MultipleIcons
        icons={[
          { icon: <AssetLogo id={props.offering.asset} /> },
          { icon: <AssetLogo id={props.accepting.asset} /> },
        ]}
      />
      <div sx={{ display: "box", ml: 8 }}>
        <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="basic400">
          {props.offering.symbol} / {props.accepting.symbol}
        </Text>
        {props.pol && (
          <span
            css={{
              fontSize: 10,
              fontWeight: 600,
              border: "1px solid #FC408C",
              borderRadius: "4px",
              width: "31px",
              height: "16px",
              padding: "1px 6px",
              color: "#fff",
              background: "rgba(255, 2, 103, 0.6)",
            }}
          >
            POL
          </span>
        )}
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
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {t("value.token", { value: props.pair.amount })}
      </Text>
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="whiteish500">
        {props.pair.symbol}
      </Text>
    </div>
  )
}

export const OrderPriceColumn = (props: { symbol: string; price: BN }) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "row", gap: 8, align: ["end", "start"] }}>
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {t("value.token", { value: props.price })} {props.symbol}
      </Text>
    </div>
  )
}
