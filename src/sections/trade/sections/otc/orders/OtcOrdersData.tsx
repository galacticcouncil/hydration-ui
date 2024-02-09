import BN from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { OfferingPair } from "./OtcOrdersData.utils"
import { motion } from "framer-motion"
import { useRpcProvider } from "providers/rpcProvider"

export const OrderPairColumn = (props: {
  offering: OfferingPair
  accepting: OfferingPair
  pol: boolean
}) => {
  const { assets } = useRpcProvider()
  const offerAssetDetails = assets.getAsset(props.offering.asset)
  const acceptAssetDetails = assets.getAsset(props.accepting.asset)
  const offerIsBond = assets.isBond(offerAssetDetails)
  const acceptIsBond = assets.isBond(acceptAssetDetails)

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      {assets.isStableSwap(offerAssetDetails) ||
      assets.isShareToken(offerAssetDetails) ? (
        <MultipleIcons
          size={22}
          icons={offerAssetDetails.assets.map((assetId: string) => {
            const meta = assets.getAsset(assetId)
            const isBond = assets.isBond(meta)
            return {
              icon: (
                <Icon
                  size={22}
                  icon={<AssetLogo id={isBond ? meta.assetId : assetId} />}
                />
              ),
            }
          })}
        />
      ) : (
        <Icon
          size={22}
          icon={
            <AssetLogo
              id={
                offerIsBond ? offerAssetDetails.assetId : offerAssetDetails.id
              }
            />
          }
        />
      )}
      {assets.isStableSwap(acceptAssetDetails) ||
      assets.isShareToken(acceptAssetDetails) ? (
        <MultipleIcons
          size={22}
          icons={acceptAssetDetails.assets.map((assetId: string) => {
            const meta = assets.getAsset(assetId)
            const isBond = assets.isBond(meta)
            return {
              icon: (
                <Icon
                  size={22}
                  icon={<AssetLogo id={isBond ? meta.assetId : assetId} />}
                />
              ),
            }
          })}
        />
      ) : (
        <Icon
          size={22}
          icon={
            <AssetLogo
              id={
                acceptIsBond
                  ? acceptAssetDetails.assetId
                  : acceptAssetDetails.id
              }
            />
          }
        />
      )}
      {/* <MultipleIcons
        icons={[
          { icon: <AssetLogo id={props.offering.asset} /> },
          { icon: <AssetLogo id={props.accepting.asset} /> },
        ]}
      /> */}
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
  const { assets } = useRpcProvider()

  const assetDetails = assets.getAsset(props.pair.asset)
  const isBond = assets.isBond(assetDetails)

  return (
    <div sx={{ flex: "row", align: "center", gap: 4 }}>
      {assets.isStableSwap(assetDetails) ||
      assets.isShareToken(assetDetails) ? (
        <MultipleIcons
          size={22}
          icons={assetDetails.assets.map((assetId: string) => {
            const meta = assets.getAsset(assetId)
            const isBond = assets.isBond(meta)
            return {
              icon: (
                <Icon
                  size={22}
                  icon={<AssetLogo id={isBond ? meta.assetId : assetId} />}
                />
              ),
            }
          })}
        />
      ) : (
        <Icon
          size={22}
          icon={
            <AssetLogo id={isBond ? assetDetails.assetId : assetDetails.id} />
          }
        />
      )}
      <div
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          sx={{
            display: "flex",
            gap: 2,
          }}
        >
          <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
            {t("value.token", { value: props.pair.amount })}
          </Text>
          <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="whiteish500">
            {props.pair.symbol}
          </Text>
        </div>

        {isBond && (
          <Text fs={11} lh={[16, 16]} fw={500} color="whiteish500">
            {assetDetails.name.replace("HDX Bond ", "")}
          </Text>
        )}
      </div>
    </div>
  )

  // return (
  //   <div sx={{ flex: "row", gap: 4, align: "center" }}>
  //     <div style={{ width: "22px" }}>
  //       <AssetLogo id={props.pair.asset} />
  //     </div>
  //     <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
  //       {t("value.token", { value: props.pair.amount })}
  //     </Text>
  //     <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="whiteish500">
  //       {props.pair.symbol}
  //     </Text>
  //   </div>
  // )
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

  const formatPercentage = (percent: number) => {
    if (percent) {
      return percent > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`
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
          {formatPercentage(props.percentage)}
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
