import { InterestRate } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
} from "@aave/math-utils"
import { CircleInfo } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  BoxProps,
  Button,
  Flex,
  Separator,
  Stack,
  SummaryRow,
  Text,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useState } from "react"

import {
  AssetInput,
  AssetInputProps,
  HealthFactorChange,
  IncentivesButton,
} from "@/components/primitives"
import { HealthFactorRiskWarning } from "@/components/primitives/HealthFactorRiskWarning"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { ParameterChangeWarning } from "@/components/warnings/ParameterChangeWarning"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useAssetCaps } from "@/hooks/useAssetCaps"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "@/ui-config/misc"
import { getMaxAmountAvailableToBorrow } from "@/utils/getMaxAmountAvailableToBorrow"
import { roundToTokenDecimals } from "@/utils/utils"

import { BorrowActions } from "./BorrowActions"

export enum ErrorType {
  MAX_EXCEEDED,
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

interface BorrowModeSwitchProps {
  interestRateMode: InterestRate
  setInterestRateMode: (value: InterestRate) => void
  variableRate: string
  stableRate: string
}

const BorrowModeSwitch: React.FC<BoxProps & BorrowModeSwitchProps> = ({
  setInterestRateMode,
  interestRateMode,
  variableRate,
  stableRate,
  ...props
}) => {
  const { formatPercent } = useAppFormatters()
  return (
    <Box {...props}>
      <Text
        fs={14}
        mb={6}
        sx={{ display: "flex", alignItems: "center", gap: 4 }}
      >
        Borrow APY Rate
        <Tooltip text="Allows you to switch between variable and stable interest rates, where variable rate can increase and decrease depending on the amount of liquidity in the reserve, and stable rate will stay the same for the duration of your loan.">
          <CircleInfo />
        </Tooltip>
      </Text>
      <Flex gap={10}>
        <Button
          width="100%"
          variant={
            interestRateMode === InterestRate.Variable ? "primary" : "tertiary"
          }
          onClick={() => setInterestRateMode(InterestRate.Variable)}
        >
          <Text mr={4} as="span">
            Variable
          </Text>
          {formatPercent(Number(variableRate) * 100)}
        </Button>
        <Button
          width="100%"
          variant={
            interestRateMode === InterestRate.Stable ? "primary" : "tertiary"
          }
          onClick={() => setInterestRateMode(InterestRate.Stable)}
        >
          <Text mr={4} as="span">
            Stable
          </Text>
          {formatPercent(Number(stableRate) * 100)}
        </Button>
      </Flex>
    </Box>
  )
}

export const BorrowModalContent: React.FC<TxModalWrapperRenderProps> = ({
  poolReserve,
  userReserve,
  symbol,
}) => {
  const { user, marketReferencePriceInUsd } = useAppDataContext()
  const { borrowCap } = useAssetCaps()

  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(
    InterestRate.Variable,
  )
  const [amount, setAmount] = useState("")
  const [
    healthFactorRiskCheckboxAccepted,
    setHealthFactorRiskCheckboxAccepted,
  ] = useState(false)

  const maxAmountToBorrow = getMaxAmountAvailableToBorrow(
    poolReserve,
    user,
    interestRateMode,
  )

  // We set this in a useEffect, so it doesn't constantly change when
  // max amount selected
  const handleChange = (_value: string) => {
    if (_value === "-1") {
      setAmount(maxAmountToBorrow)
    } else {
      const decimalTruncatedValue = roundToTokenDecimals(
        _value,
        poolReserve.decimals,
      )
      setAmount(decimalTruncatedValue)
    }
  }

  // health factor calculations
  const amountToBorrowInUsd = bigShift(
    Big(amount || 0)
      .mul(poolReserve.formattedPriceInMarketReferenceCurrency)
      .mul(marketReferencePriceInUsd),
    -USD_DECIMALS,
  )

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: Big(user.totalBorrowsUSD)
      .plus(amountToBorrowInUsd)
      .toString(),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  })

  // calculating input usd value
  const usdValue = Big(amount || 0).mul(poolReserve.priceInUSD)

  // error types handling
  let blockingError: ErrorType | undefined = undefined
  if (!!amount && Big(amount || 0).gt(maxAmountToBorrow)) {
    blockingError = ErrorType.MAX_EXCEEDED
  } else if (
    interestRateMode === InterestRate.Stable &&
    !poolReserve.stableBorrowRateEnabled
  ) {
    blockingError = ErrorType.STABLE_RATE_NOT_ENABLED
  } else if (
    interestRateMode === InterestRate.Stable &&
    userReserve?.usageAsCollateralEnabledOnUser &&
    Big(amount || 0).lt(userReserve?.underlyingBalance || 0)
  ) {
    blockingError = ErrorType.NOT_ENOUGH_BORROWED
  } else if (Big(amount || 0).gt(poolReserve.formattedAvailableLiquidity)) {
    blockingError = ErrorType.NOT_ENOUGH_LIQUIDITY
  } else if (!poolReserve.borrowingEnabled) {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE
  }

  const handleBlocked = (): Partial<AssetInputProps> => {
    switch (blockingError) {
      case ErrorType.MAX_EXCEEDED:
        return { amountError: "Maximum available amount exceeded" }
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return {
          assetError: `Borrowing is currently unavailable for ${poolReserve.symbol}.`,
        }
      case ErrorType.NOT_ENOUGH_BORROWED:
        return {
          assetError:
            "You can borrow this asset with a stable rate only if you borrow more than the amount you are supplying as collateral.",
        }
      case ErrorType.NOT_ENOUGH_LIQUIDITY:
        return {
          amountError:
            "There are not enough funds in the {poolReserve.symbol} reserve to borrow",
        }
      case ErrorType.STABLE_RATE_NOT_ENABLED:
        return {
          assetError: "The Stable Rate is not enabled for this currency",
        }
      default:
        return {}
    }
  }

  const iconSymbol = poolReserve.iconSymbol

  const incentives =
    interestRateMode === InterestRate.Stable
      ? poolReserve.sIncentivesData
      : poolReserve.vIncentivesData

  const shouldRenderIncentives = incentives && incentives.length > 0

  const healthFactor = user ? user.healthFactor : "-1"
  const futureHealthFactor = newHealthFactor.toString()

  const shouldRenderHealthFactor =
    healthFactor !== "-1" && futureHealthFactor !== "-1"

  const displayHealthFactorRiskCheckbox =
    !!amount &&
    !newHealthFactor.eq(-1) &&
    newHealthFactor.lt(HEALTH_FACTOR_RISK_THRESHOLD)

  return (
    <>
      {poolReserve.stableBorrowRateEnabled && (
        <>
          <BorrowModeSwitch
            pb={14}
            interestRateMode={interestRateMode}
            setInterestRateMode={setInterestRateMode}
            variableRate={poolReserve.variableBorrowAPY}
            stableRate={poolReserve.stableBorrowAPY}
          />
          <Separator mx="var(--modal-content-inset)" mb={14} />
        </>
      )}

      <AssetInput
        value={amount}
        onChange={handleChange}
        displayValue={usdValue.toString()}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol,
            iconSymbol,
            address: poolReserve.underlyingAsset,
          },
        ]}
        symbol={symbol}
        maxButtonBalance={maxAmountToBorrow}
        balanceLabel="Available"
        {...handleBlocked()}
      />

      <Separator mx="var(--modal-content-inset)" />

      <Stack
        separated
        separator={<Separator mx="var(--modal-content-inset)" />}
        withTrailingSeparator
      >
        {shouldRenderIncentives && (
          <SummaryRow
            label="Incentives"
            content={
              <IncentivesButton
                incentives={incentives}
                symbol={poolReserve.symbol}
              />
            }
          />
        )}
        {shouldRenderHealthFactor && (
          <SummaryRow
            label="Health Factor"
            content={
              <HealthFactorChange
                healthFactor={healthFactor}
                futureHealthFactor={futureHealthFactor}
              />
            }
          />
        )}
        <Stack gap={14} py={14}>
          <ParameterChangeWarning />
          {borrowCap.determineWarningDisplay({ borrowCap })}
          {displayHealthFactorRiskCheckbox && (
            <HealthFactorRiskWarning
              message="Borrowing this amount will reduce your health factor and increase risk of liquidation."
              accepted={healthFactorRiskCheckboxAccepted}
              onAcceptedChange={setHealthFactorRiskCheckboxAccepted}
              isUserConsentRequired
            />
          )}
        </Stack>
      </Stack>

      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={poolReserve.underlyingAsset}
        interestRateMode={interestRateMode}
        symbol={symbol}
        blocked={
          blockingError !== undefined ||
          (displayHealthFactorRiskCheckbox && !healthFactorRiskCheckboxAccepted)
        }
      />
    </>
  )
}
