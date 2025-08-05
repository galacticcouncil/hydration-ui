import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import i18n from "i18next"
import {
  BN_0,
  BN_NAN,
  DOT_ASSET_ID,
  ETH_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  GETH_STABLESWAP_ASSET_ID,
  USDT_POOL_ASSET_ID,
  VDOT_ASSET_ID,
  WSTETH_ASSET_ID,
} from "utils/constants"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { SContainer, SIncentiveRow } from "./GigaIncentives.styled"
import { ReactNode } from "react"
import { BorrowAssetApyData, useBorrowAssetApy } from "api/borrow"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { ResponsiveValue } from "utils/responsive"
import { theme } from "theme"
import { getAssetIdFromAddress } from "utils/evm"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { TStablepool } from "sections/pools/PoolsPage.utils"

export const GigaIncentives = ({
  pool: { moneyMarketApy },
}: {
  pool: TStablepool
}) => {
  const { t } = useTranslation()

  if (!moneyMarketApy) return null

  const totalApr = moneyMarketApy.incentives.reduce(
    (acc, incentive) => acc.plus(incentive.incentiveAPR),
    BN_0,
  )

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
      <SContainer
        sx={{ flex: "row", gap: 6, justify: "space-between", align: "center" }}
      >
        <MultipleIcons
          size={20}
          icons={moneyMarketApy.incentives.map((incentive) => {
            const id = getAssetIdFromAddress(incentive.rewardTokenAddress)
            return {
              icon: <AssetLogo key={id} id={id} />,
            }
          })}
        />

        <Text
          fs={14}
          fw={600}
          font="GeistSemiBold"
          color="basic100"
          sx={{ mr: "auto" }}
        >
          {moneyMarketApy.incentives
            .map(({ rewardTokenSymbol }) => rewardTokenSymbol)
            .join(", ")}
        </Text>

        <Text color="white" fs={14}>
          <FormattedNumber percent value={totalApr.toString()} />
        </Text>
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
  readonly omnipoolFee?: string
}

export const MoneyMarketAPYWrapper = (props: APYProps) => {
  const moneyMarketApy = useBorrowAssetApy(props.assetId, props.withFarms)

  return <MoneyMarketAPY moneyMarketApy={moneyMarketApy} {...props} />
}

export const MoneyMarketAPY = ({
  withLabel,
  type,
  color,
  assetId,
  size,
  withFarms,
  omnipoolFee,
  moneyMarketApy,
}: APYProps & { moneyMarketApy: BorrowAssetApyData }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const {
    totalSupplyApy,
    totalBorrowApy,
    lpAPY,
    underlyingAssetsAPY,
    incentives,
    farms,
    vDotApy,
  } = moneyMarketApy

  const isSupply = type === "supply"
  const apy = BN(isSupply ? totalSupplyApy : totalBorrowApy)
    .plus(omnipoolFee ?? 0)
    .toNumber()

  const hasFarms = farms && farms.length > 0
  const defaultColor = withFarms && hasFarms ? "brightBlue200" : "white"
  const isVDOT = assetId === VDOT_ASSET_ID

  return (
    <div sx={{ flex: "row", gap: 4, align: "center" }}>
      {hasFarms && (
        <MultipleIcons
          size={size ?? 14}
          icons={farms.map((farm) => ({
            icon: <AssetLogo id={farm.rewardCurrency} />,
          }))}
        />
      )}
      <Text
        color={color ?? defaultColor}
        fs={size ?? 14}
        tTransform={withLabel ? "uppercase" : "none"}
      >
        {t(
          withLabel
            ? "liquidity.stablepool.incetives.value"
            : "value.percentage",
          { value: apy === Infinity ? BN_NAN : apy },
        )}
      </Text>
      <InfoTooltip
        preventDefault
        text={
          <>
            <Text fs={12}>{t("lending.tooltip.estimatedRewards")}</Text>
            {omnipoolFee && (
              <div
                sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
              >
                <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                  {t("liquidity.table.farms.apr.lpFeeOmnipool")}
                </Text>
                <Text fs={12} font="GeistSemiBold">
                  {t("value.percentage", { value: BN(omnipoolFee) })}
                </Text>
              </div>
            )}
            {BN(apy).gt(0) && BN(lpAPY).gt(0) && (
              <div
                sx={{ flex: "row", gap: 4, justify: "space-between", mt: 6 }}
              >
                <Text fs={10} tTransform="uppercase" sx={{ opacity: 0.8 }}>
                  {t(
                    `liquidity.table.farms.apr.${omnipoolFee ? "lpFeeStablepool" : "lpFee"}`,
                  )}
                </Text>
                <Text fs={12} font="GeistSemiBold">
                  {t("value.percentage", { value: BN(lpAPY) })}
                </Text>
              </div>
            )}
            {isVDOT && (
              <APYRow
                id={VDOT_ASSET_ID}
                label={t("stakeApy")}
                value={vDotApy}
              />
            )}
            {underlyingAssetsAPY.map(({ id, borrowApy, supplyApy }) => {
              return (
                <SIncentiveRow key={id}>
                  <div sx={{ flex: "row", gap: 4, align: "center" }}>
                    <Icon size={14} icon={<AssetLogo id={id} />} />
                    <Text fs={12}>{getAssetWithFallback(id).symbol}</Text>
                    <Text fs={11} lh={15} color="basic400">
                      {isVDOT
                        ? isSupply
                          ? t("supplyApy")
                          : t("borrowApy")
                        : labels[id] ?? t("supplyApy")}
                    </Text>
                  </div>
                  <Text fs={12} font="GeistSemiBold">
                    {t("value.percentage", {
                      value: BN(isSupply ? supplyApy : borrowApy).minus(
                        id === VDOT_ASSET_ID && isVDOT ? vDotApy ?? 0 : 0,
                      ),
                    })}
                  </Text>
                </SIncentiveRow>
              )
            })}
            {incentives
              .filter(({ incentiveAPR }) => BN(incentiveAPR).gt(0))
              .map(({ rewardTokenAddress, incentiveAPR }) => {
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

const labels: ApySummary = {
  [DOT_ASSET_ID]: i18n.t("supplyApy"),
  [VDOT_ASSET_ID]: i18n.t("stakeApy"),
  [ETH_ASSET_ID]: i18n.t("supplyApy"),
  [WSTETH_ASSET_ID]: i18n.t("stakeApy"),
}

type OverrideApyProps = APYProps & {
  readonly children: ReactNode
  readonly assetId: string
  readonly withFarms?: boolean
}

export const OverrideApy = ({ children, ...props }: OverrideApyProps) => {
  switch (props.assetId) {
    case GDOT_STABLESWAP_ASSET_ID:
    case GETH_STABLESWAP_ASSET_ID:
    case USDT_POOL_ASSET_ID:
      return props.type === "supply" ? (
        <MoneyMarketAPYWrapper {...props} />
      ) : (
        children
      )
    case VDOT_ASSET_ID:
      return <MoneyMarketAPYWrapper {...props} />
    default:
      return children
  }
}
