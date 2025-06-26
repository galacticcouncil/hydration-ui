import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import i18n from "i18next"
import {
  DOT_ASSET_ID,
  ETH_ASSET_ID,
  GDOT_ERC20_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  VDOT_ASSET_ID,
  WSTETH_ASSET_ID,
} from "utils/constants"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { SContainer, SIncentiveRow } from "./GigaIncentives.styled"
import { ReactNode } from "react"
import { useBorrowAssetApy } from "api/borrow"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { ResponsiveValue } from "utils/responsive"
import { theme } from "theme"
import { getAssetIdFromAddress } from "utils/evm"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"

export const GigaIncentives = ({ id }: { id: string }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  return (
    <>
      <Heading
        color="white"
        fs={15}
        sx={{ mb: 5 }}
        font="GeistMono"
        tTransform="uppercase"
      >
        {t("liquidity.stablepool.incetives")}
      </Heading>
      <SContainer sx={{ flex: "row", gap: 6, justify: "space-between" }}>
        <div sx={{ flex: "row", align: "center", gap: 6 }}>
          <Icon size={20} icon={<AssetLogo id={GDOT_ERC20_ASSET_ID} />} />
          <Text fs={16} fw={600} font="GeistSemiBold" color="basic100">
            {getAssetWithFallback(GDOT_ERC20_ASSET_ID).symbol}
          </Text>
        </div>
        <GigaAPY withLabel type="supply" assetId={id} />
      </SContainer>
    </>
  )
}

const APYRow = ({
  id,
  value,
  label,
}: {
  id: string
  value?: string | number
  label: string
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  return (
    <div
      key={id}
      sx={{
        flex: "row",
        gap: 4,
        justify: "space-between",
        mt: 6,
      }}
    >
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <Icon size={14} icon={<AssetLogo id={id} />} />
        <Text fs={12}>{getAssetWithFallback(id).symbol}</Text>
        <Text fs={11} lh={15} color="basic400">
          {label}
        </Text>
      </div>
      <Text fs={12} font="GeistSemiBold">
        {t("value.percentage", {
          value,
        })}
      </Text>
    </div>
  )
}

type ApySummary = Record<string, string>

type ApyType = "supply" | "borrow"

type APYProps = {
  readonly type: ApyType
  readonly withLabel?: boolean
  readonly size?: ResponsiveValue<number>
  readonly color?: ResponsiveValue<keyof typeof theme.colors>
  readonly assetId: string
  readonly withFarms?: boolean
}

export const GigaAPY = ({
  withLabel,
  type,
  color,
  assetId,
  size,
  withFarms,
}: APYProps) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const {
    totalSupplyApy,
    totalBorrowApy,
    lpAPY,
    underlyingAssetsAPY,
    incentives,
    farms,
  } = useBorrowAssetApy(assetId, withFarms)

  const isSupply = type === "supply"
  const apy = isSupply ? totalSupplyApy : totalBorrowApy

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <Text
        color={color ?? "white"}
        fs={size ?? 14}
        tTransform={withLabel ? "uppercase" : "none"}
      >
        {t(
          withLabel
            ? "liquidity.stablepool.incetives.value"
            : "value.percentage",
          { value: apy },
        )}
      </Text>
      <InfoTooltip
        preventDefault
        text={
          <>
            <Text fs={12}>{t("lending.tooltip.estimatedRewards")}</Text>
            {BN(apy).gt(0) && (
              <div
                sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
              >
                <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                  {t("liquidity.table.farms.apr.lpFee")}
                </Text>
                <Text fs={12} font="GeistSemiBold">
                  <FormattedNumber percent value={lpAPY / 100} />
                </Text>
              </div>
            )}
            {underlyingAssetsAPY.map(({ id, borrowApy, supplyApy }) => {
              return (
                <SIncentiveRow key={id}>
                  <div sx={{ flex: "row", gap: 4, align: "center" }}>
                    <Icon size={14} icon={<AssetLogo id={id} />} />
                    <Text fs={12}>{getAssetWithFallback(id).symbol}</Text>
                    <Text fs={11} lh={15} color="basic400">
                      {gDotSummary[id]}
                    </Text>
                  </div>
                  <Text fs={12} font="GeistSemiBold">
                    <FormattedNumber
                      percent
                      value={(isSupply ? supplyApy : borrowApy) / 100}
                    />
                  </Text>
                </SIncentiveRow>
              )
            })}
            {incentives.map(({ rewardTokenAddress, incentiveAPR }) => {
              const id = getAssetIdFromAddress(rewardTokenAddress)
              return (
                <SIncentiveRow key={id}>
                  <div sx={{ flex: "row", gap: 4, align: "center" }}>
                    <Icon size={14} icon={<AssetLogo id={id} />} />
                    <Text fs={12}>{getAssetWithFallback(id).symbol}</Text>
                    <Text fs={11} lh={15} color="basic400">
                      {t("incentivesApr")}
                    </Text>
                  </div>
                  <Text fs={12} font="GeistSemiBold">
                    <FormattedNumber percent value={incentiveAPR} />
                  </Text>
                </SIncentiveRow>
              )
            })}
            {farms && (
              <>
                <div
                  sx={{
                    flex: "row",
                    gap: 4,
                    justify: "space-between",
                    mt: 6,
                    opacity: 0.8,
                  }}
                >
                  <Text fs={10} tTransform="uppercase">
                    {t("liquidity.table.farms.apr.rewards")}
                  </Text>
                  <Text fs={10} tTransform="uppercase">
                    {t("liquidity.table.farms.apr")}
                  </Text>
                </div>
                {farms.map(({ apr, rewardCurrency }) => {
                  return (
                    <SIncentiveRow key={rewardCurrency}>
                      <div sx={{ flex: "row", gap: 4, align: "center" }}>
                        <Icon
                          size={14}
                          icon={<AssetLogo id={rewardCurrency} />}
                        />
                        <Text fs={12}>
                          {getAssetWithFallback(rewardCurrency).symbol}
                        </Text>
                      </div>
                      <Text fs={12} font="GeistSemiBold">
                        {t("value.percentage", { value: apr })}
                      </Text>
                    </SIncentiveRow>
                  )
                })}
              </>
            )}
          </>
        }
      />
    </div>
  )
}

const gDotSummary: ApySummary = {
  [DOT_ASSET_ID]: i18n.t("supplyApy"),
  [VDOT_ASSET_ID]: i18n.t("stakeApy"),
  [ETH_ASSET_ID]: i18n.t("supplyApy"),
  [WSTETH_ASSET_ID]: i18n.t("stakeApy"),
}

export const VDOTAPY = ({ withLabel, type, size, color }: APYProps) => {
  const { t } = useTranslation()
  const { totalSupplyApy, totalBorrowApy, underlyingAssetsAPY, vDotApy } =
    useBorrowAssetApy(VDOT_ASSET_ID)

  const isSupply = type === "supply"
  const apy = isSupply ? totalSupplyApy : totalBorrowApy

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      <Text
        color={color ?? "white"}
        fs={size ?? 14}
        tTransform={withLabel ? "uppercase" : "none"}
      >
        {t(
          withLabel
            ? "liquidity.stablepool.incetives.value"
            : "value.percentage",
          { value: apy },
        )}
      </Text>
      <InfoTooltip
        preventDefault
        text={
          <>
            <Text fs={12}>{t("lending.tooltip.estimatedRewards")}</Text>
            <APYRow id={VDOT_ASSET_ID} label={t("stakeApy")} value={vDotApy} />
            {underlyingAssetsAPY.map(({ id, borrowApy, supplyApy }) => (
              <APYRow
                key={id}
                id={id}
                label={isSupply ? t("supplyApy") : t("borrowApy")}
                value={BN(isSupply ? supplyApy : borrowApy)
                  .minus(id === VDOT_ASSET_ID ? vDotApy ?? 0 : 0)
                  .toString()}
              />
            ))}
          </>
        }
      />
    </div>
  )
}

type OverrideApyProps = APYProps & {
  readonly children: ReactNode
  readonly assetId: string
  readonly withFarms?: boolean
}

export const OverrideApy = ({ children, ...props }: OverrideApyProps) => {
  switch (props.assetId) {
    case GDOT_STABLESWAP_ASSET_ID:
      return props.type === "supply" ? <GigaAPY {...props} /> : children
    case GETH_STABLESWAP_ASSET_ID:
      return props.type === "supply" ? <GigaAPY {...props} /> : children
    case VDOT_ASSET_ID:
      return <VDOTAPY {...props} />
    default:
      return children
  }
}
