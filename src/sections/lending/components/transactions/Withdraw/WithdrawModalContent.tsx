import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import { valueToBigNumber } from "@aave/math-utils"
import { useRef, useState } from "react"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { calculateHFAfterWithdraw } from "sections/lending/utils/hfUtils"

import { Alert } from "components/Alert"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsHFLine,
  DetailsNumberLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { zeroLTVBlockingWithdraw } from "sections/lending/components/transactions/utils"
import { AssetInput } from "sections/lending/ui/transactions/AssetInput"
import { WithdrawActions } from "./WithdrawActions"
import { useWithdrawError } from "./WithdrawError"
import { calculateMaxWithdrawAmount } from "./utils"
import { Text } from "components/Typography/Text/Text"
import { CheckBox } from "components/CheckBox/CheckBox"

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawModalContent = ({
  poolReserve,
  userReserve,
  unwrap: withdrawUnWrapped,
  setUnwrap: setWithdrawUnWrapped,
  symbol,
  isWrongNetwork,
}: ModalWrapperProps & {
  unwrap: boolean
  setUnwrap: (unwrap: boolean) => void
}) => {
  const { mainTxState: withdrawTxState, txError } = useModalContext()
  const { user } = useAppDataContext()
  const { currentNetworkConfig } = useProtocolDataContext()

  const [_amount, setAmount] = useState("")
  const [withdrawMax, setWithdrawMax] = useState("")
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false)
  const amountRef = useRef<string>("")
  const isMaxSelected = _amount === "-1"
  const maxAmountToWithdraw = calculateMaxWithdrawAmount(
    user,
    userReserve,
    poolReserve,
  )
  const underlyingBalance = valueToBigNumber(
    userReserve?.underlyingBalance || "0",
  )
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity)
  const withdrawAmount = isMaxSelected
    ? maxAmountToWithdraw.toString(10)
    : _amount

  const handleChange = (value: string) => {
    const maxSelected = value === "-1"
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString(10) : value
    setAmount(value)
    if (maxSelected && maxAmountToWithdraw.eq(underlyingBalance)) {
      setWithdrawMax("-1")
    } else {
      setWithdrawMax(maxAmountToWithdraw.toString(10))
    }
  }

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user)

  const healthFactorAfterWithdraw = calculateHFAfterWithdraw({
    user,
    userReserve,
    poolReserve,
    withdrawAmount,
  })

  const { blockingError, errorComponent } = useWithdrawError({
    assetsBlockingWithdraw,
    poolReserve,
    healthFactorAfterWithdraw,
    withdrawAmount,
  })

  const displayRiskCheckbox =
    healthFactorAfterWithdraw.toNumber() >= 1 &&
    healthFactorAfterWithdraw.toNumber() < 1.5 &&
    userReserve.usageAsCollateralEnabledOnUser

  // calculating input usd value
  const usdValue = valueToBigNumber(withdrawAmount).multipliedBy(
    userReserve?.reserve.priceInUSD || 0,
  )

  if (withdrawTxState.success)
    return (
      <TxSuccessView
        action={<span>withdrew</span>}
        amount={amountRef.current}
        symbol={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? currentNetworkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
      />
    )

  return (
    <>
      <AssetInput
        name="withdraw-amount"
        value={withdrawAmount}
        onChange={handleChange}
        symbol={symbol}
        assets={[
          {
            balance: maxAmountToWithdraw.toString(10),
            symbol: symbol,
            iconSymbol:
              withdrawUnWrapped && poolReserve.isWrappedBaseAsset
                ? currentNetworkConfig.baseAssetSymbol
                : poolReserve.iconSymbol,
          },
        ]}
        usdValue={usdValue.toString(10)}
        isMaxSelected={isMaxSelected}
        disabled={withdrawTxState.loading}
        maxValue={maxAmountToWithdraw.toString(10)}
        balanceText={
          unborrowedLiquidity.lt(underlyingBalance) ? (
            <span>Available</span>
          ) : (
            <span>Supply balance</span>
          )
        }
        sx={{ mb: 20 }}
      />

      {blockingError !== undefined && (
        <Text fs={13} color="red400" sx={{ mt: 4 }}>
          {errorComponent}
        </Text>
      )}

      <TxModalDetails>
        <DetailsNumberLine
          description={<span>Remaining supply</span>}
          value={underlyingBalance.minus(withdrawAmount || "0").toString(10)}
          symbol={
            poolReserve.isWrappedBaseAsset
              ? currentNetworkConfig.baseAssetSymbol
              : poolReserve.symbol
          }
        />
        <DetailsHFLine
          visibleHfChange={!!_amount}
          healthFactor={user ? user.healthFactor : "-1"}
          futureHealthFactor={healthFactorAfterWithdraw.toString(10)}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      {displayRiskCheckbox && (
        <>
          <Alert variant="error" sx={{ my: 12 }}>
            <Text fs={13}>
              Withdrawing this amount will reduce your health factor and
              increase risk of liquidation.
            </Text>
          </Alert>
          <div sx={{ flex: "row", align: "center" }}>
            <CheckBox
              label={
                <Text fs={14} lh={28}>
                  I acknowledge the risks involved.
                </Text>
              }
              checked={riskCheckboxAccepted}
              onChange={() => {
                setRiskCheckboxAccepted(!riskCheckboxAccepted)
              }}
            />
          </div>
        </>
      )}

      <WithdrawActions
        poolReserve={poolReserve}
        amountToWithdraw={isMaxSelected ? withdrawMax : withdrawAmount}
        poolAddress={
          withdrawUnWrapped && poolReserve.isWrappedBaseAsset
            ? API_ETH_MOCK_ADDRESS
            : poolReserve.underlyingAsset
        }
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
