import { InterestRate } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"
import { Separator, Stack, SummaryRow } from "@galacticcouncil/ui/components"
import { bigShift } from "@galacticcouncil/utils"
import Big from "big.js"
import { useState } from "react"
import { isArray } from "remeda"

import {
  AssetInput,
  AssetInputProps,
  HealthFactorChange,
  HealthFactorRiskWarning,
} from "@/components/primitives"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { ParameterChangeWarning } from "@/components/warnings/ParameterChangeWarning"
import { useAssetCaps } from "@/hooks"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "@/ui-config/misc"
import { getGhoBorrowApyRange } from "@/utils"
import { getMaxGhoMintAmount } from "@/utils/getMaxAmountAvailableToBorrow"
import { roundToTokenDecimals } from "@/utils/utils"

import { BorrowActions } from "./BorrowActions"

export enum ErrorType {
  STABLE_RATE_NOT_ENABLED,
  NOT_ENOUGH_LIQUIDITY,
  BORROWING_NOT_AVAILABLE,
  NOT_ENOUGH_BORROWED,
}

export const GhoBorrowModalContent: React.FC<TxModalWrapperRenderProps> = ({
  poolReserve,
  symbol,
}) => {
  const { user, marketReferencePriceInUsd, ghoReserveData } =
    useAppDataContext()
  const { formatPercent } = useAppFormatters()
  const { borrowCap } = useAssetCaps()

  const ghoBorrowApyRange = getGhoBorrowApyRange(ghoReserveData)

  const [amount, setAmount] = useState("")
  const [
    healthFactorRiskCheckboxAccepted,
    setHealthFactorRiskCheckboxAccepted,
  ] = useState(false)

  // amount calculations
  let maxAmountToBorrow = getMaxGhoMintAmount(user, poolReserve)
  maxAmountToBorrow = Math.min(
    Number(maxAmountToBorrow),
    ghoReserveData.aaveFacilitatorRemainingCapacity,
  ).toFixed(10)

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

  const healthFactor = user ? user.healthFactor : "-1"
  const futureHealthFactor = newHealthFactor.toString()

  const shouldRenderHealthFactor =
    healthFactor !== "-1" && futureHealthFactor !== "-1"

  const displayHealthFactorRiskCheckbox =
    !!amount &&
    !newHealthFactor.eq(-1) &&
    newHealthFactor.lt(HEALTH_FACTOR_RISK_THRESHOLD)

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD)

  // error types handling
  let blockingError: ErrorType | undefined = undefined
  if (!poolReserve.borrowingEnabled) {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE
  }

  const handleBlocked = (): Partial<AssetInputProps> => {
    switch (blockingError) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return {
          assetError: `Borrowing is currently unavailable for ${poolReserve.symbol}.`,
        }

      default:
        return {}
    }
  }

  const iconSymbol = poolReserve.iconSymbol

  return (
    <>
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
        <SummaryRow
          label="APY, borrow rate"
          content={
            isArray(ghoBorrowApyRange)
              ? `${formatPercent(ghoBorrowApyRange[0])} - ${formatPercent(ghoBorrowApyRange[1])}`
              : formatPercent(ghoBorrowApyRange)
          }
        />
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
        interestRateMode={InterestRate.Variable}
        symbol={symbol}
        blocked={
          blockingError !== undefined ||
          (displayHealthFactorRiskCheckbox && !healthFactorRiskCheckboxAccepted)
        }
      />
    </>
  )
}
