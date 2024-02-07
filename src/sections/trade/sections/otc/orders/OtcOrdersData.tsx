import BN from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { OfferingPair } from "./OtcOrdersData.utils"
import { motion } from "framer-motion"

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
      <div style={{ width: "22px" }}>
        <AssetLogo id={props.pair.asset} />
      </div>
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {t("value.token", { value: props.pair.amount })}
      </Text>
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="whiteish500">
        {props.pair.symbol}
      </Text>
    </div>
  )
}

export const OrderPriceColumn = (props: { pair: OfferingPair; price: BN }) => {
  const { t } = useTranslation()

  const formatPrice = (price: BN) => {
    if (price) {
      const decimalPlaces = price.decimalPlaces()
      if (decimalPlaces) {
        if (decimalPlaces <= 2 || price.gt(10)) {
          return "$" + price.toFixed(2)
        } else {
          return "$" + price.toFixed(Math.min(4, decimalPlaces))
        }
      } else {
        return "$" + price.toFixed(2)
      }
    }
  }

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        width: "100%",
        gap: 8,
      }}
    >
      {props?.price?.isNaN() ? (
        <Text fs={12} fw={400} color="basic400" tAlign={"center"} as="div">
          N / A
        </Text>
      ) : (
        <>
          <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
            {t("value.token", { value: 1 })} {props.pair.symbol}
          </Text>
          <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="whiteish500">
            ({formatPrice(props.price)})
          </Text>
        </>
      )}
    </div>
  )
}

export const OrderMarketPriceColumn = (props: {
  pair: OfferingPair
  price: BN
  percentage: number
}) => {
  const { t } = useTranslation()
  const color =
    props.percentage > 0
      ? "green600"
      : props.percentage < 0
      ? "red400"
      : "whiteish500"

  const formatPrice = (price: BN) => {
    if (price) {
      const decimalPlaces = price.decimalPlaces()
      if (decimalPlaces) {
        if (decimalPlaces <= 2 || price.gt(10)) {
          return "$" + price.toFixed(2)
        } else {
          return "$" + price.toFixed(Math.min(4, decimalPlaces))
        }
      } else {
        return "$" + price.toFixed(2)
      }
    }
  }

  const parentVariants = {
    initial: {},
    hover: {},
  }

  const childVariants = {
    initial: { opacity: 0, y: 0 },
    hover: { opacity: 1, y: 6 },
  }

  return (
    <motion.div
      variants={parentVariants}
      initial="initial"
      whileHover="hover"
      sx={{
        flex: "column",
        justify: "center",
        align: ["flex-end", "center"],
        width: "100%",
      }}
      style={{ position: "relative" }}
    >
      {props.percentage ? (
        <Text fs={[14, 16]} lh={[16, 16]} fw={500} color={color as any}>
          {props.percentage.toFixed(2)}%
        </Text>
      ) : (
        <Text fs={12} fw={400} color="basic400" tAlign={"center"} as="div">
          N / A
        </Text>
      )}

      <motion.div
        variants={childVariants}
        transition={{ delay: 0.4, duration: 0.2 }}
      >
        <div
          sx={{
            flex: "row",
            flexDirection: "row",
            align: "center",
            justify: "center",
            gap: 8,
          }}
          style={{
            position: "absolute",
            width: "100%",
            whiteSpace: "nowrap",
          }}
        >
          <Text fs={12} fw={500} color="white" sx={{ textAlign: "center" }}>
            {t("value.token", { value: 1 })} {props.pair.symbol}
          </Text>
          <Text
            fs={12}
            fw={500}
            color="whiteish500"
            sx={{ textAlign: "center" }}
          >
            ({formatPrice(props.price)})
          </Text>
        </div>
      </motion.div>
    </motion.div>
  )
}
