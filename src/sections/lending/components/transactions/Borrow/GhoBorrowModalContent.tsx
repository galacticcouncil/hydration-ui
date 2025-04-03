import { InterestRate } from "@aave/contract-helpers"
import {
  calculateHealthFactorFromBalancesBigUnits,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useState } from "react"
import { CapType } from "sections/lending/components/caps/helper"
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
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsHFLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"
import { AssetInput } from "sections/lending/ui/transactions/AssetInput"
import { getMaxGhoMintAmount } from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { weightedAverageAPY } from "sections/lending/utils/ghoUtilities"
import { roundToTokenDecimals } from "sections/lending/utils/utils"
import { BorrowActions } from "./BorrowActions"
import { BorrowAmountWarning } from "./BorrowAmountWarning"
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
    <Row sx={{ flexDirection: "column", mb: 4 }} caption={<APYTypeTooltip />}>
      <div color="primary">
        <Button
          variant={
            interestRateMode === InterestRate.Variable ? "primary" : "secondary"
          }
          disabled={interestRateMode === InterestRate.Variable}
          onClick={() => setInterestRateMode(InterestRate.Variable)}
        >
          <Text sx={{ mr: 4 }}>Variable</Text>
          <FormattedNumber value={variableRate} percent />
        </Button>
        <Button
          variant={
            interestRateMode === InterestRate.Stable ? "primary" : "secondary"
          }
          disabled={interestRateMode === InterestRate.Stable}
          onClick={() => setInterestRateMode(InterestRate.Stable)}
        >
          <Text sx={{ mr: 4 }}>Stable</Text>
          <FormattedNumber value={stableRate} percent />
        </Button>
      </div>
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
  // const userStakedAaveBalance = ghoUserData.userDiscountTokenBalance
  // const discountAvailable = ghoUserQualifiesForDiscount(amount)

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
      <TxSuccessView
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
        name="borrow-amount"
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
        sx={{ mb: 20 }}
      />

      {blockingError !== undefined && (
        <Text color="red400">
          <BlockingError />
        </Text>
      )}

      <TxModalDetails>
        <DetailsHFLine
          visibleHfChange={!!amount}
          healthFactor={user.healthFactor}
          futureHealthFactor={newHealthFactor.toString(10)}
        />
        <Row
          sx={{ mb: 12 }}
          captionColor="basic400"
          caption={
            <div sx={{ flex: "row", gap: 4, align: "center" }}>
              <span>APY, Borrow rate</span>
              <FixedAPYTooltip />
            </div>
          }
        >
          <BorrowAPY
            ghoLoadingData={ghoLoadingData}
            hasGhoBorrowPositions={hasGhoBorrowPositions}
            borrowAmount={amount}
            discountAvailable={false}
            userDiscountTokenBalance={ghoUserData.userDiscountTokenBalance}
            underlyingAsset={underlyingAsset}
            customMarket={customMarket}
            currentBorrowAPY={currentBorrowAPY}
            futureBorrowAPY={futureBorrowAPY}
            onDetailsClick={() => closeModal()}
          />
        </Row>
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

      <ParameterChangewarning sx={{ mt: 20 }} />

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

  const sharedIncentiveProps: Omit<
    GhoIncentivesCardProps,
    "value" | "borrowAmount"
  > = {
    stkAaveBalance: userDiscountTokenBalance || 0,
    ghoRoute:
      ROUTES.reserveOverview(underlyingAsset, customMarket) + "/#discount",
    userQualifiesForDiscount: discountAvailable,
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
              <Icon size={14} icon={<ArrowRightIcon />} />
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
