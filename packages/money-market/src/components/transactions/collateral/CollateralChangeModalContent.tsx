import {
  DcaScheduleStatus,
  userOrdersQuery,
} from "@galacticcouncil/indexer/squid"
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
import {
  getAssetIdFromAddress,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useState } from "react"

import {
  HealthFactorChange,
  HealthFactorRiskWarning,
} from "@/components/primitives"
import { ValueDetail } from "@/components/primitives/ValueDetail"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { IsolationModeWarning } from "@/components/warnings/IsolationModeWarning"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useAssetCaps } from "@/hooks/useAssetCaps"
import { useSharedDependencies } from "@/ui-config/SharedDependenciesProvider"
import {
  calculateHFAfterSupply,
  calculateHFAfterWithdraw,
  formatHealthFactorResult,
} from "@/utils/hfUtils"
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
> = ({ poolReserve, userReserve, symbol }) => {
  const { user } = useAppDataContext()
  const { debtCeiling } = useAssetCaps()
  const { formatCurrency } = useAppFormatters()
  const { squidClient } = useSharedDependencies()

  const { account } = useAccount()
  const address = safeConvertSS58toPublicKey(account?.address ?? "")

  // Health factor calculations
  const isCollateralEnabled = userReserve.usageAsCollateralEnabledOnUser
  const usageAsCollateralModeAfterSwitch = !isCollateralEnabled

  const { data: openOrders } = useQuery(
    userOrdersQuery(
      squidClient,
      address,
      [DcaScheduleStatus.Created],
      [],
      undefined,
      undefined,
      usageAsCollateralModeAfterSwitch,
    ),
  )

  const assetId = getAssetIdFromAddress(poolReserve.underlyingAsset)

  const hasOpenBudgetDca = openOrders?.dcaSchedules?.nodes
    .filter((node) => node?.budgetAmountIn === "0")
    .some((node) => node?.assetIn?.underlyingAssetId === assetId)

  const [healthFactorRiskAccepted, setHealthFactorRiskAccepted] =
    useState(false)

  // Messages
  const showEnableIsolationModeInfo =
    !poolReserve.isIsolated && usageAsCollateralModeAfterSwitch
  const showEnableIsolationModeWarning =
    hasOpenBudgetDca && usageAsCollateralModeAfterSwitch
  const showEnterIsolationModeMsg =
    poolReserve.isIsolated && usageAsCollateralModeAfterSwitch
  const showExitIsolationModeMsg =
    poolReserve.isIsolated && !usageAsCollateralModeAfterSwitch

  const healthFactorAfterSwitch = usageAsCollateralModeAfterSwitch
    ? calculateHFAfterSupply({
        user,
        poolReserve,
        supplyAmount: userReserve.underlyingBalance.toString(),
      })
    : calculateHFAfterWithdraw({
        user,
        userReserve,
        poolReserve,
        withdrawAmount: userReserve.underlyingBalance.toString(),
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

  const hf = formatHealthFactorResult({
    currentHF: healthFactor,
    futureHF: futureHealthFactor,
  })

  const isHealthFactorCheckSatisfied = hf.isUserConsentRequired
    ? healthFactorRiskAccepted
    : true

  const isOpenBudgetDcaCheckSatisfies = !isCollateralEnabled
    ? !hasOpenBudgetDca
    : true

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
            <Flex align="center" gap="s">
              {isCollateralEnabled ? (
                <>
                  <Text color={getToken("accents.success.emphasis")} fw={500}>
                    Enabled
                  </Text>
                  <Icon size="s" component={ArrowRight} />
                  <Text color={getToken("accents.danger.emphasis")} fw={500}>
                    Disabled
                  </Text>
                </>
              ) : (
                <>
                  <Text color={getToken("accents.danger.emphasis")} fw={500}>
                    Disabled
                  </Text>
                  <Icon size="s" component={ArrowRight} />
                  <Text color={getToken("accents.success.emphasis")} fw={500}>
                    Enabled
                  </Text>
                </>
              )}
            </Flex>
          }
        />
        <SummaryRow
          label="Health Factor"
          content={<HealthFactorChange {...hf} />}
        />
        <Stack gap="m" py="m">
          {showExitIsolationModeMsg && (
            <Alert
              variant="info"
              description="You will exit isolation mode and other tokens can now be used as collateral"
            />
          )}

          {showEnableIsolationModeInfo && (
            <Alert
              variant="info"
              description="Enabling this asset as collateral increases your borrowing power and Health Factor. However, it can get liquidated if your health factor drops below 1."
            />
          )}

          {showEnableIsolationModeWarning && (
            <Alert
              variant="warning"
              description="In order to enable this asset as collateral please cancel your open budget DCA."
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

          {hf.isUserConsentRequired && (
            <HealthFactorRiskWarning
              message="Disabling this asset as collateral affects your borrowing power and Health Factor."
              accepted={healthFactorRiskAccepted}
              isUserConsentRequired={hf.isUserConsentRequired}
              onAcceptedChange={setHealthFactorRiskAccepted}
            />
          )}
        </Stack>
      </Stack>

      <CollateralChangeActions
        symbol={symbol}
        poolReserve={poolReserve}
        usageAsCollateral={usageAsCollateralModeAfterSwitch}
        blocked={
          blockingError !== undefined ||
          !isHealthFactorCheckSatisfied ||
          !isOpenBudgetDcaCheckSatisfies
        }
      />
    </>
  )
}
