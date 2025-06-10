import {
  calculateHealthFactorFromBalancesBigUnits,
  valueToBigNumber,
} from "@aave/math-utils"

import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"

import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsHFLine,
  DetailsNumberLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { zeroLTVBlockingWithdraw } from "sections/lending/components/transactions/utils"
import { IsolationModeWarning } from "sections/lending/components/transactions/Warnings/IsolationModeWarning"
import { CollateralChangeActions } from "./CollateralChangeActions"
import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"

export type CollateralChangeModalContentProps = {
  underlyingAsset: string
}

export enum ErrorType {
  DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY,
  CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL,
  CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const CollateralChangeModalContent = ({
  poolReserve,
  userReserve,
  isWrongNetwork,
  symbol,
}: ModalWrapperProps) => {
  const { mainTxState: collateralChangeTxState, txError } = useModalContext()
  const { user } = useAppDataContext()
  const { debtCeiling } = useAssetCaps()

  // Health factor calculations
  const usageAsCollateralModeAfterSwitch =
    !userReserve.usageAsCollateralEnabledOnUser
  const currenttotalCollateralMarketReferenceCurrency = valueToBigNumber(
    user.totalCollateralMarketReferenceCurrency,
  )

  // Messages
  const showEnableIsolationModeMsg =
    !poolReserve.isIsolated && usageAsCollateralModeAfterSwitch
  const showDisableIsolationModeMsg =
    !poolReserve.isIsolated && !usageAsCollateralModeAfterSwitch
  const showEnterIsolationModeMsg =
    poolReserve.isIsolated && usageAsCollateralModeAfterSwitch
  const showExitIsolationModeMsg =
    poolReserve.isIsolated && !usageAsCollateralModeAfterSwitch

  const totalCollateralAfterSwitchETH =
    currenttotalCollateralMarketReferenceCurrency[
      usageAsCollateralModeAfterSwitch ? "plus" : "minus"
    ](userReserve.underlyingBalanceMarketReferenceCurrency)

  const healthFactorAfterSwitch = calculateHealthFactorFromBalancesBigUnits({
    collateralBalanceMarketReferenceCurrency: totalCollateralAfterSwitchETH,
    borrowBalanceMarketReferenceCurrency:
      user.totalBorrowsMarketReferenceCurrency,
    currentLiquidationThreshold: user.currentLiquidationThreshold,
  })

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user)

  // error handling
  let blockingError: ErrorType | undefined = undefined
  if (
    assetsBlockingWithdraw.length > 0 &&
    !assetsBlockingWithdraw.includes(poolReserve.symbol)
  ) {
    blockingError = ErrorType.ZERO_LTV_WITHDRAW_BLOCKED
  } else if (valueToBigNumber(userReserve.underlyingBalance).eq(0)) {
    blockingError = ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY
  } else if (
    (!userReserve.usageAsCollateralEnabledOnUser &&
      poolReserve.reserveLiquidationThreshold === "0") ||
    poolReserve.reserveLiquidationThreshold === "0"
  ) {
    blockingError = ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL
  } else if (
    userReserve.usageAsCollateralEnabledOnUser &&
    user.totalBorrowsMarketReferenceCurrency !== "0" &&
    healthFactorAfterSwitch.lte("1")
  ) {
    blockingError = ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE
  }

  // error render handling
  const BlockingError: React.FC = () => {
    switch (blockingError) {
      case ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY:
        return <Text fs={13}>You do not have supplies in this currency</Text>
      case ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL:
        return <Text fs={13}>You can not use this currency as collateral</Text>
      case ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE:
        return (
          <Text fs={13}>
            You can not switch usage as collateral mode for this currency,
            because it will cause collateral call
          </Text>
        )
      case ErrorType.ZERO_LTV_WITHDRAW_BLOCKED:
        return (
          <Text fs={13}>
            Assets with zero LTV ({assetsBlockingWithdraw}) must be withdrawn or
            disabled as collateral to perform this action
          </Text>
        )
      default:
        return null
    }
  }

  if (collateralChangeTxState.success)
    return (
      <TxSuccessView
        collateral={usageAsCollateralModeAfterSwitch}
        symbol={poolReserve.symbol}
      />
    )

  return (
    <>
      <TxModalDetails>
        <DetailsNumberLine
          symbol={poolReserve.symbol}
          iconAddress={poolReserve.underlyingAsset}
          description="Supply balance"
          value={userReserve.underlyingBalance}
        />
        <DetailsHFLine
          visibleHfChange={true}
          healthFactor={user.healthFactor}
          futureHealthFactor={healthFactorAfterSwitch.toString(10)}
        />
      </TxModalDetails>

      {blockingError !== undefined && (
        <Alert variant="error" sx={{ mt: 16 }}>
          <BlockingError />
        </Alert>
      )}

      {showEnableIsolationModeMsg && (
        <Alert variant="warning" sx={{ mt: 12 }}>
          <Text fs={13}>
            Enabling this asset as collateral increases your borrowing power and
            Health Factor. However, it can get liquidated if your health factor
            drops below 1.
          </Text>
        </Alert>
      )}

      {showDisableIsolationModeMsg && (
        <Alert variant="warning" sx={{ mt: 12 }}>
          <Text fs={13}>
            Disabling this asset as collateral affects your borrowing power and
            Health Factor.
          </Text>
        </Alert>
      )}

      {showEnterIsolationModeMsg && (
        <IsolationModeWarning asset={poolReserve.symbol} />
      )}

      {showExitIsolationModeMsg && (
        <Alert variant="info" sx={{ mt: 12 }}>
          <Text fs={13}>
            You will exit isolation mode and other tokens can now be used as
            collateral
          </Text>
        </Alert>
      )}

      {poolReserve.isIsolated &&
        debtCeiling.determineWarningDisplay({ debtCeiling })}

      {txError && <GasEstimationError txError={txError} />}

      <CollateralChangeActions
        symbol={symbol}
        poolReserve={poolReserve}
        usageAsCollateral={usageAsCollateralModeAfterSwitch}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  )
}
