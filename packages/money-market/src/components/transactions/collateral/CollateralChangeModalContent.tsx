import { calculateHealthFactorFromBalancesBigUnits } from "@aave/math-utils"
import { ArrowRight } from "@galacticcouncil/ui/assets/icons"
import {
  Alert,
  Flex,
  Icon,
  Separator,
  Stack,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import Big from "big.js"

import { HealthFactorChange } from "@/components/primitives"
import { ValueDetail } from "@/components/primitives/ValueDetail"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { IsolationModeWarning } from "@/components/warnings/IsolationModeWarning"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useAssetCaps } from "@/hooks/useAssetCaps"
import { zeroLTVBlockingWithdraw } from "@/utils/transactions"

import { CollateralChangeActions } from "./CollateralChangeActions"

export type CollateralChangeModalContentProps = {
  underlyingAsset: string
}

export enum ErrorType {
  DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY,
  CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL,
  CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const CollateralChangeModalContent: React.FC<
  TxModalWrapperRenderProps
> = ({ poolReserve, userReserve, isWrongNetwork, symbol }) => {
  const { user } = useAppDataContext()
  const { debtCeiling } = useAssetCaps()
  const { formatCurrency } = useAppFormatters()

  // Health factor calculations
  const isCollateralEnabled = userReserve.usageAsCollateralEnabledOnUser
  const usageAsCollateralModeAfterSwitch = !isCollateralEnabled
  const currenttotalCollateralMarketReferenceCurrency = Big(
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
    collateralBalanceMarketReferenceCurrency:
      totalCollateralAfterSwitchETH.toString(),
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
  } else if (Big(userReserve.underlyingBalance).eq(0)) {
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
  const getBlockingErrorMessage = () => {
    switch (blockingError) {
      case ErrorType.DO_NOT_HAVE_SUPPLIES_IN_THIS_CURRENCY:
        return "You do not have supplies in this currency."
      case ErrorType.CAN_NOT_USE_THIS_CURRENCY_AS_COLLATERAL:
        return "You can not use this currency as collateral."
      case ErrorType.CAN_NOT_SWITCH_USAGE_AS_COLLATERAL_MODE:
        return "You can not switch usage as collateral mode for this currency, because it will cause collateral call."
      case ErrorType.ZERO_LTV_WITHDRAW_BLOCKED:
        return `Assets with zero LTV (${assetsBlockingWithdraw.join(", ")}) must be withdrawn or disabled as collateral to perform this action.`
      default:
        return ""
    }
  }

  const healthFactor = user ? user.healthFactor : "-1"
  const futureHealthFactor = healthFactorAfterSwitch.toString()

  const shouldRenderHealthFactor =
    healthFactor !== "-1" && futureHealthFactor !== "-1"

  return (
    <>
      <Stack
        mt="var(--modal-content-inset)"
        separated
        separator={<Separator mx="var(--modal-content-inset)" />}
        withTrailingSeparator
      >
        <SummaryRow
          label="Supply balance"
          content={
            <ValueDetail
              value={formatCurrency(userReserve.underlyingBalance, {
                symbol,
              })}
            />
          }
        />
        <SummaryRow
          label="Collateral"
          content={
            <Flex align="center" gap={4}>
              {isCollateralEnabled ? (
                <>
                  <Text color={getToken("accents.success.emphasis")} fw={500}>
                    Enabled
                  </Text>
                  <Icon size={14} component={ArrowRight} />
                  <Text color={getToken("accents.danger.emphasis")} fw={500}>
                    Disabled
                  </Text>
                </>
              ) : (
                <>
                  <Text color={getToken("accents.danger.emphasis")} fw={500}>
                    Disabled
                  </Text>
                  <Icon size={14} component={ArrowRight} />
                  <Text color={getToken("accents.success.emphasis")} fw={500}>
                    Enabled
                  </Text>
                </>
              )}
            </Flex>
          }
        />
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
          {showExitIsolationModeMsg && (
            <Alert
              variant="info"
              description="You will exit isolation mode and other tokens can now be used as collateral"
            />
          )}

          {showEnableIsolationModeMsg && (
            <Alert
              variant="warning"
              description="Enabling this asset as collateral increases your borrowing power and Health Factor. However, it can get liquidated if your health factor drops below 1."
            />
          )}

          {showDisableIsolationModeMsg && (
            <Alert
              variant="warning"
              description="Disabling this asset as collateral affects your borrowing power and Health Factor."
            />
          )}

          {showEnterIsolationModeMsg && (
            <IsolationModeWarning asset={poolReserve.symbol} />
          )}

          {blockingError !== undefined && (
            <Alert variant="error" description={getBlockingErrorMessage()} />
          )}

          {poolReserve.isIsolated &&
            debtCeiling.determineWarningDisplay({ debtCeiling })}
        </Stack>
      </Stack>

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
