import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { ArrowNarrowRightIcon } from "@heroicons/react/solid"
import { Box, Skeleton, SvgIcon, Typography } from "@mui/material"
import { parseUnits } from "ethers/lib/utils"
import React, { ReactNode } from "react"
import {
  IsolatedDisabledBadge,
  IsolatedEnabledBadge,
  UnavailableDueToIsolationBadge,
} from "sections/lending/components/isolationMode/IsolatedBadge"
import { Row } from "sections/lending/components/primitives/Row"
import { CollateralType } from "sections/lending/helpers/types"

import { Switch } from "components/Switch/Switch"
import { Text } from "components/Typography/Text/Text"
import { HealthFactorNumber } from "sections/lending/components/HealthFactorNumber"
import { IncentivesButton } from "sections/lending/components/incentives/IncentivesButton"
import {
  FormattedNumber,
  FormattedNumberProps,
} from "sections/lending/components/primitives/FormattedNumber"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { GasStation } from "sections/lending/components/transactions/GasStation/GasStation"

export interface TxModalDetailsProps {
  gasLimit?: string
  slippageSelector?: ReactNode
  skipLoad?: boolean
  disabled?: boolean
  chainId?: number
  children?: ReactNode
}

const ArrowRightIcon = (
  <SvgIcon color="primary" sx={{ fontSize: "14px", mx: 4 }}>
    <ArrowNarrowRightIcon />
  </SvgIcon>
)

export const TxModalDetails: React.FC<TxModalDetailsProps> = ({
  gasLimit,
  slippageSelector,
  skipLoad,
  disabled,
  children,
  chainId,
}) => {
  return (
    <div sx={{ pt: 30 }}>
      <Text font="FontOver" color="pink500" fs={15} sx={{ mb: 16 }}>
        <span>Transaction overview</span>
      </Text>
      <div
        css={{
          "& > div": {
            borderTop: "1px solid rgba(51, 55, 80, 0.3)",
            paddingTop: 10,
          },
          "& > div:first-of-type": { border: 0, paddingTop: 0 },
        }}
      >
        {children}
      </div>
      <div
        sx={{
          flex: "row",
          justify: "space-between",
        }}
      >
        <GasStation
          chainId={chainId}
          gasLimit={parseUnits(gasLimit || "0", "wei")}
          skipLoad={skipLoad}
          disabled={disabled}
          rightComponent={slippageSelector}
        />
      </div>
    </div>
  )
}

interface DetailsNumberLineProps extends FormattedNumberProps {
  description: ReactNode
  value: FormattedNumberProps["value"]
  futureValue?: FormattedNumberProps["value"]
  numberPrefix?: ReactNode
  iconSymbol?: string
  loading?: boolean
}

export const DetailsNumberLine = ({
  description,
  value,
  futureValue,
  numberPrefix,
  iconSymbol,
  loading = false,
  ...rest
}: DetailsNumberLineProps) => {
  return (
    <Row caption={description}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            height={20}
            width={100}
            sx={{ borderRadius: "4px" }}
          />
        ) : (
          <>
            {iconSymbol && (
              <TokenIcon symbol={iconSymbol} sx={{ mr: 4, fontSize: "16px" }} />
            )}
            {numberPrefix && (
              <Typography sx={{ mr: 4 }}>{numberPrefix}</Typography>
            )}
            <FormattedNumber value={value} variant="secondary14" {...rest} />
            {futureValue && (
              <>
                {ArrowRightIcon}
                <FormattedNumber
                  value={futureValue}
                  variant="secondary14"
                  {...rest}
                />
              </>
            )}
          </>
        )}
      </Box>
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
  color?: string
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
  color,
  tokenIcon,
  loading = false,
}: DetailsNumberLineWithSubProps) => {
  return (
    <Row caption={description}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}
      >
        {loading ? (
          <>
            <Skeleton
              variant="rectangular"
              height={20}
              width={100}
              sx={{ borderRadius: "4px" }}
            />
            <Skeleton
              variant="rectangular"
              height={15}
              width={80}
              sx={{ borderRadius: "4px", marginTop: "4px" }}
            />
          </>
        ) : (
          <>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {value && (
                <>
                  <FormattedNumber
                    value={value}
                    variant="secondary14"
                    color={color}
                  />
                  {!hideSymbolSuffix && (
                    <Typography ml={1} variant="secondary14">
                      {symbol}
                    </Typography>
                  )}
                  {ArrowRightIcon}
                </>
              )}
              {tokenIcon && (
                <TokenIcon
                  symbol={tokenIcon}
                  sx={{ mr: 4, fontSize: "14px" }}
                />
              )}
              <FormattedNumber
                value={futureValue}
                variant="secondary14"
                color={color}
              />
              {!hideSymbolSuffix && (
                <Typography ml={1} variant="secondary14">
                  {symbol}
                </Typography>
              )}
            </Box>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {valueUSD && (
                <>
                  <FormattedNumber
                    value={valueUSD}
                    variant="helperText"
                    compact
                    symbol="USD"
                  />
                  {ArrowRightIcon}
                </>
              )}
              <FormattedNumber
                value={futureValueUSD}
                variant="helperText"
                compact
                symbol="USD"
              />
            </Box>
          </>
        )}
      </Box>
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
    <Row caption={<span>Collateralization</span>}>
      <CollateralState collateralType={collateralType} />
    </Row>
  )
}

interface CollateralStateProps {
  collateralType: CollateralType
}

export const CollateralState = ({ collateralType }: CollateralStateProps) => {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center" }}>
      {
        {
          [CollateralType.ENABLED]: (
            <Text fs={14} color="green400">
              <span>Enabled</span>
            </Text>
          ),
          [CollateralType.ISOLATED_ENABLED]: <IsolatedEnabledBadge />,
          [CollateralType.DISABLED]: (
            <Text color="red400">
              <span>Disabled</span>
            </Text>
          ),
          [CollateralType.UNAVAILABLE]: (
            <Text color="red400">
              <span>Unavailable</span>
            </Text>
          ),
          [CollateralType.ISOLATED_DISABLED]: <IsolatedDisabledBadge />,
          [CollateralType.UNAVAILABLE_DUE_TO_ISOLATION]: (
            <UnavailableDueToIsolationBadge />
          ),
        }[collateralType]
      }
    </Box>
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
    <Row caption={<span>Rewards APR</span>}>
      <Box sx={{ display: "flex", alignItems: "center" }}>
        {loading ? (
          <Skeleton
            variant="rectangular"
            height={20}
            width={100}
            sx={{ borderRadius: "4px" }}
          />
        ) : (
          <>
            <IncentivesButton incentives={incentives} symbol={symbol} />
            {futureSymbol && (
              <>
                {ArrowRightIcon}
                <IncentivesButton
                  incentives={futureIncentives}
                  symbol={futureSymbol}
                />
                {futureIncentives && futureIncentives.length === 0 && (
                  <Typography variant="secondary14">
                    <span>None</span>
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </Box>
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
    <Row caption={<span>Health factor</span>}>
      <Box sx={{ textAlign: "right" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={20}
              width={80}
              sx={{ borderRadius: "4px" }}
            />
          ) : (
            <>
              <HealthFactorNumber value={healthFactor} />

              {visibleHfChange && (
                <>
                  {ArrowRightIcon}

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
        </Box>

        <Typography variant="helperText" color="text.secondary">
          <span>Liquidation at</span>
          {" <1.0"}
        </Typography>
      </Box>
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
