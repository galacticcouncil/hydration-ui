import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import BN from "bignumber.js"
import { BN_0, VDOT_ASSET_ID } from "utils/constants"
import { Icon } from "components/Icon/Icon"
import { Heading } from "components/Typography/Heading/Heading"
import { SContainer, SIncentiveRow } from "./GigaIncentives.styled"
import { ReactNode } from "react"
import { BorrowAssetApyData, useBorrowAssetsApy } from "api/borrow"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { ResponsiveValue } from "utils/responsive"
import { theme } from "theme"
import { getAddressFromAssetId, getAssetIdFromAddress } from "utils/evm"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"

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

const IncentiveRow = ({
  id,
  value,
  label,
}: {
  id: string
  value: string | number
  label: string
}) => {
  const { getAssetWithFallback } = useAssets()

  return (
    <SIncentiveRow>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <Icon size={14} icon={<AssetLogo id={id} />} />
        <Text fs={12}>{getAssetWithFallback(id).symbol}</Text>
        <Text fs={11} lh={15} color="basic400">
          {label}
        </Text>
      </div>
      <Text fs={12} font="GeistSemiBold">
        {value}
      </Text>
    </SIncentiveRow>
  )
}

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
  const { data } = useBorrowAssetsApy([props.assetId], props.withFarms)
  return data[0] && <MoneyMarketAPY moneyMarketApy={data[0]} {...props} />
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
    underlyingAssetsApyData,
    incentives,
    farms,
  } = moneyMarketApy

  const isSupply = type === "supply"
  const apy = BN(isSupply ? totalSupplyApy : totalBorrowApy)
    .plus(omnipoolFee ?? 0)
    .toNumber()

  const hasFarms = farms && farms.length > 0
  const defaultColor = withFarms && hasFarms ? "brightBlue200" : "white"

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
          { value: apy },
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

            {underlyingAssetsApyData.map(
              ({ id, isStaked, borrowApy, supplyApy }) => {
                const label = isStaked
                  ? t("stakeApy")
                  : isSupply
                    ? t("supplyApy")
                    : t("borrowApy")
                return (
                  <IncentiveRow
                    key={id}
                    id={id}
                    label={label}
                    value={t("value.percentage", {
                      value: BN(isSupply ? supplyApy : borrowApy),
                    })}
                  />
                )
              },
            )}
            {incentives.map(({ rewardTokenAddress, incentiveAPR }) => {
              const id = getAssetIdFromAddress(rewardTokenAddress)
              return (
                <IncentiveRow
                  key={id}
                  id={id}
                  label={t("incentivesApr")}
                  value={t("value.percentage", {
                    value: BN(incentiveAPR).times(100),
                  })}
                />
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
                    <IncentiveRow
                      key={rewardCurrency}
                      id={rewardCurrency}
                      label={getAssetWithFallback(rewardCurrency).symbol}
                      value={t("value.percentage", { value: apr })}
                    />
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

type OverrideApyProps = APYProps & {
  readonly children: ReactNode
  readonly assetId: string
  readonly withFarms?: boolean
}

export const OverrideApy = ({ children, ...props }: OverrideApyProps) => {
  switch (true) {
    case MONEY_MARKET_GIGA_RESERVES.includes(
      getAddressFromAssetId(props.assetId),
    ):
      return props.type === "supply" ? (
        <MoneyMarketAPYWrapper {...props} />
      ) : (
        children
      )
    case props.assetId === VDOT_ASSET_ID:
      return <MoneyMarketAPYWrapper {...props} />
    default:
      return children
  }
}
