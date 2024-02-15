import { InterestRate } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"
import { ArrowNarrowRightIcon } from "@heroicons/react/solid"
import { Box, SvgIcon, Typography } from "@mui/material"
import { useState } from "react"
import {
  GhoIncentivesCard,
  GhoIncentivesCardProps,
} from "sections/lending/components/incentives/GhoIncentivesCard"
import { APYTypeTooltip } from "sections/lending/components/infoTooltips/APYTypeTooltip"
import { FixedAPYTooltip } from "sections/lending/components/infoTooltips/FixedAPYTooltip"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { NoData } from "sections/lending/components/primitives/NoData"
import { Row } from "sections/lending/components/primitives/Row"
import { StyledTxModalToggleButton } from "sections/lending/components/StyledToggleButton"
import { StyledTxModalToggleGroup } from "sections/lending/components/StyledToggleButtonGroup"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"
import { getMaxGhoMintAmount } from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { weightedAverageAPY } from "sections/lending/utils/ghoUtilities"
import { roundToTokenDecimals } from "sections/lending/utils/utils"

import { CapType } from "sections/lending/components/caps/helper"
import { AssetInput } from "sections/lending/components/transactions/AssetInput"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import {
  DetailsHFLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { BorrowActions } from "./BorrowActions"
import { BorrowAmountWarning } from "./BorrowAmountWarning"
import { GhoBorrowSuccessView } from "./GhoBorrowSuccessView"
import { ParameterChangewarning } from "./ParameterChangewarning"

export enum ErrorType {
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

const BorrowModeSwitch = ({
  setInterestRateMode,
  interestRateMode,
  variableRate,
  stableRate,
}: BorrowModeSwitchProps) => {
  return (
    <Row
      caption={
        <APYTypeTooltip
          text={<span>Borrow APY rate</span>}
          key="APY type_modal"
        />
      }
    >
      <StyledTxModalToggleGroup
        color="primary"
        value={interestRateMode}
        exclusive
        onChange={(_, value) => setInterestRateMode(value)}
        sx={{ mt: 0.5 }}
      >
        <StyledTxModalToggleButton
          value={InterestRate.Variable}
          disabled={interestRateMode === InterestRate.Variable}
        >
          <Typography variant="buttonM" sx={{ mr: 4 }}>
            <span>Variable</span>
          </Typography>
          <FormattedNumber value={variableRate} percent variant="secondary14" />
        </StyledTxModalToggleButton>
        <StyledTxModalToggleButton
          value={InterestRate.Stable}
          disabled={interestRateMode === InterestRate.Stable}
        >
          <Typography variant="buttonM" sx={{ mr: 4 }}>
            <span>Stable</span>
          </Typography>
          <FormattedNumber value={stableRate} percent variant="secondary14" />
        </StyledTxModalToggleButton>
      </StyledTxModalToggleGroup>
    </Row>
  )
}

export const GhoBorrowModalContent = ({
  underlyingAsset,
  isWrongNetwork,
  poolReserve,
  userReserve,
  symbol,
}: ModalWrapperProps) => {
  const {
    mainTxState: borrowTxState,
    gasLimit,
    txError,
    close: closeModal,
  } = useModalContext()
  const {
    user,
    marketReferencePriceInUsd,
    ghoReserveData,
    ghoUserData,
    ghoLoadingData,
  } = useAppDataContext()
  const ghoUserQualifiesForDiscount = useRootStore(
    (state) => state.ghoUserQualifiesForDiscount,
  )
  const { borrowCap } = useAssetCaps()

  const { currentMarket: customMarket } = useProtocolDataContext()

  const [interestRateMode, setInterestRateMode] = useState<InterestRate>(
    InterestRate.Variable,
  )
  const [amount, setAmount] = useState("")
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false)

  // Check if user has any open borrow positions on GHO
  // Check if user can borrow at a discount
  const hasGhoBorrowPositions = ghoUserData.userGhoBorrowBalance > 0
  const userStakedAaveBalance: number = ghoUserData.userDiscountTokenBalance
  const discountAvailable = ghoUserQualifiesForDiscount(amount)

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

  const isMaxSelected = amount === maxAmountToBorrow

  // health factor calculations
  const amountToBorrowInUsd = valueToBigNumber(amount)
    .multipliedBy(poolReserve.formattedPriceInMarketReferenceCurrency)
    .multipliedBy(marketReferencePriceInUsd)
    .shiftedBy(-USD_DECIMALS)

  const newHealthFactor = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: user.totalCollateralUSD,
    borrowBalanceMarketReferenceCurrency: valueToBigNumber(
      user.totalBorrowsUSD,
    ).plus(amountToBorrowInUsd),
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  })
  const displayRiskCheckbox =
    newHealthFactor.toNumber() < 1.5 && newHealthFactor.toString() !== "-1"

  // calculating input usd value
  const usdValue = valueToBigNumber(amount).multipliedBy(poolReserve.priceInUSD)

  const currentDiscountedAmount =
    ghoUserData.userGhoBorrowBalance >=
    ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0
  const currentBorrowAPY = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    currentDiscountedAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  )

  const futureDiscountedAmount =
    ghoUserData.userGhoBorrowBalance + Number(amount) >=
    ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0
  const futureBorrowAPY = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance + Number(amount),
    futureDiscountedAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  )

  // error types handling
  let blockingError: ErrorType | undefined = undefined
  if (
    interestRateMode === InterestRate.Stable &&
    !poolReserve.stableBorrowRateEnabled
  ) {
    blockingError = ErrorType.STABLE_RATE_NOT_ENABLED
  } else if (
    interestRateMode === InterestRate.Stable &&
    userReserve?.usageAsCollateralEnabledOnUser &&
    valueToBigNumber(amount).lt(userReserve?.underlyingBalance || 0)
  ) {
    blockingError = ErrorType.NOT_ENOUGH_BORROWED
  } else if (!poolReserve.borrowingEnabled) {
    blockingError = ErrorType.BORROWING_NOT_AVAILABLE
  }

  // error render handling
  const BlockingError = () => {
    switch (blockingError) {
      case ErrorType.BORROWING_NOT_AVAILABLE:
        return (
          <span>
            Borrowing is currently unavailable for {poolReserve.symbol}.
          </span>
        )
      case ErrorType.NOT_ENOUGH_BORROWED:
        return (
          <span>
            You can borrow this asset with a stable rate only if you borrow more
            than the amount you are supplying as collateral.
          </span>
        )
      case ErrorType.STABLE_RATE_NOT_ENABLED:
        return <span>The Stable Rate is not enabled for this currency</span>
      default:
        return <></>
    }
  }

  const iconSymbol = poolReserve.iconSymbol

  if (borrowTxState.success)
    return (
      <GhoBorrowSuccessView
        action={<span>Borrowed</span>}
        amount={amount}
        symbol={iconSymbol}
      />
    )

  return (
    <>
      {borrowCap.determineWarningDisplay({ borrowCap })}

      {poolReserve.stableBorrowRateEnabled && (
        <BorrowModeSwitch
          interestRateMode={interestRateMode}
          setInterestRateMode={setInterestRateMode}
          variableRate={poolReserve.variableBorrowAPY}
          stableRate={poolReserve.stableBorrowAPY}
        />
      )}

      <AssetInput
        value={amount}
        onChange={handleChange}
        usdValue={usdValue.toString(10)}
        assets={[
          {
            balance: maxAmountToBorrow,
            symbol,
            iconSymbol,
          },
        ]}
        symbol={symbol}
        capType={CapType.borrowCap}
        isMaxSelected={isMaxSelected}
        maxValue={maxAmountToBorrow}
        balanceText={<span>Available</span>}
      />

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          <BlockingError />
        </Typography>
      )}

      <TxModalDetails gasLimit={gasLimit}>
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
        <Row
          caption={
            <Box>
              <FixedAPYTooltip text={<span>APY, borrow rate</span>} />
            </Box>
          }
        >
          <Box sx={{ textAlign: "right" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <BorrowAPY
                ghoLoadingData={ghoLoadingData}
                hasGhoBorrowPositions={hasGhoBorrowPositions}
                borrowAmount={amount}
                discountAvailable={discountAvailable}
                userDiscountTokenBalance={ghoUserData.userDiscountTokenBalance}
                underlyingAsset={underlyingAsset}
                customMarket={customMarket}
                currentBorrowAPY={currentBorrowAPY}
                futureBorrowAPY={futureBorrowAPY}
                onDetailsClick={() => closeModal()}
              />
            </Box>
          </Box>
        </Row>
        {discountAvailable && (
          <Typography variant="helperText" color="text.secondary">
            <span>
              Discount applied for{" "}
              <FormattedNumber
                variant="helperText"
                color="text.secondary"
                visibleDecimals={2}
                value={userStakedAaveBalance}
              />{" "}
              staking AAVE
            </span>
          </Typography>
        )}
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <BorrowAmountWarning
          riskCheckboxAccepted={riskCheckboxAccepted}
          onRiskCheckboxChange={() => {
            setRiskCheckboxAccepted(!riskCheckboxAccepted)
          }}
        />
      )}

      <ParameterChangewarning underlyingAsset={underlyingAsset} />

      <BorrowActions
        poolReserve={poolReserve}
        amountToBorrow={amount}
        poolAddress={poolReserve.underlyingAsset}
        interestRateMode={interestRateMode}
        isWrongNetwork={isWrongNetwork}
        symbol={symbol}
        blocked={
          blockingError !== undefined ||
          (displayRiskCheckbox && !riskCheckboxAccepted)
        }
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  )
}

interface BorrowAPYProps {
  ghoLoadingData: boolean
  hasGhoBorrowPositions: boolean
  borrowAmount: string
  discountAvailable: boolean
  userDiscountTokenBalance: number
  underlyingAsset: string
  customMarket: CustomMarket
  currentBorrowAPY: number
  futureBorrowAPY: number
  onDetailsClick: () => void
}
const BorrowAPY = ({
  ghoLoadingData,
  hasGhoBorrowPositions,
  borrowAmount,
  discountAvailable,
  userDiscountTokenBalance,
  underlyingAsset,
  customMarket,
  currentBorrowAPY,
  futureBorrowAPY,
  onDetailsClick,
}: BorrowAPYProps) => {
  if (
    ghoLoadingData ||
    (!hasGhoBorrowPositions && borrowAmount === "" && discountAvailable)
  ) {
    return <NoData />
  }

  type SharedIncentiveProps = Omit<
    GhoIncentivesCardProps,
    "value" | "borrowAmount"
  > & {
    "data-cy": string
  }

  const sharedIncentiveProps: SharedIncentiveProps = {
    stkAaveBalance: userDiscountTokenBalance || 0,
    ghoRoute:
      ROUTES.reserveOverview(underlyingAsset, customMarket) + "/#discount",
    userQualifiesForDiscount: discountAvailable,
    "data-cy": `apyType`,
  }

  if (!hasGhoBorrowPositions && borrowAmount !== "") {
    return (
      <GhoIncentivesCard
        withTokenIcon={discountAvailable}
        value={futureBorrowAPY}
        {...sharedIncentiveProps}
      />
    )
  }

  if (hasGhoBorrowPositions && borrowAmount === "") {
    return (
      <GhoIncentivesCard
        withTokenIcon={discountAvailable}
        value={currentBorrowAPY}
        onMoreDetailsClick={onDetailsClick}
        {...sharedIncentiveProps}
      />
    )
  }

  if (!discountAvailable) {
    return (
      <GhoIncentivesCard
        value={currentBorrowAPY}
        onMoreDetailsClick={onDetailsClick}
        {...sharedIncentiveProps}
      />
    )
  }

  if (discountAvailable) {
    return (
      <>
        <GhoIncentivesCard
          withTokenIcon
          value={currentBorrowAPY}
          onMoreDetailsClick={onDetailsClick}
          {...sharedIncentiveProps}
        />
        {!!borrowAmount && (
          <>
            {hasGhoBorrowPositions && (
              <SvgIcon color="primary" sx={{ fontSize: "14px", mx: 4 }}>
                <ArrowNarrowRightIcon />
              </SvgIcon>
            )}
            <GhoIncentivesCard
              value={ghoLoadingData ? -1 : futureBorrowAPY}
              {...sharedIncentiveProps}
            />
          </>
        )}
      </>
    )
  }

  return <NoData />
}
