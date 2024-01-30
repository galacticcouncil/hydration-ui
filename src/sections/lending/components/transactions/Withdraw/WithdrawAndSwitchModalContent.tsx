import { valueToBigNumber } from "@aave/math-utils"
import { ArrowDownIcon } from "@heroicons/react/solid"
import { Box, Checkbox, SvgIcon, Typography } from "@mui/material"
import { useRef, useState } from "react"
import { PriceImpactTooltip } from "sections/lending/components/infoTooltips/PriceImpactTooltip"
import { Warning } from "sections/lending/components/primitives/Warning"
import {
  ComputedUserReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useCollateralSwap } from "sections/lending/hooks/paraswap/useCollateralSwap"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { ListSlippageButton } from "sections/lending/modules/dashboard/lists/SlippageList"
import { calculateHFAfterWithdraw } from "sections/lending/utils/hfUtils"

import {
  Asset,
  AssetInput,
} from "sections/lending/components/transactions/AssetInput"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { ModalWrapperProps } from "sections/lending/components/transactions/FlowCommons/ModalWrapper"
import {
  DetailsHFLine,
  DetailsNumberLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { zeroLTVBlockingWithdraw } from "sections/lending/components/transactions/utils"
import { WithdrawAndSwitchActions } from "./WithdrawAndSwitchActions"
import { WithdrawAndSwitchTxSuccessView } from "./WithdrawAndSwitchSuccess"
import { useWithdrawError } from "./WithdrawError"
import { calculateMaxWithdrawAmount } from "./utils"

export enum ErrorType {
  CAN_NOT_WITHDRAW_THIS_AMOUNT,
  POOL_DOES_NOT_HAVE_ENOUGH_LIQUIDITY,
  ZERO_LTV_WITHDRAW_BLOCKED,
}

export const WithdrawAndSwitchModalContent = ({
  poolReserve,
  userReserve,
  symbol,
  isWrongNetwork,
}: ModalWrapperProps) => {
  const { gasLimit, mainTxState: withdrawTxState, txError } = useModalContext()
  const { currentAccount } = useWeb3Context()
  const { user, reserves } = useAppDataContext()
  const { currentNetworkConfig, currentChainId } = useProtocolDataContext()

  const [_amount, setAmount] = useState("")
  const [riskCheckboxAccepted, setRiskCheckboxAccepted] = useState(false)
  const amountRef = useRef<string>("")
  const [maxSlippage, setMaxSlippage] = useState("0.1")

  let swapTargets = reserves
    .filter((r) => r.underlyingAsset !== poolReserve.underlyingAsset)
    .map((reserve) => ({
      address: reserve.underlyingAsset,
      symbol: reserve.symbol,
      iconSymbol: reserve.iconSymbol,
    }))

  swapTargets = [
    ...swapTargets.filter((r) => r.symbol === "GHO"),
    ...swapTargets.filter((r) => r.symbol !== "GHO"),
  ]

  const [targetReserve, setTargetReserve] = useState<Asset>(swapTargets[0])

  const isMaxSelected = _amount === "-1"

  const swapTarget = user.userReservesData.find(
    (r) => r.underlyingAsset === targetReserve.address,
  ) as ComputedUserReserveData

  const maxAmountToWithdraw = calculateMaxWithdrawAmount(
    user,
    userReserve,
    poolReserve,
  )
  const underlyingBalance = valueToBigNumber(
    userReserve?.underlyingBalance || "0",
  )

  const {
    inputAmountUSD,
    inputAmount,
    outputAmount,
    outputAmountUSD,
    error,
    loading: routeLoading,
    buildTxFn,
  } = useCollateralSwap({
    chainId: currentNetworkConfig.underlyingChainId || currentChainId,
    userAddress: currentAccount,
    swapIn: { ...poolReserve, amount: amountRef.current },
    swapOut: { ...swapTarget.reserve, amount: "0" },
    max: isMaxSelected && maxAmountToWithdraw.eq(underlyingBalance),
    skip: withdrawTxState.loading || false,
    maxSlippage: Number(maxSlippage),
  })

  const loadingSkeleton = routeLoading && outputAmountUSD === "0"
  const unborrowedLiquidity = valueToBigNumber(poolReserve.unborrowedLiquidity)

  const assetsBlockingWithdraw: string[] = zeroLTVBlockingWithdraw(user)

  const withdrawAmount = isMaxSelected
    ? maxAmountToWithdraw.toString(10)
    : _amount

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

  const handleChange = (value: string) => {
    const maxSelected = value === "-1"
    amountRef.current = maxSelected ? maxAmountToWithdraw.toString(10) : value
    setAmount(value)
  }

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
      <WithdrawAndSwitchTxSuccessView
        txHash={withdrawTxState.txHash}
        amount={inputAmount}
        symbol={
          poolReserve.isWrappedBaseAsset
            ? currentNetworkConfig.baseAssetSymbol
            : poolReserve.symbol
        }
        outSymbol={targetReserve.symbol}
        outAmount={outputAmount}
      />
    )

  return (
    <>
      <AssetInput
        inputTitle={<span>Withdraw</span>}
        value={withdrawAmount}
        onChange={handleChange}
        symbol={symbol}
        assets={[
          {
            balance: maxAmountToWithdraw.toString(10),
            symbol: symbol,
            iconSymbol: poolReserve.isWrappedBaseAsset
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
      />

      <Box
        sx={{
          padding: "18px",
          pt: "14px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <SvgIcon sx={{ fontSize: "18px !important" }}>
          <ArrowDownIcon />
        </SvgIcon>

        <PriceImpactTooltip
          loading={loadingSkeleton}
          outputAmountUSD={outputAmountUSD}
          inputAmountUSD={inputAmountUSD}
        />
      </Box>

      <AssetInput
        value={outputAmount}
        onSelect={setTargetReserve}
        usdValue={outputAmountUSD}
        symbol={targetReserve.symbol}
        assets={swapTargets}
        inputTitle={<span>Receive (est.)</span>}
        balanceText={<span>Supply balance</span>}
        disableInput
        loading={loadingSkeleton}
      />

      {error && !loadingSkeleton && (
        <Typography variant="helperText" color="error.main">
          {error}
        </Typography>
      )}

      {blockingError !== undefined && (
        <Typography variant="helperText" color="error.main">
          {errorComponent}
        </Typography>
      )}

      <TxModalDetails
        gasLimit={gasLimit}
        slippageSelector={
          <ListSlippageButton
            selectedSlippage={maxSlippage}
            setSlippage={setMaxSlippage}
          />
        }
      >
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
          <Warning severity="error" sx={{ my: 24 }}>
            <span>
              Withdrawing this amount will reduce your health factor and
              increase risk of liquidation.
            </span>
          </Warning>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              mx: "24px",
              mb: "12px",
            }}
          >
            <Checkbox
              checked={riskCheckboxAccepted}
              onChange={() => {
                setRiskCheckboxAccepted(!riskCheckboxAccepted)
              }}
              size="small"
              data-cy={`risk-checkbox`}
            />
            <Typography variant="description">
              <span>I acknowledge the risks involved.</span>
            </Typography>
          </Box>
        </>
      )}

      <WithdrawAndSwitchActions
        poolReserve={poolReserve}
        targetReserve={swapTarget.reserve}
        amountToSwap={inputAmount}
        amountToReceive={outputAmount}
        isMaxSelected={
          isMaxSelected && maxAmountToWithdraw.eq(underlyingBalance)
        }
        isWrongNetwork={isWrongNetwork}
        blocked={
          blockingError !== undefined ||
          (displayRiskCheckbox && !riskCheckboxAccepted)
        }
        buildTxFn={buildTxFn}
        sx={displayRiskCheckbox ? { mt: 0 } : {}}
      />
    </>
  )
}
