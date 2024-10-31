import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { PercentageValue } from "components/PercentageValue"
import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import React, { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { HealthFactorNumber } from "sections/lending/components/HealthFactorNumber"
import { IncentivesButton } from "sections/lending/components/incentives/IncentivesButton"
import {
  FormattedNumber,
  FormattedNumberProps,
} from "sections/lending/components/primitives/FormattedNumber"
import { Row } from "sections/lending/components/primitives/Row"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { CollateralType } from "sections/lending/helpers/types"
import {
  IsolatedDisabledBadge,
  IsolatedEnabledBadge,
  UnavailableDueToIsolationBadge,
} from "sections/lending/ui/isolation-mode/IsolationBadge"
import { theme } from "theme"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"

export interface TxModalDetailsProps {
  children?: ReactNode
}

export const TxModalDetails: React.FC<TxModalDetailsProps> = ({ children }) => {
  return (
    <div>
      <Text font="Geist" color="pink500" fs={15} sx={{ mb: 16 }}>
        <span>Transaction overview</span>
      </Text>
      <div
        css={{
          "& > div": {
            borderTop: `1px solid ${theme.colors.darkBlue401}`,
            paddingTop: 10,
          },
          "& > div:first-of-type": { border: 0, paddingTop: 0 },
        }}
      >
        {children}
      </div>
    </div>
  )
}

type DetailsNumberLineProps = {
  description: ReactNode
  value: FormattedNumberProps["value"]
  futureValue?: FormattedNumberProps["value"]
  numberPrefix?: ReactNode
  symbol?: string
  iconSymbol?: string
  loading?: boolean
  percent?: boolean
}

export const DetailsNumberLine = ({
  description,
  value,
  futureValue,
  numberPrefix,
  symbol,
  iconSymbol,
  loading = false,
  percent,
}: DetailsNumberLineProps) => {
  const { t } = useTranslation()

  const num = Number(value)
  const futureNum = Number(futureValue)
  return (
    <Row captionColor="basic400" caption={description}>
      <div sx={{ flex: "row", align: "center" }}>
        {loading ? (
          <Skeleton height={20} width={100} />
        ) : (
          <>
            {iconSymbol && (
              <TokenIcon symbol={iconSymbol} sx={{ mr: 6 }} size={16} />
            )}
            {numberPrefix && (
              <Text fs={14} sx={{ mr: 6 }}>
                {numberPrefix}
              </Text>
            )}
            {percent ? (
              <PercentageValue value={num * 100} />
            ) : symbol ? (
              t("value.displaySymbol", { value: num, symbol })
            ) : (
              t("value.displaySymbol", { value: num })
            )}

            {futureValue && (
              <>
                <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />
                {percent ? (
                  <PercentageValue value={futureNum * 100} />
                ) : symbol ? (
                  t("value.displaySymbol", { value: futureNum, symbol })
                ) : (
                  t("value.displaySymbol", { value: futureNum })
                )}
              </>
            )}
          </>
        )}
      </div>
    </Row>
  )
}

interface DetailsNumberLineWithSubProps {
  description: ReactNode
  symbol: ReactNode
  value?: string
  valueUSD?: string
  futureValue: string
  futureValueUSD: string
  hideSymbolSuffix?: boolean
  tokenIcon?: string
  loading?: boolean
}

export const DetailsNumberLineWithSub = ({
  description,
  symbol,
  value,
  valueUSD,
  futureValue,
  futureValueUSD,
  hideSymbolSuffix,
  tokenIcon,
  loading = false,
}: DetailsNumberLineWithSubProps) => {
  return (
    <Row captionColor="basic400" caption={description}>
      <div sx={{ flex: "column", align: "flex-end" }}>
        {loading ? (
          <>
            <Skeleton height={20} width={100} />
            <Skeleton height={15} width={80} sx={{ mt: 12 }} />
          </>
        ) : (
          <>
            <div sx={{ flex: "row", align: "center" }}>
              {value && (
                <>
                  <FormattedNumber value={value} />
                  {!hideSymbolSuffix && <Text sx={{ mt: 4 }}>{symbol}</Text>}
                  <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />
                </>
              )}
              {tokenIcon && (
                <TokenIcon symbol={tokenIcon} sx={{ mr: 4 }} size={14} />
              )}
              <FormattedNumber value={futureValue} />
              {!hideSymbolSuffix && <Text sx={{ mt: 4 }}>{symbol}</Text>}
            </div>
            <div sx={{ flex: "row", align: "center" }}>
              {valueUSD && (
                <>
                  <FormattedNumber value={valueUSD} compact symbol="USD" />
                  <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />
                </>
              )}
              <FormattedNumber value={futureValueUSD} compact symbol="USD" />
            </div>
          </>
        )}
      </div>
    </Row>
  )
}

export interface DetailsCollateralLineProps {
  collateralType: CollateralType
}

export const DetailsCollateralLine = ({
  collateralType,
}: DetailsCollateralLineProps) => {
  return (
    <Row captionColor="basic400" caption="Collateralization">
      <CollateralState collateralType={collateralType} />
    </Row>
  )
}

interface CollateralStateProps {
  collateralType: CollateralType
}

export const CollateralState = ({ collateralType }: CollateralStateProps) => {
  return (
    <div css={{ display: "inline-flex", alignItems: "center" }}>
      {
        {
          [CollateralType.ENABLED]: (
            <Text fs={14} color="green400">
              <span>Enabled</span>
            </Text>
          ),
          [CollateralType.ISOLATED_ENABLED]: <IsolatedEnabledBadge />,
          [CollateralType.DISABLED]: (
            <Text fs={14} color="red400">
              <span>Disabled</span>
            </Text>
          ),
          [CollateralType.UNAVAILABLE]: (
            <Text fs={14} color="red400">
              <span>Unavailable</span>
            </Text>
          ),
          [CollateralType.ISOLATED_DISABLED]: <IsolatedDisabledBadge />,
          [CollateralType.UNAVAILABLE_DUE_TO_ISOLATION]: (
            <UnavailableDueToIsolationBadge />
          ),
        }[collateralType]
      }
    </div>
  )
}

interface DetailsIncentivesLineProps {
  futureIncentives?: ReserveIncentiveResponse[]
  futureSymbol?: string
  incentives?: ReserveIncentiveResponse[]
  // the token yielding the incentive, not the incentive itself
  symbol: string
  loading?: boolean
}

export const DetailsIncentivesLine = ({
  incentives,
  symbol,
  futureIncentives,
  futureSymbol,
  loading = false,
}: DetailsIncentivesLineProps) => {
  if (
    !incentives ||
    incentives.filter((i) => i.incentiveAPR !== "0").length === 0
  )
    return null
  return (
    <Row captionColor="basic400" caption={<span>Rewards APR</span>}>
      <div sx={{ flex: "row", align: "center" }}>
        {loading ? (
          <Skeleton height={20} width={100} />
        ) : (
          <>
            <IncentivesButton incentives={incentives} symbol={symbol} />
            {futureSymbol && (
              <>
                <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />
                <IncentivesButton
                  incentives={futureIncentives}
                  symbol={futureSymbol}
                />
                {futureIncentives && futureIncentives.length === 0 && (
                  <Text>
                    <span>None</span>
                  </Text>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Row>
  )
}

export interface DetailsHFLineProps {
  healthFactor: string
  futureHealthFactor: string
  visibleHfChange: boolean
  loading?: boolean
}

export const DetailsHFLine = ({
  healthFactor,
  futureHealthFactor,
  visibleHfChange,
  loading = false,
}: DetailsHFLineProps) => {
  if (healthFactor === "-1" && futureHealthFactor === "-1") return null
  return (
    <Row captionColor="basic400" caption={<span>Health factor</span>}>
      <div css={{ textAlign: "right" }}>
        <div sx={{ flex: "row", align: "center", justify: "flex-end" }}>
          {loading ? (
            <Skeleton height={20} width={80} />
          ) : (
            <>
              <HealthFactorNumber value={healthFactor} />

              {visibleHfChange && (
                <>
                  <ArrowRightIcon width={16} height={16} sx={{ mx: 8 }} />

                  <HealthFactorNumber
                    value={
                      isNaN(Number(futureHealthFactor))
                        ? healthFactor
                        : futureHealthFactor
                    }
                  />
                </>
              )}
            </>
          )}
        </div>

        <Text fs={12} color="basic400">
          <span>Liquidation at</span>
          {" <1.0"}
        </Text>
      </div>
    </Row>
  )
}

export interface DetailsUnwrapSwitchProps {
  unwrapped: boolean
  setUnWrapped: (value: boolean) => void
  label: string
}

export const DetailsUnwrapSwitch = ({
  unwrapped,
  setUnWrapped,
  label,
}: DetailsUnwrapSwitchProps) => {
  return (
    <Row sx={{ mt: 10 }}>
      <div sx={{ flex: "row", gap: 10, align: "center" }}>
        <Switch
          name="unwrap-switch"
          label=""
          size="small"
          value={unwrapped}
          onCheckedChange={() => setUnWrapped(!unwrapped)}
        />
        <label htmlFor="unwrap-switch">{label}</label>
      </div>
    </Row>
  )
}
