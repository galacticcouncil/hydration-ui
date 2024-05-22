import BN from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { OfferingPair } from "./OtcOrdersData.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useMedia } from "react-use"
import { theme } from "theme"
import { DisplayValue } from "components/DisplayValue/DisplayValue"

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
    <div sx={{ flex: "row", gap: 6, align: "center" }}>
      {assets.isStableSwap(offerAssetDetails) ||
      assets.isShareToken(offerAssetDetails) ? (
        <MultipleIcons
          size={22}
          icons={offerAssetDetails.assets.map((assetId: string) => {
            const meta = assets.getAsset(assetId)
            const isBond = assets.isBond(meta)
            const id = isBond ? meta.assetId : assetId
            return {
              icon: <Icon size={22} icon={<AssetLogo key={id} id={id} />} />,
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
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {props.offering.symbol}
      </Text>

      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white" sx={{ mx: 4 }}>
        /
      </Text>

      {assets.isStableSwap(acceptAssetDetails) ||
      assets.isShareToken(acceptAssetDetails) ? (
        <MultipleIcons
          size={22}
          icons={acceptAssetDetails.assets.map((assetId: string) => {
            const meta = assets.getAsset(assetId)
            const isBond = assets.isBond(meta)
            const id = isBond ? meta.assetId : assetId
            return {
              icon: <Icon size={22} icon={<AssetLogo key={id} id={id} />} />,
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
      <Text fs={[14, 16]} lh={[16, 16]} fw={500} color="white">
        {props.accepting.symbol}
      </Text>
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
    <div sx={{ flex: "row", align: "center", gap: 8 }}>
      {assets.isStableSwap(assetDetails) ||
      assets.isShareToken(assetDetails) ? (
        <MultipleIcons
          size={22}
          icons={assetDetails.assets.map((assetId: string) => {
            const meta = assets.getAsset(assetId)
            const isBond = assets.isBond(meta)
            const id = isBond ? meta.assetId : assetId
            return {
              icon: <Icon size={22} icon={<AssetLogo key={id} id={id} />} />,
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
          gap: 8,
        }}
      >
        <Text fs={[14, 13]} lh={13} fw={500} color="white">
          {t("value.token", { value: props.pair.amount })} {props.pair.symbol}
        </Text>
        {isBond && (
          <Text fs={13} lh={13} fw={500} color="white">
            {assetDetails.name.replace("HDX Bond ", "").slice(3)}
          </Text>
        )}
      </div>
    </div>
  )
}

export const OrderPriceColumn = (props: { pair: OfferingPair; price: BN }) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isDesktop ? "center" : "flex-end",
        alignItems: "center",
        height: "100%",
        width: "100%",
        gap: 3,
      }}
    >
      {props?.price?.isNaN() ? (
        <Text fs={12} fw={400} color="basic400" tAlign={"center"} as="div">
          N / A
        </Text>
      ) : (
        <>
          <Text fs={[14, 13]} lh={13} fw={500} color="white">
            <DisplayValue value={props.price} compact />
          </Text>
          <Text fs={[14, 13]} lh={13} fw={500} color="whiteish500">
            (
            {t("otc.offers.table.header.perToken", {
              symbol: props.pair.symbol,
            })}
            )
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
  const color =
    props.percentage > 0
      ? "green600"
      : props.percentage < 0
      ? "red400"
      : "whiteish500"

  const formatPercentage = (percent: number) => {
    if (percent) {
      if (percent > 9000) {
        return "> +9000%"
      }

      return percent > 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`
    }
  }

  return (
    <div
      sx={{
        flex: "column",
        justify: "center",
        align: ["flex-end", "flex-end", "center"],
        width: "100%",
      }}
      css={{ position: "relative" }}
    >
      {props.percentage ? (
        <Text fs={[14, 13]} lh={13} fw={500} color={color as any}>
          {formatPercentage(props.percentage)}
        </Text>
      ) : (
        <Text fs={12} fw={400} color="basic400" tAlign={"center"} as="div">
          N / A
        </Text>
      )}
    </div>
  )
}
