import { Separator, Stack, SummaryRow } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useRef, useState } from "react"

import { AssetInput, HealthFactorChange } from "@/components/primitives"
import { HealthFactorRiskWarning } from "@/components/primitives/HealthFactorRiskWarning"
import { ValueDetail } from "@/components/primitives/ValueDetail"
import { TxModalWrapperRenderProps } from "@/components/transactions/TxModalWrapper"
import { useAppDataContext } from "@/hooks/app-data-provider/useAppDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { useModalContext } from "@/hooks/useModal"
import { HEALTH_FACTOR_RISK_THRESHOLD } from "@/ui-config/misc"
import { calculateHFAfterWithdraw } from "@/utils/hfUtils"
import { zeroLTVBlockingWithdraw } from "@/utils/transactions"

import { WithdrawActions } from "./WithdrawActions"
import { useWithdrawError } from "./WithdrawError"
import { calculateMaxWithdrawAmount } from "./WithdrawModalContent.utils"

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawModalContent: React.FC<TxModalWrapperRenderProps> = ({
  poolReserve,
  userReserve,
  symbol,
}) => {
  const { formatCurrency } = useAppFormatters()
  const { mainTxState: withdrawTxState } = useModalContext()
  const { user } = useAppDataContext()

  const [_amount, setAmount] = useState("")
  const [withdrawMax, setWithdrawMax] = useState("")
  const [
    healthFactorRiskCheckboxAccepted,
    setHealthFactorRiskCheckboxAccepted,
  ] = useState(false)
  const amountRef = useRef<string>("")
  const isMaxSelected = _amount === "-1"
  const maxAmountToWithdraw = calculateMaxWithdrawAmount(
    user,
    userReserve,
    poolReserve,
  )
  const underlyingBalance = Big(userReserve?.underlyingBalance || "0")
  const withdrawAmount = isMaxSelected
    ? maxAmountToWithdraw.toString()
    : _amount

  const isMaxExceeded =
    !!withdrawAmount && Big(withdrawAmount).gt(maxAmountToWithdraw)

  const handleChange = (value: string) => {
    const maxSelected = value === "-1"
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString() : value
    setAmount(value)
    if (maxSelected && maxAmountToWithdraw.eq(underlyingBalance)) {
      setWithdrawMax("-1")
    } else {
      setWithdrawMax(maxAmountToWithdraw.toString())
    }
  }

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user)

  const healthFactorAfterWithdraw = calculateHFAfterWithdraw({
    user,
    userReserve,
    poolReserve,
    withdrawAmount,
  })

  const { blockingError, errorText } = useWithdrawError({
    assetsBlockingWithdraw,
    poolReserve,
    healthFactorAfterWithdraw,
    withdrawAmount,
  })

  const displayHealthFactorRiskCheckbox =
    !!withdrawAmount &&
    !healthFactorAfterWithdraw.eq(-1) &&
    healthFactorAfterWithdraw.lt(HEALTH_FACTOR_RISK_THRESHOLD) &&
    userReserve.usageAsCollateralEnabledOnUser

  // calculating input usd value
  const usdValue = Big(withdrawAmount || "0").mul(
    userReserve?.reserve.priceInUSD || 0,
  )

  const healthFactor = user ? user.healthFactor : "-1"
  const futureHealthFactor = healthFactorAfterWithdraw.toString()

  const shouldRenderHealthFactor =
    healthFactor !== "-1" && futureHealthFactor !== "-1"

  return (
    <>
      <AssetInput
        value={withdrawAmount}
        onChange={handleChange}
        displayValue={usdValue.toString()}
        symbol={symbol}
        assets={[
          {
            balance: maxAmountToWithdraw.toString(),
            symbol: symbol,
            iconSymbol: poolReserve.iconSymbol,
            address: poolReserve.underlyingAsset,
          },
        ]}
        disabled={withdrawTxState.loading}
        maxButtonBalance={maxAmountToWithdraw.toString()}
        balanceLabel="Withdrawable balance"
        amountError={
          isMaxExceeded ? "Insufficient balance on your account." : errorText
        }
      />

      <Separator mx="var(--modal-content-inset)" />

      <Stack
        separated
        separator={<Separator mx="var(--modal-content-inset)" />}
        withTrailingSeparator
      >
        <SummaryRow
          label="Remaining supply"
          content={
            <ValueDetail
              value={formatCurrency(
                underlyingBalance.minus(withdrawAmount || "0").toString(),
                {
                  symbol,
                },
              )}
            />
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

        {displayHealthFactorRiskCheckbox && (
          <HealthFactorRiskWarning
            py="m"
            message="Withdrawing this amount will reduce your health factor and increase risk of liquidation."
            accepted={healthFactorRiskCheckboxAccepted}
            onAcceptedChange={setHealthFactorRiskCheckboxAccepted}
            isUserConsentRequired
          />
        )}
      </Stack>

      <WithdrawActions
        poolReserve={poolReserve}
        amountToWithdraw={isMaxSelected ? withdrawMax : withdrawAmount}
        poolAddress={poolReserve.underlyingAsset}
        symbol={symbol}
        blocked={
          blockingError !== undefined ||
          (displayHealthFactorRiskCheckbox &&
            !healthFactorRiskCheckboxAccepted) ||
          isMaxExceeded
        }
      />
    </>
  )
}
